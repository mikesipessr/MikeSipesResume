---
title: Building an Autonomous Agent in Healthcare (Without the Hand-Waving)
date: 2026-04-21
description: Most "agentic AI" talk is hand-waving. Here's the real architecture behind a healthcare agent that updates charts, writes notes, and discontinues prescriptions — reflection, attributes, and a boring while-loop.
slug: building-autonomous-healthcare-agent-without-hand-waving
cover: /Files/blog/healthcare-ai.png
coverAlt: Building an Autonomous Agent in Healthcare (Without the Hand-Waving)
hideTitle: true
---

Over the past year, my team replaced a pile of manual back-office work with an AI agent. Not a chatbot. A real autonomous worker that picks up a task, reads the chart, decides what to do, and actually does it — updates medication lists, writes appointment notes, discontinues old prescriptions, files lab results in the EHR.

People love to wave their hands about "agentic AI." I want to show what it actually looks like under the hood, because the architecture is simpler — and more interesting — than the hype suggests. I'll keep the implementation details generic; the patterns below apply to any domain where an agent has to operate inside a third-party system of record and where mistakes have real consequences.

## The Three Moving Parts

Strip away the buzzwords and an agent like ours has three components:

1. **A runner** — the loop that talks to the large language model (LLM).
2. **A tool catalog** — the set of things the agent is allowed to do in the real world.
3. **A service layer** — the actual implementations that call the EHR, drug databases, clinical terminology systems, and so on.

Let's walk through each.

## 1. The Runner: A Conversation That Never Stops Turning

The heart of the system is a single class we call the agent runner. When a task arrives (say, "process this refill request"), the runner:

- Looks up the **Standard Operating Procedure (SOP)** for that task type. SOPs are authored by our clinical team — they're plain-English instructions like *"verify the patient's identity, check last fill date, confirm no drug interactions, then approve or deny."*
- Builds a single prompt containing the SOP, the task details, and a structured description of every tool the agent is permitted to use.
- Sends that prompt to a hosted LLM.
- Then it waits for one of two things to come back.

The core loop is essentially this, in pseudocode:

```text
loop forever:
    response = ask_LLM(conversation, available_tools)

    if response.finish_reason == STOP:
        # The agent is done. Parse its final report, persist it, return.
        save_result(response)
        return

    if response.finish_reason == TOOL_CALLS:
        # The agent wants to use one or more tools.
        for each tool_call in response.tool_calls:
            output = execute_tool(tool_call)
            conversation.append(tool_result(tool_call.id, output))
        # Loop back and let the LLM reason about what it just learned.
        continue
```

That's the whole autonomy loop. The LLM either says *"I'm done, here's my answer"* or *"I need to call `GetPatientRecord` with this patient ID — then I'll think about what to do next."* The runner executes the tool, appends the result to the conversation, and asks the model to continue. The agent keeps reasoning until it declares itself finished.

Temperature is pinned to zero, top-p is very low, and we fix the random seed. In healthcare, we do not want the agent to be creative. We want it deterministic, auditable, and boring.

## 2. Tool Definitions: Metadata on the Method Itself

Here's where it gets elegant. We don't hand-write tool descriptions for the LLM. We use **attributes** on the methods themselves, and a single class reflects over them to build the catalog at runtime.

A tool declaration looks roughly like this:

```text
@ChatTool(
    description: "Retrieve patient demographics by patient ID.",
    schema: { patientId: string, required: [patientId] }
)
function GetPatientRecord(args) -> Result<string>
```

Two pieces of metadata live right next to the code: a **human-readable description** and a **JSON Schema** describing the arguments. Those are the exact strings we hand to the LLM, so the model understands both what the tool does and what parameters it expects.

For tools that change state in the EHR — discontinuing a medication, writing an appointment note, adding a prescription — we layer on additional attributes:

```text
@ChatTool(description: "...", schema: ...)
@ModifiesData
@IsRequired
function DiscontinuePrescription(args) -> Result<string>
```

- `@ModifiesData` tells the runner: *this is a write, not a read.* Retries get suppressed (we don't want to double-discontinue a prescription), and we capture a **before/after snapshot** so every change is reversible and auditable.
- `@IsRequired` tells the runner: *if this tool fails, don't push through — escalate to a human immediately.*

At startup, a single method scans every service we register, finds every method tagged as a chat tool, and wraps each one in a uniform adapter that handles argument parsing, retries with exponential backoff, transient error detection, and result unwrapping:

```text
for each registered_service:
    for each method in registered_service:
        if method has @ChatTool attribute
           and method is in the enabled_tools list:
              catalog.add(wrap_as_tool(method))
```

Notice the `enabled_tools` filter. Every task type (Rx Refill, Lab Result, Prior Auth, Pre-Visit Prep, Ambient Orders...) gets a curated subset of tools. A refill agent doesn't need access to the lab-orders API. A lab-results agent doesn't need to write prescriptions. The SOP dictates the tool list; the tool list constrains what the agent can possibly do. This is the single most important safety property of the system.

## 3. The Service Layer: Where the Real Work Happens

Our service classes are large — thousands of lines of normal HTTP clients talking to third-party REST APIs, wrapped in a standard result pattern. Every public method marked as a chat tool becomes a discrete capability the agent can invoke: *get patient medications, add a new prescription, update an appointment note, retrieve an encounter summary, file a lab result, pull active problems.*

What matters architecturally is that **the service layer doesn't know about the agent**. These are just normal API clients. A human developer writing integration tests calls them the same way the LLM does. The agent isn't a special execution path — it's just another caller.

This is a point worth lingering on. The naïve way to build an "AI agent" is to write a bunch of AI-specific plumbing. The resilient way is to build well-structured services first, then let the LLM be one of many consumers. When we add a new capability — a drug-database lookup, a risk-adjustment coding helper, a clinical-terminology resolver — we don't touch the agent runner at all. We write the methods, tag them with the tool attribute, add them to the service map, and they become available to every agent that should see them.

## Why This Matters for Healthcare

Three properties fall out of this architecture almost for free, and all three are the things hospitals and practices actually care about:

**Auditability.** Every tool call is logged. Every mutation captures the data *before* and *after*. If the agent refills a medication, we know exactly what the chart looked like before the agent touched it and exactly what changed. This is non-negotiable.

**Human-in-the-loop escalation.** When a required tool fails — say, a prescription add rejects because of a drug interaction — the runner immediately sets the task to *"Human Intervention Required"* and stops. The agent never retries destructive operations. It never tries to be clever about errors that a nurse or pharmacist needs to see.

**Scoped authority.** The agent is not a general-purpose assistant. For a given task type, it sees a specific SOP and a specific subset of tools. It cannot do anything outside that envelope because those tools aren't in its hands. "Jailbreaking" a calculator into wiring money is hard when the calculator literally doesn't have wire-transfer methods.

## The Punchline

The word "agentic" gets used to mean a lot of things. In our system, it means something very specific: a large language model inside a while-loop, handed a curated list of attribute-tagged methods, writing back structured JSON that the runner executes and feeds back in. That's it. No exotic frameworks, no graph-based orchestrators, no vector databases deciding which tool to fire.

The intelligence is in the LLM. The *safety* is in the boring code around it — the attributes, the before/after capture, the required-tool escalation, the per-task tool filtering, the circuit breaker, the retries that know the difference between a read and a write.

If you're trying to build an agent that operates inside a regulated industry, that's the real work. The LLM is the easy part.

