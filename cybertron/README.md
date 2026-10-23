# Cybertron, annotated

An illustrated field guide to **Vector**, the engineering platform concept at the centre of Project Cybertron. A hub page and 16 chapters take the design apart one idea at a time: each chapter explains how the design works, pins it on the real screens, lets you try it in a small lab, and sets it beside how other tools do the same job.

## View it

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / root. The guide is then served at `https://venkateshterikuti.github.io/vector/`.
- **Locally:** open `index.html` in a browser. Fonts load from Google Fonts; everything else is in this folder.

## What's inside

| File | Chapter |
|---|---|
| `index.html` | The map: the whole machine, the journey of ticket COM-2841, and the design trail |
| `problem.html` | 01 · The scattered answer |
| `names.html` | 02 · Names and the map |
| `planes.html` | 03 · Five planes |
| `environment.html` | 04 · One environment |
| `matrix.html` | 05 · Matrix |
| `knowledge.html` | 06 · Answers with sources |
| `codex.html` | 07 · Code in Dev |
| `pipelines.html` | 08 · Builds that explain themselves |
| `allspark.html` | 09 · AllSpark |
| `evals.html` | 10 · Evals |
| `release.html` | 11 · The sealed bundle |
| `sentinel.html` | 12 · Sentinel |
| `observe.html` | 13 · Observe and cost |
| `bee.html` | 14 · @B |
| `interface.html` | 15 · The interface |
| `road.html` | 16 · The road |

Shared resources:

- `field.css`: the guide's stylesheet (light only, colour marks the five planes).
- `field.js`: the scroll-driven drawing engine, screen plates, lightbox and comparison tables. No library dependencies.
- `screens/v3/`: the 30 boards of Vector UI Concepts v3, rendered from the design files.
- `screens/home/`: the six homepage directions (A–F).
- `screens/v2/`: three screens from the earlier 28-screen set, used to show what changed in v3.

## Three layers

Every chapter separates what the **Atlas prototype** does today, what the **v3 design** shows, and what is only a **production proposal**. Labs run on the v3 design's own data or on the prototype's documented logic. Cost figures from the design are illustrative.
