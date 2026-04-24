---
title: Two Attributes and an Auto(): How Semantic Kernel Clicked for Me
date: 2026-04-25
description: A practical walkthrough of how Semantic Kernel turns a plain C# class into something an LLM can call — just two attributes and an Auto() flag — plus a peek at the loop running under the hood.
slug: two-attributes-and-an-auto-how-semantic-kernel-clicked-for-me
cover: /Files/blog/semantic-kernel.png
coverAlt: Two Attributes and an Auto(): How Semantic Kernel Clicked for Me"
hideTitle: true
---
# I Finally Get Why Semantic Kernel Exists

You've probably seen a dozen "LLM calls your code" tutorials. Function calling, tool use, agents, the whole vocabulary. I'd read the words, nodded along, and then completely failed to translate any of it into actual C# I could run.

Then I spent an afternoon with [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/) and it finally clicked. I'm writing this while it's still fresh, because the thing that made it click was embarrassingly simple.

## What I was actually trying to do

I wanted the smallest possible demo. Not a framework showcase. Just: *what's the shortest path from "I have a C# method" to "an LLM calls it when a human asks for it in plain English"?*

Semantic Kernel's answer is basically two attributes.

## The plugin

I grabbed Microsoft's smart-home lights example (credit where it's due — more on that at the end) and stripped it down. Here's the whole "device controller":

```csharp
public class LightsPlugin
{
    private readonly Dictionary<int, (string Name, bool IsOn)> _lights = new()
    {
        { 1, ("Living Room", false) },
        { 2, ("Kitchen",     true)  },
        { 3, ("Porch",       false) },
    };

    [KernelFunction("get_lights")]
    [Description("Gets the list of lights and whether each one is on or off.")]
    public IEnumerable<object> GetLights() =>
        _lights.Select(kv => new { Id = kv.Key, Name = kv.Value.Name, IsOn = kv.Value.IsOn });

    [KernelFunction("change_state")]
    [Description("Turns a light on or off by id.")]
    public string ChangeState(
        [Description("The id of the light to change.")] int id,
        [Description("True to turn on, false to turn off.")] bool isOn)
    {
        _lights[id] = (_lights[id].Name, isOn);
        return $"{_lights[id].Name} is now {(isOn ? "on" : "off")}.";
    }
}
```

That's just a regular C# class. Two attributes: `[KernelFunction]` gives the method a name the model can refer to, and `[Description]` tells the model what the method is for. The parameter descriptions matter too — that's how the model knows what to pass in. That's the entire prep work.

## The four lines that wire it together

Building the kernel is four lines:

```csharp
var builder = Kernel.CreateBuilder();
builder.AddOpenAIChatCompletion("gpt-4o-mini", apiKey);
builder.Plugins.AddFromType<LightsPlugin>("Lights");
var kernel = builder.Build();
```

And then the one line that turns the whole thing into something interesting:

```csharp
var settings = new OpenAIPromptExecutionSettings
{
    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
};
```

`Auto()` means "model, go ahead and call a function if you think you should." That's the magic. I type *turn on the porch*, and behind the scenes the model thinks:

1. There's a `change_state` function I'm allowed to call.
2. The porch has id 3.
3. `change_state(3, true)`.

Semantic Kernel runs the method for real, captures the return value, hands it back to the model, and the model writes the reply: *"The Porch light is now on."*

I wrote zero routing code. No `if (input.Contains("turn on"))`. No JSON parsing. The model reads my `[Description]` strings and figures out the rest.

## The "wait, that's it?" moment

Here's what an actual run looks like:

```
You: what's on right now?
Assistant: Only the Kitchen light is on. The Living Room and Porch are off.

You: turn on the porch
Assistant: The Porch light is now on.

You: and kitchen off please
Assistant: The Kitchen light has been turned off.
```

Three different phrasings, and the model handled all of them. I wrote one class and a handful of setup lines. Every time I'd looked at Semantic Kernel in the past I bounced off the surface area — plugins, connectors, agents, vector stores, memory, planners. Turns out you don't need any of that to get the interesting part. Two attributes and an `Auto()` flag.

## Peeking behind the curtain

It felt like magic the first time, so I dug in. Turns out the whole thing is a pretty sensible loop, and understanding it is the difference between "I got a demo running" and "I can build something real."

