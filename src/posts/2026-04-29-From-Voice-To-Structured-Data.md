---
title: From Voice to Structured Data: Building a Healthcare AI Demo with Semantic Kernel
date: 2026-04-29
description: A walkthrough of building a healthcare web app that transcribes clinical voice notes and extracts structured tasks — lab orders, referrals, and medication refills — using OpenAI Whisper, GPT-4o, and Microsoft Semantic Kernel.
slug: from-voice-to-structured-data-building-healthcare-ai-demo-semantic-kernel
cover: /Files/blog/from-voice-to-structured-data.png
coverAlt: From Voice to Structured Data: Building a Healthcare AI Demo with Semantic Kernel
hideTitle: true
---
One of the things I find genuinely interesting about where AI is heading is not the chatbot stuff — it's the unglamorous back-office automation that could actually make people's lives easier. So I built a small demo to explore that space in healthcare, and I wanted to share what I learned.

## The Problem Worth Solving

Anyone who has spent time in or around a medical office knows that a huge amount of a clinician's day is spent translating spoken words into structured actions. A doctor finishes a patient visit, rattles off a note, and then someone — or the doctor themselves — has to manually convert that into a lab order, a medication refill request, a specialist referral. It's repetitive, it's error-prone, and it pulls focus away from actual patient care.

What if you could just speak the note and have the computer figure out what needs to happen next?

## What I Built

The demo is a web app with a React/TypeScript frontend and an ASP.NET Core backend running on .NET 10. You click a button, speak a clinical note, stop recording, and within a few seconds you see:

1. A full text transcription of what you said
2. A set of structured task cards — things like medication refills, lab orders, and specialist referrals — automatically extracted from your words

The stack looks like this:

- **OpenAI Whisper** handles the speech-to-text. The browser captures audio via the MediaRecorder API and sends it to the backend as a WebM blob.
- **GPT-4o** takes the transcription and extracts structured tasks from it. It returns clean JSON — patient name, task type, and a plain-English description of what needs to happen.
- **Microsoft Semantic Kernel** acts as the orchestration layer in the middle, wiring those two AI services together cleanly without tightly coupling the application to any specific provider.

## Why Semantic Kernel?

I want to be honest here — for a demo this size, you could wire up the OpenAI SDK directly and it would work fine. But Semantic Kernel is interesting for a few reasons that matter as soon as the project grows.

First, it gives you clean dependency injection. Rather than newing up an OpenAI client somewhere and passing it around, you register the services you need and let ASP.NET Core's DI container handle the rest. `IAudioToTextService` and `IChatCompletionService` show up in your constructors exactly like any other service.

Second, it's provider-agnostic by design. Right now I'm using OpenAI's hosted models. Switching to Azure OpenAI — which many healthcare organizations will require — is a one-line change in `Program.cs`. No other code changes needed.

Third, and this is the part I'm most excited about for a future version: Semantic Kernel has a built-in concept of *plugins* and *function calling* that makes it natural to build agentic workflows. The next step for this demo would be to give the AI tools it can actually invoke — call a pharmacy API to submit the refill, post an HL7 message for the referral, create the lab requisition in the EHR. That's where this gets genuinely interesting.

## The Prompt Engineering Part

Getting GPT-4o to return clean, parseable JSON reliably took a bit of iteration. The key constraints I landed on:

- "Return ONLY a valid JSON array. No explanation, no markdown, no code fences." Without this the model wraps its output in backticks and the parser blows up.
- Explicit schema with exact field names and allowed enum values. Giving the model a precise target reduces drift.
- "Do not invent patient names." LLMs have a strong instinct to fill in missing information. If the speaker didn't mention a name, I want an empty string, not a hallucinated one.
- Temperature set to 0 for deterministic output. For structured data extraction, creativity is not a feature.

The classification recognizes four task types today: **MedicationRefill**, **MedicationOrder**, **ReferralOrder**, and **LabOrder**. Adding a new type is straightforward — update the enum, update the system prompt, update the frontend card renderer.

## ⚠️ Important Caveats

Before anyone gets too excited, a few things need to be said clearly.

**This is a demo, not a production system.** There is no authentication, no audit logging, no EHR integration, no error handling beyond the basics, and no validation that the AI's extracted tasks are correct. Shipping something like this into a real clinical workflow would require significant additional engineering work across all of those dimensions.

**HIPAA compliance is not optional.** If you are processing real patient data — actual names, actual diagnoses, actual prescriptions — you are dealing with Protected Health Information (PHI). Sending PHI to any third-party AI provider requires a Business Associate Agreement (BAA) to be in place with that provider. OpenAI does offer a BAA for qualifying accounts on their API, and Microsoft Azure OpenAI offers one as well. But you need to have that agreement signed and your usage scoped appropriately *before* any real patient data touches these services. This demo uses entirely fictional notes and should never be tested with real patient information.

## What's Next

The natural next step is adding the agentic layer — giving the AI actual tools to invoke rather than just extracting tasks and displaying them. Each `TaskType` would map to a Semantic Kernel plugin that calls a real (or mocked) downstream system. That's the jump from "interesting demo" to "actually useful," and Semantic Kernel is well-suited for it.

I also want to look at streaming the transcription back to the browser in real time rather than waiting for the full result. Whisper doesn't support true streaming in the same way chat models do, but there are approaches worth exploring.

![SK Healthcare Demo Screenshot](/Files/blog/SKHealthcareScreen.png)

The code is [on GitHub](https://github.com/mikesipessr/SemanticKernelHealthcare) if you want to take a look. Happy to answer questions about any part of the implementation.

