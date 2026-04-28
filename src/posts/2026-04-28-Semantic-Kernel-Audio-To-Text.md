---
title: Talking to Your Console App with Semantic Kernel and Whisper
date: 2026-04-28
description: A practical walkthrough of building a small .NET console app that records audio with NAudio, sends it through Semantic Kernel's audio-to-text service, and uses Whisper to turn spoken words into text.
slug: talking-to-your-console-app-with-semantic-kernel-and-whisper
cover: /Files/blog/SKAudioToText.png
coverAlt: Talking to Your Console App with Semantic Kernel and Whisper
hideTitle: true
---
I had a Saturday afternoon to kill and an itch to play with Semantic Kernel's
audio-to-text bits. The idea was small on purpose: hold the spacebar, talk at
my laptop, watch the words show up in a console window. No web app, no fancy
UI, no Kubernetes cluster. Just a tiny .NET console app that records me and
then asks Whisper what I said.

It took me about an hour to get it working, and most of that hour was three
specific potholes I didn't see coming. So this post is partly a walkthrough
and partly a "here are the things that almost made me put my laptop into a
lake."

## The pieces

Three moving parts, that's it:

- **NAudio** to record from the microphone. NAudio is one of those libraries
  that has been around forever in .NET land, does exactly what it says on the
  tin, and has the kind of API that feels like it was designed by someone who
  has actually had to record audio before. WaveInEvent grabs samples from the
  OS, WaveFileWriter writes them to a WAV file. Done.

- **Microsoft.SemanticKernel** as the glue. The interesting bit here is that
  Semantic Kernel exposes audio transcription through an interface called
  `IAudioToTextService`. You don't talk directly to OpenAI — you ask the
  kernel for a service that happens to be backed by OpenAI today, and could
  be backed by Azure, a local model, or your own endpoint tomorrow. It's the
  same shape of abstraction Semantic Kernel uses for chat and embeddings, and
  once you've used it for one thing the pattern carries over.

- **OpenAI's `whisper-1`** model on the back end. Cheap, fast, accurate
  enough that I stopped noticing the typos. About a tenth of a cent per
  minute of audio at the time of writing.

That's the whole stack. Let's walk through what the code actually does.

## The recording loop

The recording side is where I expected to spend zero time and ended up
spending most of it. The naive version is exactly what you'd write on the
first try:

```csharp
using var waveIn = new WaveInEvent
{
    WaveFormat = new WaveFormat(rate: 16_000, bits: 16, channels: 1),
};
using var writer = new WaveFileWriter(wavPath, waveIn.WaveFormat);

waveIn.DataAvailable += (_, e) => writer.Write(e.Buffer, 0, e.BytesRecorded);

waveIn.StartRecording();
Console.ReadLine();        // press enter to stop
waveIn.StopRecording();
```

That looks right and runs without errors and produces a WAV file that
Whisper happily transcribes as exactly nothing, because the file is empty.

The problem is that `StopRecording` is asynchronous-ish. It signals NAudio's
internal recording thread to stop and fires a `RecordingStopped` event when
that thread is actually done flushing buffers. If your `using` block disposes
the `WaveFileWriter` before that happens — and it will, because the main
thread doesn't wait — you end up with a WAV header that says "zero bytes
of audio follow" and zero bytes of audio following.

The fix is to wait for the `RecordingStopped` event before disposing
anything:

```csharp
var stoppedTcs = new TaskCompletionSource();

waveIn.RecordingStopped += (_, _) =>
{
    writer.Dispose();
    waveIn.Dispose();
    stoppedTcs.TrySetResult();
};

waveIn.StopRecording();
await stoppedTcs.Task;
```

This is one of those things where the docs technically tell you, in passing,
in a sentence you don't notice until after you've spent forty minutes
wondering why your microphone is "broken."