### 1. SK describes your methods to the model

When you call `builder.Plugins.AddFromType<LightsPlugin>()`, Semantic Kernel uses reflection to walk your class and build a JSON schema for every `[KernelFunction]` method. That schema is what gets shipped to OpenAI alongside your prompt. For `change_state`, it ends up looking roughly like this:

```json
{
  "name": "Lights-change_state",
  "description": "Turns a light on or off by id.",
  "parameters": {
    "type": "object",
    "properties": {
      "id":   { "type": "integer", "description": "The id of the light to change." },
      "isOn": { "type": "boolean", "description": "True to turn on, false to turn off." }
    },
    "required": ["id", "isOn"]
  }
}
```

Two things worth noticing:

- **Those `[Description]` strings are load-bearing.** They're literally what the model reads to decide whether to use the function. Lazy descriptions produce lazy function calls.
- **Your parameter types become the schema.** `int` → integer, `bool` → boolean, a POCO → a nested object schema. That's why strongly-typed parameters matter — the model gets a sharper contract than "string in, string out."

### 2. A single user message is actually a loop

When I call `GetChatMessageContentAsync`, it's not one request to OpenAI. It's a loop SK runs on my behalf:

1. Send the chat history + function schemas to the model.
2. The model replies with *either* a plain text message (done) *or* a "please call these functions" message.
3. If it asks for a function, SK finds the matching C# method, invokes it, captures the return value, and appends *both* the tool call and the tool result to the chat history.
4. Jump back to step 1.

So *"turn on the porch"* is really: prompt → model asks for `change_state(3, true)` → SK runs it locally → result goes back to the model → model writes "The Porch light is now on." Two round trips to OpenAI, one method invocation on my machine, and SK is the thing quietly managing the dance.

### 3. The model can chain calls

This is where it starts to feel properly clever. Ask *"which lights are off, and turn the first one on."* Watch what happens:

1. Model calls `get_lights`.
2. Reads the result and notices Living Room (id 1) is off.
3. Calls `change_state(1, true)`.
4. Writes a reply summarizing what it did.

All inside one `GetChatMessageContentAsync` call. SK keeps looping until the model stops asking for tools. That's why `FunctionChoiceBehavior.Auto()` is more powerful than it first sounds — it's not "pick one function," it's "pick as many as you need, in whatever order you want."

### 4. What the Kernel actually is

The `Kernel` itself is basically a small dependency-injection container scoped to one conversation. It holds your LLM connector, your plugins, and optionally things like logging, filters, and custom services. When SK invokes one of your kernel functions, it passes the Kernel in as a parameter if you ask for it — which means inside `ChangeState` I could pull an `HttpClient` or a DbContext out of the kernel, and suddenly the "fake" plugin is doing real work. Same two attributes. Same `Auto()`. Real behavior.

That's the mental shift, really: a kernel function isn't some special LLM thing, it's just a C# method that the model happens to be allowed to call. Everything you already know about writing C# still applies — services, cancellation tokens, async, testing. SK just builds a bridge between your method and the model's reasoning.

## Where to go from here

Now that the mental model is in place, the interesting stuff basically writes itself:

- **Add another plugin.** A `WeatherPlugin`, a `CalendarPlugin`. Watch the model pick between them based on the user's question.
- **Replace the dictionary with real calls.** An HTTP client, a database, your internal API. Same attributes, same `Auto()`, real behavior.
- **Swap the model.** `AddAzureOpenAIChatCompletion` for Azure. There are connectors for Ollama, Google, and others if you want to run local or try something else.

But honestly, the pitch is the first demo. Two attributes. One `Auto()`. Natural language in, method calls out.

## Credit where it's due

The lights scenario isn't original — it's lifted from [Microsoft's Semantic Kernel quick start](https://learn.microsoft.com/en-us/semantic-kernel/get-started/quick-start-guide). They picked a good teaching example and I didn't want to reinvent it for the sake of pretending I had. What I did was trim it down to the smallest thing that still shows off the idea, wrap a chat loop around it, and write it up in my own words.

Full source is up on GitHub: **[github.com/mikesipessr/Semantic-Kernel](https://github.com/mikesipessr/Semantic-Kernel)**. Clone it, set your API key, `dotnet run`, and ask it about your imaginary porch light.
