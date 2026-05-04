---
title: Making the Healthcare Demo Actually Think Before It Acts
date: 2026-05-01
description: Adding a three-phase retrieve-validate-act pipeline to the healthcare voice demo — the agent now checks patient context and clinical rules before executing, and issues a first-class warning when something shouldn't go through.
slug: making-the-healthcare-demo-actually-think-before-it-acts
cover: /Files/blog/making-the-healthcare-demo-actually-think-before-it-acts.png
coverAlt: Making the Healthcare Demo Actually Think Before It Acts
hideTitle: true
---
*Part 3 of an ongoing series building a healthcare voice-to-workflow AI demo with Semantic Kernel*

*Previous posts: [Part 1 — From Voice to Structured Data](https://mikesipes.me/blog/from-voice-to-structured-data-building-healthcare-ai-demo-semantic-kernel) · [Part 2 — Teaching the Assistant to Actually Do Things](https://mikesipes.me/blog/teaching-the-healthcare-assistant-to-actually-do-things)*

*The full code is on GitHub: [mikesipessr/SemanticKernelHealthcare](https://github.com/mikesipessr/SemanticKernelHealthcare)*

---

> **Reminder:** This is a demo. Real healthcare workflows involve PHI, and you need a Business Associate Agreement (BAA) with any AI vendor before patient data touches their systems. This project has none of that. It is for learning purposes only.

---

So where we left off: the demo could listen to a clinical note, extract structured tasks from it, and then fire an AI agent that called the right tool — RefillPrescription, SubmitLabOrder, and so on. Each task card showed a spinner while the agent worked and then flipped to a green checkmark with the result.

That was a decent demo. But it had a problem.

The agent was just blindly submitting things. Doctor says "refill the metformin for Jane Doe"? Sure, fired. No checks. No context. No awareness that Jane might already have a refill that went out two weeks ago, or that the medication she's on might interact with the new one, or that her insurance requires prior auth for the referral she just requested.

Real clinical workflows don't work that way. There are checks. There are gates. Sometimes the right answer is "actually, we can't do this" — and explaining why matters.

This round adds all of that.

---

## The Three-Phase Pipeline

The agent now executes every task in three sequential phases instead of one shot.

**Phase 1 — Retrieve.** Before touching anything, the agent pulls context about the patient. For a medication refill, that means calling `GetPatientMedications` and `GetPatientAllergies`. For a lab order, it calls `GetPastLabOrders` to check for recent duplicate tests. For a referral, it grabs demographics and insurance coverage.

**Phase 2 — Validate.** With that context in hand, the agent calls a validation tool specific to the task type. `ValidateMedicationRefill` checks refill frequency and quantity limits. `CheckDrugInteractions` compares the proposed medication against what the patient is already taking. `ValidateLabOrderIndication` looks for duplicate orders. `ValidateReferralAuthorization` checks whether the insurance plan requires prior auth.

Each validation tool returns a simple contract: a `validationPassed` boolean, and a `validationFailed` string that's either null (all clear) or a plain-English clinical reason explaining what's wrong.

**Phase 3 — Act or Warn.** The agent reads that validation result and branches. If `validationFailed` is null, it calls the execution tool as before. If `validationFailed` is set, it calls a `CreateClinicalWarning` tool instead, passing the reason directly, and skips the execution entirely.

That's the whole pipeline. Retrieve → Validate → Execute or Warn.

---

## What Actually Makes This Work

The interesting thing here is what we *didn't* have to build. Semantic Kernel's `FunctionChoiceBehavior.Auto()` was already enabled from the previous version. That setting puts SK into an agentic loop mode: after each tool call completes, SK appends the result to the chat history and calls the model again. The model keeps going until it decides there's nothing left to call.

The only thing that was keeping the agent to a single tool before was the system prompt. It said "use exactly one of the available tools." Remove that constraint, give the model a clear three-phase instruction set, and it just... does it. The loop was already there.

The new system prompt maps each task type to exactly which tools to use at each phase, and explicitly handles the warning branch:

```
PHASE 3 — EXECUTE OR WARN:
  If validationFailed is null  → call the execution tool for this task type.
  If validationFailed is set   → call CreateClinicalWarning with patientName and
    the validationFailed value as the reason. Do NOT call the execution tool.
```

The model reads the validation JSON, sees whether `validationFailed` is null or not, and acts accordingly. No custom orchestration logic. No conditional code in C# deciding what to call next. The model makes that decision.

---

## Watching It Happen in Real Time

The SignalR filter from the previous version got a small but important update. It now increments a step counter before each tool fires, so every SignalR update carries a `stepNumber`. The task cards show the current step as the agent works its way through the pipeline:

```
Step 1: Calling GetPatientMedications…
Step 2: Calling GetPatientAllergies…
Step 3: Calling ValidateMedicationRefill…
Step 4: Calling RefillPrescription…
```

Watch a card with four tasks all running in parallel and you get something that actually looks like a system doing real work. Each card is on its own step, each one independent.

The filter also tracks a `WarnWasIssued` flag. When the last tool the agent calls is `CreateClinicalWarning`, the service sends a terminal `Warned` message instead of `Completed`. Different status, different UI.

---

## The Warned State

`Warned` is a first-class status alongside `Completed` and `Failed`. It has its own visual treatment — amber border and glow instead of green — because it's semantically different from both of the others. It's not a success, but it's not an error either. It means the agent did its job, checked the work, and decided the action shouldn't happen.

The card shows a ⚠ icon, a "Clinical Warning" label, and the actual clinical reason from the validation tool:

> *Prior authorization required: patient's HMO plan requires a PCP-initiated referral with auth number before the specialist visit.*

There's a collapsible details panel that shows the full warning JSON — including a `warningId`, a `requiresReview: true` flag, and the timestamp. The same `Show/Hide details` toggle pattern from the completed state, just pointed at the warning payload instead of an execution result.

For demo purposes, validation tools randomly fail about 25% of the time with a plausible clinical reason. That way you don't have to engineer specific edge cases to see the warned state — just run a few tasks and it'll show up.

The "Run All Tasks" button was also updated to skip warned cards, since a warning is a terminal state just like a completion. It only picks up tasks that haven't started yet.

---

## Token Counts Across the Pipeline

One thing worth pointing out: the token usage numbers you see on completed cards now reflect the whole pipeline, not just a single tool call. A medication refill runs four LLM turns — the model picks tools at each phase and reasons about the validation result before deciding whether to execute or warn. The prompt token count climbs with each turn because SK appends every tool result back into the chat history before calling the model again.

It's a useful reminder that agentic workflows aren't free. Seeing "847↑ 62↓ = 909 tokens · 4 steps" on a card makes the cost concrete. For a demo that's fine. For production at scale, you'd want to think about whether all three phases actually need full context or whether you could structure the calls to be leaner.

---

## Streaming Transcription Progress

Separate from the tool pipeline, the transcription step got a quality-of-life upgrade.

Previously, when you stopped recording, you'd see a loading skeleton for however long it took Whisper plus GPT-4o to run — usually 5 to 10 seconds — and then the transcription text and all the task cards would pop in at once.

Now the backend pushes SignalR progress updates during that waiting period. As soon as Whisper finishes, the transcription text appears in the UI immediately, with a status line below it reading "Extracting structured tasks with GPT-4o…" The task cards still don't show until the full HTTP response arrives, but the user can read their own words back while the classification runs.

The change on the backend was two lines added to `AudioController`, one on each side of the Whisper call:

```csharp
await hubContext.Clients.All.SendAsync("TranscriptionStatus",
    new { message = "Transcribing audio with Whisper…", stage = "transcribing" });

var text = await transcription.TranscribeAsync(stream, audio.ContentType, ct);

await hubContext.Clients.All.SendAsync("TranscriptionStatus",
    new { message = "Extracting structured tasks with GPT-4o…", stage = "classifying", transcription = text });
```

The second push carries the transcription text directly. The frontend picks that up from SignalR and renders it immediately — no waiting for the HTTP response to find out what was said.

It's a small thing but it makes the app feel significantly more responsive. There's a big difference between "nothing happening for 8 seconds then everything at once" and "your words appear after 4 seconds, then the tasks appear 4 seconds after that."

---

## What's Still Fake

The retrieval tools return randomized fake data. The validation tools fail randomly. None of this connects to a real EHR, a real pharmacy system, or a real insurance authorization service.

That's intentional. The architecture is real — if you replaced the stubs with actual API calls, the agent behavior wouldn't change. The retrieval tools would pull real patient data, the validation tools would apply real clinical rules, and the execution tools would submit real orders. The SK plumbing, the SignalR layer, the three-phase prompt structure — all of it carries forward.

But for a demo running on a laptop, fake data and random failures is the right call. You get to see every code path without needing a dev environment plugged into a healthcare system.

---

## Up Next

The thing I keep thinking about is multi-step tasks where the output of one tool should feed the input of the next in a way the model has to reason about — not just "did this pass or fail" but "given these lab results, which of these three follow-up actions makes sense." That's a harder prompt engineering problem, and it's where the interesting work is.

More on that when I get there.

![SK Healthcare Demo Screenshot](/Files/blog/making-the-healthcare-demo-actually-think-before-it-acts-screen.png)

The code is [on GitHub](https://github.com/mikesipessr/SemanticKernelHealthcare) if you want to take a look. Happy to answer questions about any part of the implementation.
