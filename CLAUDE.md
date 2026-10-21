# CLAUDE.md

Guidance for Claude when working in this repository.

## Project

Haivision StreamHub Controller: a Chrome extension (Manifest V3, plain JavaScript, no bundler and no npm dependencies) that shows a floating panel for StreamHub routing, monitoring and MoJo Pro camera control.

- `extension/` – the extension source (loaded unpacked as `streamhub-virtual-panel`).
- `tests/` – Node regression tests (`*.cjs`) run by `tools/check.cjs` against simulated server responses.
- `tools/` – `check.cjs` (syntax, manifest and regression checks), `build.py` (builds the ZIP), `ui-smoke.cjs` and `standalone-smoke.cjs` (optional Playwright browser checks).
- `downloads/` – published ZIPs, one per DEV and Golden release. They are committed; never delete old ones.
- `docs/TESTING.md` – automated checks and the manual StreamHub test sequence.

## Branches and workflow

- `main` = stable **Golden** build. `develop` = development.
- Do all work on `develop` (or a branch merged into `develop`). Never commit code directly to `main`.
- Simone tests the DEV build. Only when Simone says **"golden"** is the release promoted to `main`.
- Never merge `develop` into `main` (or the reverse) without that explicit OK.

## Versioning

Every DEV change bumps the version as `X.Y.Z-devN` and builds a new ZIP. Keep all these places in sync:

- `VERSION` – e.g. `0.25.7-dev8`
- `extension/manifest.json` – `version` = `X.Y.Z` (no suffix, `build.py` asserts this), `version_name` = `X.Y.Z-devN`
- `extension/panel.js` – `const version='X.Y.Z-devN'`
- `extension/app.html` – footer `<span class="version">X.Y.Z DEVN</span>`
- `extension/README.txt` – first line `Haivision StreamHub Controller X.Y.Z DEVN`
- `docs/TESTING.md` – update the DEV references when relevant

Commit messages describe the change and end with the version, e.g. `Keep bulk controls stable during updates (0.25.7-dev8)`.

A Golden release ("Publish X.Y.Z Golden") removes the `-devN` suffix (`version_name` dropped), builds `downloads/haivision-streamhub-controller-vX.Y.Z.zip` and updates the download link at the top of `README.md`.

## Build and test

```sh
node tools/check.cjs      # must print PASS lines and exit 0
python3 tools/build.py    # writes downloads/haivision-streamhub-controller-v<VERSION>.zip
```

Optional browser checks (need Playwright, ws, engine.io and Chromium; see `.github/workflows/check.yml` for the exact environment variables):

```sh
node tools/ui-smoke.cjs
node tools/standalone-smoke.cjs
```

`build.py` rewrites the ZIP for the current `VERSION`; run it only when you mean to publish that ZIP, otherwise restore it with `git checkout -- downloads`.

CI (`.github/workflows/check.yml`) runs on pushes and PRs to `main` and `develop`. It only runs checks and uploads the ZIP as an artifact, it does not publish releases. For documentation-only commits add `[skip ci]`.

These checks do not prove compatibility with a real StreamHub; Simone tests on real hardware following `docs/TESTING.md`.

## Rules

- Code, UI text, comments, commit messages and docs are in English. Talk to Simone in Italian.
- Never log or display API keys, passwords or session tokens. The web password must never be saved.
- Keep normal certificate validation in production code; TLS exceptions belong only to test fixtures.
- No stream-profile creation, editing or deletion.
- Keep the code style of the surrounding files (compact plain JS, no frameworks).
