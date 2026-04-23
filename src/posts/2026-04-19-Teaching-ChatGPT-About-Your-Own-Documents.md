---
title: Teaching ChatGPT About Your Own Documents: A Beginner-Friendly Tour of RAG
date: 2026-04-19
description: ChatGPT is smart, but it has no idea what's in your documents. Retrieval-Augmented Generation fixes that. Here's a plain-English walkthrough of a tiny two-part demo — a Python loader and a C# querier — that shows how RAG actually works end to end.
slug: teaching-chatgpt-about-your-own-documents-a-tour-of-rag
cover: /Files/blog/rag-tour.png
coverAlt: Teaching ChatGPT About Your Own Documents: A Beginner-Friendly Tour of RAG
hideTitle: true
---
If you've ever wished ChatGPT knew about *your* stuff — your company handbook, your HOA bylaws, a stack of PDFs on your desk — you've already stumbled into the problem that Retrieval-Augmented Generation (RAG) was built to solve. The large language model is smart, sure, but it has no idea what's in the documents sitting on your hard drive. RAG is the trick we use to hand it the right pages at the right moment so it can answer questions grounded in your content.

I built a tiny two-part demo to show how this works end to end, and I wanted to walk through it here in plain English. No frameworks, no abstractions — just two small projects that you can read top to bottom in a few minutes. Both are up on GitHub if you want to follow along or clone them:

- **Python loader:** [github.com/mikesipessr/EmbedsExample](https://github.com/mikesipessr/EmbedsExample)
- **C# console app:** [github.com/mikesipessr/EmbedDemoConsoleApp](https://github.com/mikesipessr/EmbedDemoConsoleApp)

## The Two Halves of the System

RAG has two distinct jobs, and I split them into two projects so the seams are easy to see.

**The loader** ([`EmbedsExample`](https://github.com/mikesipessr/EmbedsExample), a Python script) takes a PDF, chops it up, turns each chunk into a vector, and stuffs those vectors into a Pinecone index. Think of this as "filing the cabinet."

**The querier** ([`EmbedDemoConsoleApp`](https://github.com/mikesipessr/EmbedDemoConsoleApp), a C# console app) takes a question from the user, finds the most relevant chunk from that cabinet, and asks ChatGPT to answer using it. Think of this as "pulling the right folder and reading from it."

That's the whole thing. Let's look at each half.

## Part 1: Filing the Cabinet (The Python Loader)

Here's the loader's job, step by step:

1. **Open the PDF and yank out the text.** The script uses `PyPDF2` to walk through every page of a PDF and concatenate the text into one big string. Nothing fancy.

2. **Split the text into chunks.** Why? Because if you embed a whole 40-page document as one vector, you've essentially averaged the meaning of the entire document into a single point — you've lost all the specifics. Smaller chunks let you match on specific ideas. The script splits on double newlines, which roughly approximates "by paragraph."

3. **Turn each chunk into a vector.** This is where OpenAI's `text-embedding-ada-002` model comes in. You hand it a piece of text, and it hands you back 1,536 numbers that represent the *meaning* of that text. Two chunks that talk about the same topic — even with totally different words — will end up with similar numbers. That's the magic that makes search work later.

4. **Upsert into Pinecone.** Pinecone is a vector database. Its whole reason for existing is to take a list of those numeric vectors and make it fast to ask, "which of these is closest to this new vector?" The script sends the embeddings up in batches of ten, each tagged with a unique ID and — crucially — the original text as metadata. That last part matters because vectors alone aren't human-readable. We need to be able to retrieve the actual text later.

Run this script once per document, and your cabinet is filled.

## Part 2: Asking a Question (The C# Console App)

Now for the fun half. The console app runs like this:

1. **Prompt the user for a question.** "What are the rules about parking overnight?" or whatever.

2. **Embed the question.** Same `text-embedding-ada-002` model, same 1,536-number output. The key insight here: the *question* gets embedded into the same vector space as the *document chunks* from Part 1. That shared space is what makes them comparable.

3. **Ask Pinecone for the closest match.** The app sends the question's vector up to Pinecone with `topK = 1`, which is a fancy way of saying "give me the single nearest chunk." Pinecone does a similarity search across everything you filed earlier and hands back the winner, along with the original text stored in its metadata.

4. **Build a combined prompt and send it to ChatGPT.** This is the "augmented" part of Retrieval-Augmented Generation. The prompt looks roughly like:

   > Using the context below, answer the following question:
   >
   > Question: *(the user's question)*
   >
   > Context: *(the chunk Pinecone just gave us)*

5. **Print the answer.** ChatGPT reads the context, answers the question, and the console prints the result.

## Why This Works (And Why It's a Big Deal)

Here's the thing that always strikes me: at no point does ChatGPT "know" anything about your PDF. It doesn't get fine-tuned, it doesn't memorize your documents, nothing is uploaded to OpenAI permanently. Every single question pulls a relevant snippet on the fly and shows it to the model *as part of the question itself*. The model just reads and answers, the way you might read a passage and answer a reading-comprehension question.

That's genuinely useful because:

- **It scales.** You can have thousands of documents in Pinecone, and each query only pulls the one (or few) chunks that actually matter. The LLM never sees the rest.
- **It's current.** Want to add a new document? Run the loader again. No retraining, no model updates.
- **It keeps the model honest.** When you force ChatGPT to answer *from* a specific chunk of text, it's much less likely to make things up. The answer is grounded in something real.

## Where to Go From Here

This demo is deliberately bare-bones — it handles one PDF at a time, retrieves exactly one chunk per question, and stores API keys right in the source code (don't do that in anything real). But the bones are the same as what powers serious production RAG systems:

- Want better retrieval? Pull the top 3-5 chunks instead of just 1, and let the model synthesize across them.
- Want better chunking? Swap paragraph splits for semantic or sentence-overlap chunking.
- Want conversation? Keep a running chat history and embed it alongside the question.
- Want a different database? Swap Pinecone for Weaviate, Qdrant, pgvector, or any other vector store — the shape of the code barely changes.

Once you see the two-step pattern clearly — *file it, then fetch it* — every RAG system starts to look like variations on the same idea. And that, I think, is the best reason to build the simple version first.

If you want to poke at the code, clone either or both:

```bash
git clone https://github.com/mikesipessr/EmbedsExample.git
git clone https://github.com/mikesipessr/EmbedDemoConsoleApp.git
```

Drop in your OpenAI and Pinecone keys, point the loader at a PDF, and you'll have your own little RAG system running in about five minutes.
