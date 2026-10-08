# AGENTS.md

## What this is
Google Apps Script (GAS) web app — "Biblioteca de Prompts" (Spanish prompt library), managed locally with `clasp`. **Not** a typical web project: no npm, no bundler, no test runner. Do not run `npm install`/`build`/`test`. There is no local verification — changes only appear after pushing and redeploying.

## Files
- `Código.js` — server entrypoint. Only `doGet()`, which serves `Index.html` via `HtmlService.createHtmlOutputFromFile('Index')` and sets `XFrameOptionsMode.ALLOWALL` (allows iframe embedding). The filename is not referenced by code; only `doGet` matters.
- `Index.html` — the entire UI (static HTML/CSS/JS; all logic in one inline `<script>`). Self-contained port of a saved Next.js prompt-library page (the original `referencia_prompts.htm`/`referencia_prompts_files/` were removed from the repo). Cyber-neon dark theme; loads Space Grotesk + JetBrains Mono from Google Fonts. The body is minified, so edit prompt text carefully (use Python `re.sub` for targeted changes).
- `appsscript.json` — GAS manifest: V8 runtime, timezone `America/Bogota`, web app `executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS` (public, no auth).
- `.clasp.json` — clasp binding. `scriptId` links this repo to a specific Apps Script project (binding, not a secret — don't change/rotate it). `rootDir: ""` = files at repo root, pushed flat.
- `.claspignore` — excludes `referencia_prompts_files/`, `referencia_prompts.htm`, `.DS_Store` from push. Uses `**/dir/**` (multimatch): a bare `dir/` won't recurse.
- `banner.png` — local asset, **not** used by the app (Apps Script can't serve local files); the banner uses an external Google Drive URL.

## Commands (clasp)
```
clasp push      # upload local files to the Apps Script project
clasp pull      # download project files to local
clasp open      # open the Apps Script editor
clasp deploy    # create a NEW deployment (new URL)
clasp deploy --deploymentId <id>   # update an existing deployment (keeps the URL)
clasp deployments                 # list deployment IDs
```
After `clasp push`, changes are NOT live until you create/update a deployment. To keep the existing URL, pass `--deploymentId` (the active one is currently `AKfycbxu1mKAx4744OmoqZd3nUrZ3vVETGY3omcaRwRy2feirZwXwAweQwt--iIaLqK4ckDz`).

## Gotchas
- **Apps Script doesn't serve local files**: any image must be an external absolute URL or a base64 data URI. Local paths like `banner.png` won't load.
- **Google Drive images**: use `https://drive.google.com/thumbnail?id=<ID>&sz=...` (or `uc?export=view&id=<ID>`), NOT `/file/d/<id>/view` (that returns HTML → broken image). The file must be shared as "Anyone with the link → Reader", or it 403s.
- **Card media**: each `<img>` has a `<!-- p: '<Título>' -->` comment and `alt` = title, so you can find which `src` to replace. Placeholders use `placehold.co`; real ones use Drive `thumbnail`.
- **Full-height layout**: use `html, body { height:100% }`, not `100vh` (Apps Script iframe quirk). Preserve it.
- **No `<base target="_top">`** — it broke in-page anchor navigation in the Apps Script iframe. The index menu scrolls via a JS `scrollIntoView` handler (which also closes the mobile `<details>`). Keep menu `href="#..."` in sync with section `id`s.
- **Clipboard**: `copyToClipboard` copies the sibling `.bp-pre` text using `navigator.clipboard` with a `document.execCommand('copy')` fallback for the Apps Script iframe.
- **Online edits**: the user sometimes edits in the Apps Script editor (not locally). If asked to "deploy manual changes" and local files are unchanged, deploy WITHOUT `clasp push` (push would overwrite the online edits).
- **Public web app**: `access: ANYONE_ANONYMOUS` — anyone with the URL sees it. Never put secrets in `Index.html`/`Código.js`.
- **Language**: UI copy is Spanish (`es`). Keep new strings in Spanish.
- **Dead CSS**: `.bp-ph` and `.bp-h1` rules remain but are unused (the `h1` was removed and `.bp-ph` divs were replaced by `<img>`); harmless, can be cleaned up.
