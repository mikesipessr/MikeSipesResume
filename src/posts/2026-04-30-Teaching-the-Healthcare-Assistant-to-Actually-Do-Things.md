---
title: Teaching the Healthcare Assistant to Actually Do Things
date: 2026-04-30
description: How I added a real agent layer to the healthcare voice demo — Semantic Kernel plugins that execute extracted tasks concurrently, with real-time SignalR updates streaming to the UI as the agent calls each tool.
slug: teaching-the-healthcare-assistant-to-actually-do-things
cover: /Files/blog/actually-do-things.png
coverAlt: Teaching the Healthcare Assistant to Actually Do Things
hideTitle: true
---

*A follow-up to [From Voice to Structured Data: Building a Healthcare AI Demo with Semantic Kernel](https://mikesipes.me/blog/from-voice-to-structured-data-building-healthcare-ai-demo-semantic-kernel)*

---

So the last time we talked about this project, we had something genuinely useful: you speak a clinical note into a mic, Whisper transcribes it, and GPT-4o carves it into a neat list of structured tasks — prescription refills, lab orders, referrals, the whole thing. It was a solid demo.

But then the tasks just... sat there. Cards on a screen. No one doing anything with them.

That's fine for a proof of concept, but it's not exactly the inspiring "here's what AI can do for healthcare workflows" moment I was going for. This post is about what I added next: an actual agent layer that picks up those tasks and executes them — with real-time updates streaming back to the UI as it works.

---

## The Setup: SK Tools

Semantic Kernel has a concept called *plugins*, which are just classes with methods decorated with `[KernelFunction]`. You register the plugin with a kernel instance and the model can see those functions as tools it can call. If you've used OpenAI function calling or tool use with Anthropic's API, it's the same idea — the model decides when and how to use a tool based on the task description and the tool's metadata.

I built a `HealthcarePlugin` with four functions:

```csharp
[KernelFunction("RefillPrescription")]
[Description("Submits a medication refill request for an existing prescription to the pharmacy system.")]
public async Task<string> RefillPrescriptionAsync(
    [Description("Full name of the patient")] string patientName,
    [Description("Description of the medication refill needed")] string description)
```

Same pattern for `SubmitLabOrder`, `SubmitReferralOrder`, and `CreateMedicationOrder`. Each one has a 1.5-second fake delay (to simulate actual system latency) and returns a realistic-looking JSON payload — confirmation numbers, pharmacy names, specialist assignments, that kind of thing.

The `[Description]` attributes are doing real work here. That text goes directly into the model's context as the tool schema. Vague descriptions lead to the model guessing wrong. Specific ones get you clean, reliable tool selection. I learned that the hard way — my first pass at the descriptions was pretty generic and the model kept picking the wrong tool for referral orders.

---

## The Agent Orchestration Service

The actual execution logic lives in `AgentOrchestrationService`. The core idea is simple: for each incoming task request, spin up a kernel clone, attach the healthcare plugin, and let the model figure out which tool to call.

The `Kernel.Clone()` call is important here. You don't want tasks sharing state — especially when you're running them concurrently, which is exactly what happens:

```csharp
public Task ExecuteTasksAsync(IEnumerable<TaskExecutionRequest> requests)
{
    foreach (var req in requests)
        _ = Task.Run(() => ExecuteSingleTaskAsync(req));

    return Task.CompletedTask;
}
```

The controller returns 202 Accepted immediately and the tasks run in parallel on background threads. The client finds out what happened through SignalR, not through the HTTP response. That's a more honest model for something that could take a few seconds per task — no long-polling, no fake progress bars.

For each task, the service builds a chat history with a tight system prompt:

```
You are a healthcare workflow agent. You will be given a task description for a patient.
Use exactly one of the available tools to complete the task based on its type.
After calling the tool, confirm the action was completed. Do not explain — just invoke the tool.
```

That "do not explain" line matters. Without it, the model would sometimes write a little essay about what it did after calling the tool. That's charming in a chatbot. It's noise in an automation workflow.

Tool selection is handled with `FunctionChoiceBehavior.Auto()`:

```csharp
var settings = new OpenAIPromptExecutionSettings
{
    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(),
    Temperature            = 0.0,
    MaxTokens              = 500
};
```

`Temperature = 0.0` because there's no creativity needed here. The task says "referral" — call the referral tool. This isn't a creative writing assignment.

---

## The Real-Time Part: IAutoFunctionInvocationFilter

This is honestly the part I found most interesting to build. Semantic Kernel has a filter interface called `IAutoFunctionInvocationFilter` that lets you intercept tool calls as they happen — before and after the function runs. I used this to push SignalR updates at exactly the right moments.

```csharp
public async Task OnAutoFunctionInvocationAsync(
    AutoFunctionInvocationContext context,
    Func<AutoFunctionInvocationContext, Task> next)
{
    var toolName = context.Function.Name;

    await hubContext.Clients.All.SendAsync("TaskUpdated", new TaskExecutionUpdate
    {
        TaskId   = taskId,
        Status   = TaskExecutionStatus.Running,
        ToolName = toolName,
        Message  = $"Calling {toolName}...",
    });

    await next(context);  // actually executes the function

    var details = context.Result?.GetValue<string>() ?? "{}";

    await hubContext.Clients.All.SendAsync("TaskUpdated", new TaskExecutionUpdate
    {
        TaskId   = taskId,
        Status   = TaskExecutionStatus.Completed,
        ToolName = toolName,
        Details  = details,
    });
}
```

Before the tool runs: push a "Running / Calling X..." update. After it returns: push a "Completed" update with the raw JSON result. The frontend reacts to both in real time, so you can actually watch the agent work — which is a much better demo than a spinner that eventually resolves.

One gotcha I ran into: after the filter fires and sends its own "Completed" message, the service outer loop also tries to send a completion message. If you're not careful, that second message overwrites the tool name and details that the filter already sent. I solved it by having the filter track whether it was ever called (`ToolWasCalled` flag), and having the service check that before sending its own terminal update:

```csharp
if (!filter.ToolWasCalled)
{
    // no tool ran, send a generic completion
    await Send(new TaskExecutionUpdate { Status = Completed, Message = "Task completed." });
}
else
{
    // re-send the filter's completion message, now with token counts attached
    await Send(new TaskExecutionUpdate
    {
        Status           = Completed,
        Message          = filter.LastCompletionMessage,
        ToolName         = filter.LastToolName,
        Details          = filter.LastDetails,
        PromptTokens     = promptTokens,
        CompletionTokens = completionTokens,
    });
}
```

Token counts come from the last chat response's metadata. It's a bit of reflection to get at them (`Usage.InputTokenCount`, `Usage.OutputTokenCount`) but worth it — showing token usage on each card gives you a feel for what the orchestration actually costs per task.

---

## SignalR Hub

The hub itself is almost embarrassingly simple:

```csharp
public class TaskExecutionHub : Hub
{
    // Server-push only. Messages sent via IHubContext<TaskExecutionHub>.
}
```

All the action happens through `IHubContext<TaskExecutionHub>` injected into the orchestration service. The hub is just there to hold the connection open. Clients connect to `/hubs/tasks` and listen for `TaskUpdated` events — they never push anything back.

---

## Frontend Changes

On the React side, there's a new `useTaskExecution` hook that manages the SignalR connection and maintains a state map keyed by task ID:

```typescript
connection.on('TaskUpdated', (update: TaskExecutionUpdate) => {
  setExecutionState(prev => {
    const current = prev[update.taskId];
    // Don't let the token-count patch overwrite already-set details
    if (current?.status === 'Completed' && update.status === 'Completed') {
      return {
        ...prev,
        [update.taskId]: {
          ...update,
          toolName: update.toolName ?? current.toolName,
          details:  update.details  ?? current.details,
        },
      };
    }
    return { ...prev, [update.taskId]: update };
  });

  setActivityLog(prev => [...prev, update]);
});
```

That merge logic is for the two-phase completion pattern I mentioned earlier — the first SignalR push has the details, the second has the token counts. We want both on the card, not a race condition where one overwrites the other.

Each `TaskCard` now handles four visual states:

- **Idle** — just a "▶ Run" button
- **Running** — spinner + whatever tool name the agent is currently calling
- **Completed** — green checkmark, tool name, timestamp, token counts, and a collapsible JSON panel showing the raw tool output
- **Failed** — red X with the error message

There's also a "▶▶ Run All Tasks" button at the top of the task grid that fires every idle task concurrently, skipping anything already running or completed. That's the demo moment — you hit the button and watch all the cards animate through their states in parallel.

The `ActivityLog` component at the bottom keeps a running timestamped feed of every event: agent analyzing, tool calls going out, completions coming back, token counts per task. It auto-scrolls to the bottom as entries come in.

---

## What It Looks Like End to End

1. Record a clinical note
2. Tasks appear as cards
3. Hit "Run All Tasks"
4. Cards immediately flip to "Agent analyzing..."
5. Within a second or two each card updates to "Calling SubmitLabOrder..." or "Calling RefillPrescription..." — you can see which tool is being invoked in real time
6. Cards complete one by one, showing the confirmation number, assigned pharmacy/specialist, and token usage
7. The activity log has a complete play-by-play of everything that happened

It's a demo, so the tools don't call real systems — but the architecture is real. Swap out the fake implementations for actual EHR API calls, add proper auth, and this is genuinely how you'd wire up an AI-driven healthcare workflow layer.

---

## A Few Things I'd Do Differently

The `hubContext.Clients.All.SendAsync(...)` approach works fine for a single-user demo, but in any real deployment you'd scope the SignalR sends to a specific connection or group rather than broadcasting to everyone. Right now if two people were using the demo at the same time they'd see each other's task updates.

Also, `Kernel.Clone()` is fine but there's a deeper question about whether you want one kernel per task or one per user session. For a demo, per-task is simpler. In production you'd probably think harder about resource allocation.

The token counting is also a little brittle — it uses reflection against the usage metadata object because the type isn't directly accessible through the public API. It works, but it feels like something that could break on a minor SDK version bump. Worth keeping an eye on.

---

## Wrapping Up

The first post was about getting structured data out of voice. This one is about actually doing something with it. Adding the SK plugin layer, the agent orchestration, and the SignalR real-time updates turned a neat extraction demo into something that feels more like a real system.

The Semantic Kernel bits I liked most: `[KernelFunction]` + `[Description]` for tool authoring is genuinely clean, `FunctionChoiceBehavior.Auto()` just works, and `IAutoFunctionInvocationFilter` is a really elegant hook for the "what's the agent doing right now?" problem.

The code is on GitHub at [mikesipessr/SemanticKernelHealthcare](https://github.com/mikesipessr/SemanticKernelHealthcare) if you want to dig into it. Next thing I'm thinking about is adding a more complex multi-step workflow — something where the agent has to call two or three tools in sequence based on what the first one returns. But that's a post for another day.

---

## One More Thing — Please Don't Use This in Production

I mean it. This is a demo. The patient names in the recordings, the task descriptions, all of it — that's Protected Health Information. Before you send PHI to any AI model or third-party API (OpenAI, Azure OpenAI, Whisper, anyone), you need a **Business Associate Agreement (BAA)** in place with that vendor. That's not optional under HIPAA, and "but it's just a demo" is not a legal defense.

OpenAI and Microsoft do offer BAAs for qualifying enterprise agreements. But that paperwork needs to exist before data flows, not after. If you're building anything real in this space, sort that out first.

Beyond BAAs, production healthcare systems have a whole other checklist: audit logging, role-based access control, encryption at rest and in transit, proper de-identification pipelines if you're doing model training, and more. None of that is in this project. This codebase is for learning and showing off the architecture — not for handling actual patient records.

![SK Healthcare Demo Screenshot](/Files/blog/actually-do-things-screen.png)

