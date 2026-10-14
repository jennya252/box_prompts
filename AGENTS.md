# AGENTS.md

## Idioma de respuesta
Responde **siempre en español**: todas las respuestas, explicaciones y resúmenes de la conversación. (El contenido del código no cambia; sigue las reglas de idioma de abajo: UI en español, prompts en inglés.)

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
> **El usuario ejecuta los comandos `clasp` y `git` manualmente.** No los corras tú. Haz los cambios en los archivos locales y deja la publicación (push/deploy) y los commits al usuario.

```
clasp push      # upload local files to the Apps Script project
clasp pull      # download project files to local
clasp open      # open the Apps Script editor
clasp deploy    # create a NEW deployment (new URL)
clasp deploy --deploymentId <id>   # update an existing deployment (keeps the URL)
clasp deployments                 # list deployment IDs
```
After `clasp push`, changes are NOT live until you create/update a deployment. To keep the existing URL, pass `--deploymentId`; run `clasp deployments` to list them and pick the one to update (don't hard-code an ID — the list changes over time).

## Gotchas
- **Apps Script doesn't serve local files**: any image must be an external absolute URL or a base64 data URI. Local paths like `banner.png` won't load.
- **Google Drive media**: images use `<img>` with `https://drive.google.com/thumbnail?id=<ID>&sz=...` (or `uc?export=view&id=<ID>`), NOT `/file/d/<id>/view` (returns HTML → broken image). Videos use `<iframe>` with `https://drive.google.com/file/d/<ID>/preview` — that's the working embed form. Drive files must be shared as "Anyone with the link → Reader", or they 403.
- **Card anatomy**: each `.bp-card` = a `.bp-media` figure (`<img>` for images / `<iframe>` for video) + a `<pre class="bp-pre">` holding the prompt text; `copyToClipboard` copies that `<pre>`'s `innerText`. The library has 3 parts — A: imagen, B: vídeo, C: formatos. Each `<img>` has a `<!-- p: '<Título>' -->` comment and `alt` = title, so you can find which `src` to replace.
- **Video popup button**: embedded Drive videos show a top-right "open externally" button (the Google Translate "Ventana emergente" popup). It lives **inside the cross-origin `<iframe>`**, so it's NOT in `Index.html` and cannot be removed from the DOM. It's blocked with a **transparent** CSS overlay over the top-right corner: `.bp-media:has(iframe)::after` (`background:transparent`). The button may still be visible on hover but is unclickable. Do NOT try to delete it from the HTML — it isn't there; the overlay is the fix.
- **Full-height layout**: use `html, body { height:100% }`, not `100vh` (Apps Script iframe quirk). Preserve it.
- **No `<base target="_top">`** — it broke in-page anchor navigation in the Apps Script iframe. The index menu scrolls via a JS `scrollIntoView` handler (which also closes the mobile `<details>`). Keep menu `href="#..."` in sync with section `id`s.
- **Clipboard**: `copyToClipboard` copies the sibling `.bp-pre` text using `navigator.clipboard` with a `document.execCommand('copy')` fallback for the Apps Script iframe.
- **Online edits**: the user sometimes edits in the Apps Script editor (not locally). If asked to "deploy manual changes" and local files are unchanged, deploy WITHOUT `clasp push` (push would overwrite the online edits).
- **Public web app**: `access: ANYONE_ANONYMOUS` — anyone with the URL sees it. Never put secrets in `Index.html`/`Código.js`.
- **Language**: UI copy is Spanish (`es`), but the prompt text inside `.bp-pre` is English (that's what the user copies). Keep new UI strings in Spanish; keep prompt content in English.
- **Dead CSS**: `.bp-ph` and `.bp-h1` rules remain but are unused (the `h1` was removed and `.bp-ph` divs were replaced by `<img>`); harmless, can be cleaned up.
