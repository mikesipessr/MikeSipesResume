---
title: Teaching the Agent to Actually Think
date: 2026-05-03
description: Giving the healthcare voice agent a real reasoning step — it now reviews lab results, explains what it sees, and chooses whether to escalate, order more diagnostics, or simply document and monitor.
slug: teaching-the-agent-to-actually-think
cover: /Files/blog/teaching-the-agent-to-actually-think.png
coverAlt: Teaching the Agent to Actually Think
hideTitle: true
---
*Part 4 of an ongoing series building a healthcare voice-to-workflow AI demo with Semantic Kernel*

*Previous posts: [Part 1 — From Voice to Structured Data](https://mikesipes.me/blog/from-voice-to-structured-data-building-healthcare-ai-demo-semantic-kernel) · [Part 2 — Teaching the Assistant to Actually Do Things](https://mikesipes.me/blog/teaching-the-healthcare-assistant-to-actually-do-things) · [Part 3 — Making the Healthcare Demo Actually Think Before It Acts](https://mikesipes.me/blog/making-the-healthcare-demo-actually-think-before-it-acts)*

*The full code is on GitHub: [mikesipessr/SemanticKernelHealthcare](https://github.com/mikesipessr/SemanticKernelHealthcare)*

---

> **Reminder:** This is a demo. Real healthcare workflows involve PHI, and you need a Business Associate Agreement (BAA) with any AI vendor before patient data touches their systems. This project has none of that. It is for learning purposes only.

---

So far in this series we've gone from "speak a clinical note and get structured tasks" all the way to a real agentic loop — the AI picks tools, calls them in sequence, validates its work, and reports back in real time via SignalR. The three-phase pipeline (retrieve data → validate → execute or warn) is working, and it's genuinely satisfying to watch the steps tick by on the task cards.

But something has been bothering me.

## The Problem With Pass/Fail

Look at how the LabOrder pipeline works today. The agent calls `GetPastLabOrders`, then calls `ValidateLabOrderIndication`, which returns something like this:

```json
{
  "validationPassed": true,
  "validationFailed": null
}
```

The agent reads that, sees `validationFailed` is null, and calls `SubmitLabOrder`. Done.

Is that reasoning? Not really. The agent isn't *thinking* about anything — it's checking a flag. There's no difference between that and an `if` statement. I might as well have written the code myself and skipped the language model entirely.

What I wanted was something more like: the agent reads actual data, understands what it's looking at, and makes a judgment call. The kind of thing where the output changes not because a boolean flipped, but because the situation is genuinely different.

## A Detour (and a Correction)

My first instinct was to add a `GetLabResults` tool to the LabOrder pipeline — have the agent pull back actual values with reference ranges and flags, then reason about whether to escalate, order more tests, or just document the findings.

I built it. It worked pretty well, actually. Then I stopped and thought about it for a second.

Lab *orders* are for ordering labs that haven't been run yet. If a doctor says "order a CBC for Jane Smith," there are no results — you're creating a requisition. The validation there is "is this order indicated and does it duplicate a recent test?" That's what the existing pipeline does, and it's correct.

What I had actually built was a *lab result review* workflow — something that kicks in after the results come back and someone needs to decide what to do with them. That's a completely different clinical scenario, and it deserved its own task type.

So: `LabResultReview` is now a thing. The classifier prompt got updated to distinguish between "order a CBC for Jane Smith" (`LabOrder`) and "Jane Smith's CBC came back with low hemoglobin" (`LabResultReview`). The LabOrder pipeline is unchanged. The reasoning pipeline lives where it belongs.

## How It Works

When the classifier identifies a `LabResultReview` task, the agent skips the validation phase entirely (there's nothing to validate — the results are already there) and goes straight to a two-step flow:

**Step 1: `GetLabResults`**

This returns a full lab panel with actual measured values, reference ranges, and flags:

```json
{
  "panelName": "Comprehensive Metabolic Panel with CBC",
  "results": [
    { "analyte": "WBC",  "value": 12.5, "unit": "K/uL",  "referenceRange": "4.0–11.0", "flag": "HIGH" },
    { "analyte": "Hgb",  "value": 9.8,  "unit": "g/dL",  "referenceRange": "12.0–16.0", "flag": "LOW"  },
    { "analyte": "MCV",  "value": 72.0, "unit": "fL",    "referenceRange": "80–100",    "flag": "LOW"  },
    ...
  ]
}
```

For demo purposes it randomizes between three scenarios — a critical picture, a borderline-abnormal picture, and a normal picture — so you can see all three decision paths without having to know what to say.

**Step 2: The Agent Decides**

The agent has three tools to choose from:

- `EscalateCriticalLabValues` — for CRITICAL flags or a combination of values that suggests the patient is in trouble
- `OrderAdditionalDiagnostics` — for HIGH/LOW flags where more data would help (classic "the hemoglobin is low and the MCV is low, so let's check an iron panel and reticulocyte count" situation)
- `DocumentAndMonitor` — for normal or near-normal results where no action is needed yet

The key word is *decides*. The system prompt doesn't tell it which tool to call — it tells it to read the values, consider the clinical picture, and figure it out.

## Surfacing the Reasoning

Here's the part I'm most pleased with.

Between calling `GetLabResults` and calling the follow-up tool, the model writes its analysis. Something like: "WBC is elevated at 12.5, Hgb is low at 9.8 with a low MCV of 72 — this pattern is consistent with a microcytic anemia, possibly iron-deficient. I'll order an iron panel and reticulocyte count."

That text doesn't go anywhere by default. It lives in the ChatHistory as a `TextContent` item on the assistant's last message, right alongside the `FunctionCallContent` that contains the actual tool call request. Semantic Kernel just... moves past it.

But I wanted to show it to the user. So I added a few lines to the `SignalRInvocationFilter` — the hook that fires before each tool call — that pulls that text out and sends it as its own SignalR message:

```csharp
var lastAssistant = context.ChatHistory
    .LastOrDefault(m => m.Role == AuthorRole.Assistant);

if (lastAssistant?.Items != null)
{
    var reasoningText = string.Concat(
        lastAssistant.Items
            .OfType<TextContent>()
            .Select(tc => tc.Text)
            .Where(t => !string.IsNullOrWhiteSpace(t)));

    if (!string.IsNullOrEmpty(reasoningText) && reasoningText != _lastReasoningEmitted)
    {
        _lastReasoningEmitted = reasoningText;
        await hubContext.Clients.All.SendAsync("TaskUpdated", new TaskExecutionUpdate
        {
            TaskId      = taskId,
            Status      = TaskExecutionStatus.Running,
            Message     = reasoningText,
            MessageType = "Reasoning",
            ...
        });
    }
}
```

The deduplication guard (`_lastReasoningEmitted`) is there because if the model happens to call multiple tools in the same response, the filter fires once per tool — and you don't want to blast the same reasoning paragraph to the browser multiple times.

On the frontend, messages with `MessageType === "Reasoning"` render differently: italic, muted purple, no tool-call chip. The activity log gets a ✦ icon instead of the usual spinner. It's a small visual distinction but it meaningfully communicates "this is the agent thinking" vs. "this is the agent doing."

## The Prompt Change That Makes It Work

This is subtle but important. The original system prompt ended with:

```
Do not explain — just invoke tools.
```

That instruction exists for good reason — it keeps the other task types fast and clean. You don't need the agent to narrate why it's checking drug interactions before ordering a medication.

But for `LabResultReview`, that instruction actively works against what we're trying to do. So the updated prompt has a carve-out:

```
For LabResultReview tasks: write your clinical reasoning about the flagged values before
calling the follow-up tool. For all other task types: do not explain — just invoke tools.
```

One sentence. That's all it takes to switch the model from "silent executor" to "shows its work." The reasoning text that comes out is genuinely useful — it tells you not just *what* the agent decided but *why*, in clinical language that a nurse or provider could actually evaluate.

## What It Looks Like in Practice

Here's what a `LabResultReview` execution looks like in the activity log now:

```
⟳ [Step 1] Calling GetLabResults…
✦ WBC is elevated at 12.5 K/uL (ref: 4.0–11.0). Hgb is low at 9.8 g/dL (ref: 12.0–16.0)
  with a low MCV of 72 fL, suggesting microcytic anemia. This pattern is consistent with
  iron deficiency. I will order an iron panel, ferritin, and reticulocyte count.
⟳ [Step 2] Calling OrderAdditionalDiagnostics…
✓ OrderAdditionalDiagnostics completed
```

Compare that to a LabOrder for the same patient:

```
⟳ [Step 1] Calling GetPastLabOrders…
⟳ [Step 2] Calling ValidateLabOrderIndication…
⟳ [Step 3] Calling SubmitLabOrder…
✓ SubmitLabOrder completed
```

Clean, mechanical, no narration needed. The right amount of transparency for each situation.

## Where This Is Heading

The deeper lesson here is that "agentic" doesn't mean "the model picks tools." Lots of pipelines do that without any real reasoning. What makes the difference is whether the model's input changes what it decides to *do* — not just which branch of a fixed flowchart it takes.

The `LabResultReview` pipeline gets there because the tool output is genuinely decision-relevant: different lab values lead to different actions, and the model has to read and interpret the data to figure out which one. That's the bar worth aiming for.

Next up, I want to look at what happens when tasks have dependencies on each other — where the output of one task should influence how you approach another. That's where orchestration gets interesting.

![SK Healthcare Demo Screenshot](/Files/blog/teaching-the-agent-to-actually-think-screen.png)