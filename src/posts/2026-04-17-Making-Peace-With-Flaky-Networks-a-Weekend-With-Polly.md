---
title: Making Peace with Flaky Networks: A Weekend with Polly
date: 2026-04-17
description: The network fails more than we like to admit. Polly gives .NET developers a clean, composable vocabulary for handling it. Here's a tour of four resilience patterns — Retry, Circuit Breaker, Timeout, and Rate Limiter — through a tiny .NET 8 demo app you can run in under a minute.
slug: making-peace-with-flaky-networks-a-weekend-with-polly
cover: /Files/blog/polly-demo.png
coverAlt: Making Peace with Flaky Networks: A Weekend with Polly in .NET 8
hideTitle: true
---
I've been writing .NET code for a while now, and if there's one lesson the network has tried to teach me over and over, it's this: **the happy path is a lie**. Servers blink. DNS hiccups. That one downstream service you depend on decides, at 2 AM on a Saturday, that it's going to take a nap.

For years I handled this the way most of us do — a `try/catch` here, a hand-rolled `for` loop with a `Thread.Sleep` there, maybe a feature flag I was too scared to turn off. It worked, mostly. But "worked mostly" is a terrible place to live, and I finally got tired of living there.

So I spent a weekend with [Polly](https://github.com/App-vNext/Polly), and I want to share what stuck.

## Why I built a tiny demo instead of just reading the docs

Polly's documentation is genuinely good. But I have the kind of brain that needs to *see it fail* before it really believes. Reading about a circuit breaker is one thing. Watching a circuit breaker trip because I asked it to is another.

So I built [PollyDemo](https://github.com/mikesipessr/PollyDemo) — a tiny .NET 8 console app that fetches `google.com` (the world's most boring test endpoint, and I mean that as a compliment) and wraps each call in a different Polly pattern. Four patterns, four files, one `Program.cs` that runs them back to back. That's it.

```csharp
public static void Main()
{
    new Retry().RetryDemoWithResult().Wait();
    new CircuitBreaker().CircuitBreakerExample().Wait();
    new Timeout().TimeoutExample().Wait();
    new RateLimiter().RateLimiterExample().Wait();
}
```

No DI container. No abstractions. Nothing clever. When I'm learning a library, I want the *library* to be the main character.

## Pattern 1: Retry with exponential backoff

This is the one everybody reaches for first, and for good reason. Transient failures are… transient. Wait a moment, try again, and most of the time you're fine.

But please — **please** — don't retry immediately in a tight loop. That's how you take a hiccup and turn it into an outage. Exponential backoff is the grown-up version:

```csharp
var retryPolicy = Policy
    .Handle<HttpRequestException>()
    .WaitAndRetryAsync(
        retryCount: 3,
        retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))
    );
```

Attempt 1 waits 2 seconds. Attempt 2 waits 4. Attempt 3 waits 8. If it's still broken after 14 seconds of polite patience, it's not transient, and retrying harder isn't going to help.

The line I keep coming back to is this: **retries are a promise that the problem is probably temporary.** If you're not sure that's true, you probably want a different pattern.

## Pattern 2: Circuit breaker

Circuit breakers used to feel like overkill to me. "Why would I *stop* trying? I want the request to go through." Then I worked on a service where a single slow dependency took down the whole box because every thread was blocked waiting on it, and suddenly I got it.

```csharp
var circuitBreakerPolicy = Policy
    .Handle<HttpRequestException>()
    .CircuitBreakerAsync(2, TimeSpan.FromSeconds(10));
```

After 2 consecutive failures, the circuit opens for 10 seconds. While it's open, requests fail *immediately* — no waiting, no pileup. It's the software version of "stop poking the bruise." You give the downstream service room to breathe, and you stop burning your own resources on a lost cause.

The thing that clicked for me: a circuit breaker isn't there to protect the *caller*. It's there to protect the *callee*. You're being a good neighbor.

## Pattern 3: Timeout

The simplest pattern, and somehow the one I forget the most:

```csharp
var timeoutPolicy = Policy.TimeoutAsync(TimeSpan.FromSeconds(5));
```

Five seconds. That's it. If the call doesn't come back in five seconds, it's canceled and a `TimeoutRejectedException` gets thrown. You catch it, you move on.

I cannot tell you how many production issues I've seen that boil down to "a request hung forever because nobody set a timeout." The default for most HTTP clients is basically "wait until the heat death of the universe." That's not a default — that's a trap.

Set a timeout. Set it today.

## Pattern 4: Rate limiter

This one is about **being a good citizen**. Most third-party APIs have rate limits, and when you exceed them you don't just get throttled — you often get *punished*. Temporarily banned. Your key quietly deprioritized. That kind of thing.

```csharp
var rateLimiterPolicy = Policy
    .RateLimitAsync(3, TimeSpan.FromSeconds(10));
```

Three requests per 10 seconds. If you exceed it, Polly throws `RateLimitRejectedException` and you handle it gracefully. The beauty is that the limit is enforced on *your* side, so you never even send the offending request. You fail fast, cheaply, and before the other team's pager goes off.

## The little pattern that pulls it all together

One thing I did for myself — not a Polly thing, just a sanity thing — was wrap every result in a tiny `OperationResponse<T>`:

```csharp
public class OperationResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public List<string> ErrorMessages { get; set; } = new();

    public static OperationResponse<T> Ok(T data) => new() { Success = true, Data = data };
    public static OperationResponse<T> Fail(params string[] errors) =>
        new() { Success = false, ErrorMessages = errors.ToList() };
}
```

Nothing fancy. But having a single shape for "did it work, and if not, why?" made every demo feel consistent, and it kept the calling code honest. You check `Success`. You handle `ErrorMessages`. You don't pretend failures don't exist.

This isn't a Polly pattern — it's just a habit. But the two play nicely together, and I'd rather show it than hide it.

## What I'm taking away

If I had to boil the weekend down to four sentences:

1. **Retry** when you believe the problem is temporary.
2. **Break the circuit** when the problem isn't temporary and you're making it worse.
3. **Time out** always, on everything, without exception.
4. **Rate limit** yourself before someone else does it for you.

Polly doesn't magically make your code resilient. Resilience is a design choice — Polly just gives you a clean, composable vocabulary for expressing it. That's the part I didn't fully appreciate until I watched a circuit trip in my own terminal.

## If you want to play with it

The repo is public and dead simple to run:

```bash
git clone https://github.com/mikesipessr/PollyDemo.git
cd PollyDemo
dotnet run --project PollyDemo
```

You'll need the .NET 8 SDK and an internet connection. Everything else is just reading the console and watching the patterns do their thing. Break your wifi halfway through for extra credit — that's honestly when it got fun.

Happy hacking, and may all your exceptions be handled.
