# OmniScape Mintlify — agent instructions

Copy this file to the root of [jazzmoradia/docs](https://github.com/jazzmoradia/docs) as `AGENTS.md`.

Full development guide (setup, workflow, content map): **`OmniScape/Docs/Mintlify_Development.md`** in the plugin repo.

## About this project

- Public documentation for **OmniScape** — procedural settlement generator for Unreal Engine 5.5+
- Built on [Mintlify](https://mintlify.com): MDX pages + `docs.json`
- Audience: Fab buyers, level designers, environment artists — not plugin contributors

## Terminology

| Use | Avoid |
|---|---|
| Control Center | control panel, settings UI |
| OmniScape Generator | spawner, generator actor |
| Generate / Save to Level | bake (unless quoting UI) |
| Large / Medium / Small tiers | P0, P1, P2 |
| Settlement | PCG graph, pipeline |
| Layout → Build → Structure → Ambient | internal tab codenames |
| Preset | profile, config file |
| Live Preview, Auto-Generate | Preview, Auto alone on first mention |
| Bring your own art (BYOA) | bundled assets |

## Style

- Second person ("you"), active voice
- Outcome-oriented: what the artist gets, not how the backend works
- Sentence case for headings
- **Bold** for UI labels; `code` for menu paths and file names
- One idea per sentence; concise paragraphs

## Version rules

- **Fab ships 2.7.0** today. **3.0.0** is in development.
- Mark v3-only features (Atlas wizard, 12 presets, semantic zones, v3 algorithms, fauna/audio/PCG beta pillars) with a `<Note>` or frontmatter `tag: "v3.0"`.
- Do not claim v3 features exist in the current Fab download unless explicitly labeled.

## Content boundaries

**Document:**

- Installation, Control Center workflow, presets, layout patterns
- Roads, walls, flora, fauna, audio (beta), Atlas, Blueprint hooks
- Troubleshooting, FAQ, packaging, compatibility
- Creative direction recipes (artist-facing)

**Do not document:**

- Internal C++ class names, UPROPERTY field names, seed constants
- Slate implementation, IR parity harness, automation test details
- Unreleased features without v3.0 labeling
- `Packaged/` or HostProject paths

## Fact-check sources (plugin repo)

Before publishing factual claims, verify against:

- `OmniScape/Docs/OmniScape_Gist.md` — user guide source
- `OmniScape/Docs/CHANGELOG_PUBLIC.md` — release notes
- `OmniScape/Docs/Presets.md` — preset catalog
- `OmniScape/Docs/OmniScape_Atlas.md` — Atlas workflow
- Feature contracts (`OmniScape_*Contract.md`) for beta pillars

## File conventions

- Pages: `.mdx` with YAML frontmatter (`title`, `description`, optional `sidebarTitle`, `tag`)
- Internal links: root-relative, no extension — `/guides/presets`
- New pages must be listed in `docs.json` → `navigation`
- Images: `/images/` with descriptive alt text

## Commands

```bash
mint dev          # preview at localhost:3000 (Node LTS 20/22 only)
mint validate     # must pass before merge
mint broken-links
```

## Custom components & styling

This site ships a bespoke design layer on top of Mintlify. Reuse it; don't reinvent.

- **Theme is LIGHT** — `appearance.default: "light"`, `strict: true`. The site is a bold, minimal, editorial light experience on warm paper. The **Control Center stays a dark instrument**, seated on the page as a "device" for deliberate contrast. Settlement render tiles (intent gallery) and the determinism mini-screens are also kept dark on purpose ("dark device islands").
- **`style.css`** (global) — OmniScape design tokens as `--os-*` variables plus `.os-*` component classes. `--os-sf*` are paper surfaces, `--os-t*` are ink, `--os-*-t` are the legible accent text colors, and `--os-dk*` are the fixed dark-device palette. Tailwind v3 utility classes work, but **arbitrary values are not supported** — use the `.os-*` classes or inline `style`.
- **`reveal.js`** (global) — adds `.is-in` to `.os-reveal` elements on scroll. Wrap a block in `os-reveal` to fade it in.
- **`snippets/control-center-explorer.jsx`** — the signature interactive: embeds the canonical v13 mockup (`control-center-mockup.html`) and maps capabilities to UI locations, with tab sync via `postMessage`. Self-contained.
- **`snippets/omniscape.jsx`** — shared components: `CinematicHero`, `HeroPanel`, `WorkflowSpectrum`, `IntentTile`, `DeterminismDemo`, `PhaseTag`, plus the `drawIso` (isometric, ink-on-paper) and `drawMini` (top-down, dark) canvas renderers and the `genVariant` deterministic generator. All in one file because Mintlify forbids nested snippet imports.
- **`CinematicHero`** is the landing signature: a scroll-pinned stage where a stylized isometric settlement builds itself on paper (`drawIso`, driven by scroll progress), then cross-fades / docks into the dark Control Center iframe at the center. Honors `prefers-reduced-motion` (falls back to the seated device with the build complete) via the `os-cine--static` class.
- **Phase accents** — apply `os-phase-layout` / `-build` / `-structure` / `-ambient` to set `--os-accent`. The inline `<span className="os-tag os-phase-…">` chip marks a control's home tab or a v3.0 / Beta feature.
- **Interactives are generated**, not screenshots — they use a seeded RNG (`same seed = same layout`). No external npm packages; React hooks are globally available in the sandbox.
- **Landing** (`index.mdx`) is `mode: "custom"` wrapped in `.os-landing`.

## Support links (keep current)

- Support thread: https://gist.github.com/jazzmoradia/6c4383fb51914f9bf083ccd472ee6b12
- Fab: https://fab.com/s/4aeff49faf04
- Discord: https://discord.gg/UjXbjW6gUH
- Demo: https://youtu.be/xFo9JeM7dgc
