# Mike Sipes — Portfolio & Resume

A modern, responsive single-page portfolio website built with React and Vite, showcasing 25+ years of software engineering experience.

## Features

- **Responsive design** — Mobile-first layout with breakpoints for tablet and desktop
- **Dark mode** — Automatically adapts to the user's system preference via `prefers-color-scheme`
- **Scroll animations** — Sections fade in on scroll using Intersection Observer
- **Sticky navigation** — Fixed nav bar appears after scrolling, highlights the active section
- **Accessible** — Semantic HTML, skip-to-content link, ARIA labels, focus-visible states
- **Print-ready** — Includes a print stylesheet for clean PDF output
- **Downloadable resume** — Direct PDF download from the hero section

## Tech Stack

| Layer     | Tool                          |
|-----------|-------------------------------|
| Framework | React 19                      |
| Bundler   | Vite 8                        |
| Styling   | Custom CSS (Grid + Flexbox)   |
| Linting   | ESLint 9 with React plugins   |
| Icons     | Inline SVG                    |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Install & Run

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The dev server starts at **http://localhost:50893**.

### Build for Production

```bash
npm run build
```

Output is written to the `dist/` directory, ready for static hosting.

### Preview the Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── App.jsx        # Main application component (sections, data, hooks)
├── App.css        # Component styles, responsive breakpoints, dark mode
├── main.jsx       # React entry point
└── index.css      # Global resets and base styles

public/
├── Files/         # Headshot images and downloadable resume PDF
├── favicon.svg
└── icons.svg
```

## Updating Content

All resume content — summary, skills, experience, and strengths — is defined as data arrays in `src/App.jsx`. Edit those arrays directly to update the site.