I also added a tiny live level meter that prints `level: [#######    ]`
while recording, mostly because debugging a silent WAV file is miserable and
seeing bars move when you talk takes about three seconds to confirm
everything is fine. Highly recommend adding something like this any time
you're working with hardware capture — the feedback loop is worth more than
the ten lines of code it costs.

## The Semantic Kernel bit

Once you have a WAV file, the SK side is genuinely about ten lines:

```csharp
Kernel kernel = Kernel.CreateBuilder()
    .AddOpenAIAudioToText(modelId: "whisper-1", apiKey: apiKey)
    .Build();

IAudioToTextService audioToText = kernel.GetRequiredService<IAudioToTextService>();

byte[] audioBytes = await File.ReadAllBytesAsync(wavPath);
var audioContent = new AudioContent(new BinaryData(audioBytes), mimeType: "audio/wav");

var settings = new OpenAIAudioToTextExecutionSettings(Path.GetFileName(wavPath))
{
    Language = "en",
    Temperature = 0.0f,
};

TextContent transcription = await audioToText.GetTextContentAsync(audioContent, settings);
Console.WriteLine(transcription.Text);
```

A few things worth pointing out.

The `Kernel.CreateBuilder()...Build()` ritual feels heavier than it needs to
for one service, but it's the same pattern you'd use if you were also adding
chat completion, embeddings, function calling, and whatever else. The
investment pays off the moment you want a second AI capability — you're not
copy-pasting `HttpClient` setup code, you're adding a line to the builder.

`AudioContent` wants both the bytes and a MIME type. The MIME type matters
because the OpenAI connector turns this into a multipart form upload and
needs to set `Content-Type` correctly on the file part. Pass `audio/wav` for
a WAV, `audio/mpeg` for an MP3, etc.

`OpenAIAudioToTextExecutionSettings` takes a filename in its constructor.
This is a little weird — you're handing in bytes already, why does it want
a filename? It's because OpenAI's transcription API uses the file extension
on that name to validate the audio format. Hand it `recording.wav` and you
get through; hand it `recording` and you get a 400.

## The three potholes

For posterity (and for anyone Googling the same error message at 2 AM), the
three things that bit me in order:

**`setx OPENAI_API_KEY ...` doesn't update the current shell.** It writes
the variable to the registry for *future* processes. Your current terminal,
and the IDE you launched before running setx, both still see the old (empty)
value. Either close everything and open a fresh terminal, or do
`$env:OPENAI_API_KEY = "sk-..."` for the current PowerShell session. This
caught me even though I've known about it for years. It always catches me.

**Empty WAV files from the dispose-before-flush race I mentioned above.**
If your level meter is moving but the file size at the end is 44 bytes
(that's the size of a WAV header with no data), this is your problem.

**`ResponseFormat = "text"` throws `NotSupportedException`.** The SK OpenAI
connector validates the response format string and only accepts `json`,
`verbose_json`, `vtt`, and `srt`. Drop the property entirely and let it
default. You still get the transcription as a plain string out of
`TextContent.Text` — the format setting controls the shape of the response
*from* OpenAI, not the shape of what comes back to your code. I lost about
fifteen minutes to this one because the OpenAI API docs do list `text` as a
valid format, and it is, just not in the SK wrapper.

## What this unlocks

The thing I find genuinely interesting about Semantic Kernel here isn't this
specific demo. It's that the same `Kernel` object that just transcribed my
voice can also do chat completion, function calling, planning, and RAG. So
the obvious next move is: pipe the transcription straight into a chat
completion call and you have a voice assistant in maybe forty more lines of
code. Add a text-to-speech connector on the way out and now you're having a
conversation with your laptop.

I'll probably build that next. But for one Saturday afternoon, getting from
"empty project" to "console app that listens to me and writes down what I
said" felt like a fair trade.

Full source is up at
[github.com/mikesipessr/SemanticKernelAudioToText](https://github.com/mikesipessr/SemanticKernelAudioToText).
Steal whatever's useful.
