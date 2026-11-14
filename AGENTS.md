# AGENTS.md

## 1. Role

`spa-assistant` is a DeepSeek Harness plugin for a chat assistant built on a parent-agent + worker sub-agent architecture: the front desk talks and never does the heavy work, and the work goes to background sub-agents. Its Assistant row in the left sidebar opens straight into a conversation; the agent the user talks to there is a router that reads, answers, records simple information itself, and delegates everything else. The user can cut in, change the subject, or ask for progress at any moment, without waiting for a long job to finish. This repository is the second-development fork of `@starsharryzhu/dsh-assistant` 0.3.0 (MIT), renamed to `spa-assistant` and versioned 0.1.0. Only DeepSeek Harness Desktop `>=0.2.1-rc.5 <0.3.0` is supported.

Two hidden presets carry the architecture. The router preset is the conversation the user sees: it has no general file writes, no shell, no web, and no official subagent tool; it writes only through the record tools, each bound to a fixed file in the user's workspace, and hands the rest to a worker with `delegate`. The worker preset is what every `delegate` child runs on: the standard working tools, including a shell whose foreground command moves to a background job after five seconds so the router's next message is taken at the next step. A worker reports a fixed shape back: a status of done, blocked, failed, or nothing to do; the result; and at most one question for the user.

Around that axis sit automatic compaction at a configurable share of the context window, a model and reasoning effort each conversation's composer chooses, an RMB balance reminder, a persona and a profile per assistant holding their own time zone, a `ddl.md` schedule with repeating items, a heartbeat for reminders and the daily brief and quiet hours in place of the host's automation tasks, a watchdog for stalled turns and workers, and WeChat through the im-robot sub-plugin.

The fork changes identity only: the npm package name, the version, the `PACKAGE_NAME` constant in `src/shared/settings.ts`, and the `name` fields registered by the four rows in `cordis.patch.yml`. The internal id `dsh-assisstant` (`PLUGIN_ID`, note the three `s` of the original spelling) stays as it is: it is the settings namespace, the preset ids, the panel id, and the data folder name, and renaming it would lose the settings and conversations of existing installs. It is not a typo to fix.

## 2. Constraints

- Change `src/`, then run `node build.js`; the output lands in `lib/`. Never edit `lib/` by hand.
- `node build.js` type-checks through `node_modules/typescript/bin/tsc`, emits the host half and the prompts, bundles the browser half, and self-checks it. It prints one line of the form `build: lib/index.js, lib/host, lib/shared, lib/client.js (18 modules, 196239 bytes); self-check passed`.
- `lib/` is committed, deliberately. `.gitignore` carries `!lib/` to let it through. A profile's `link:` or git install resolves `lib/` and does not rebuild it, and the package has no `prepare` script, so the built files must be in the repository.
- Rebuild after every `src/` change and commit the `lib/` changes with them; a commit that touches `src/` alone leaves the installed plugin stale.
- Do not change `cordis.patch.yml` or `lib/` on disk while a host runs this package through `link:`. At its next profile write a running host compares loaded modules with disk, replaces this plugin (a QR code then reads as expired), and writes its composed tree into the profile's root `cordis.yml`, whose rows win over bundle patches at the next boot. Test in a copy meanwhile.
- Node built-ins, `@deepseek-ai/cordis`, `@deepseek-ai/schemastery`, `@deepseek-ai/dsh-tools`, and lazily `@deepseek-ai/dsh-app-boot` are the runtime imports; the browser half uses only the page's shared modules and the vendored QR library.
- Never modify the harness checkout; everything is plugin code. The only host behavior changed is the preset registry's `list()`, wrapped on its prototype while the plugin is loaded so both hidden presets stay out of every preset list.
- Tool isolation runs both ways: this package registers no global tool, its sub-plugins serve only the two hidden presets, and each preset's policy denies every other global tool with a deny list, because an allow list also masks the preset's own tools. The record tools register in the hidden presets' scope, never as global tools.
- Host writes to the settings row go through `SettingsWriter`, which writes with `settings.mutate`, replacing each field. `settings.update` merges plain objects recursively, so a key dropped from one would stay forever.
- Text only the model reads is in English: its own files, tool results, worker reports, system notes. Text the user sees stays in their language: replies, the `/ddl` week view, tool-card titles, reminders, schedule titles, lists, memos, and logs.
- Every folder carries this four-section English file, and `tests/agents-md.test.ts` enforces it: the root and every folder under `src`, `tests`, `scripts`, and `locale` need the four headings in order, non-empty, with no CJK codepoints.
- The user's time zone is the profile's `Time zone`, never the browser's or the device's.
- `tests/patch.test.ts` pins the identity, the engine range, and the entries. Its assertions still name the upstream package and version, so they fail after the fork's rename; the fix belongs in that spec, not in the manifest.

## 3. Contents

- `src` — plugin source: the settings row, the sub-plugin group, the policy, the compactor, host modules, prompts, shared shapes, and the browser half (`src/client`, `src/shared`, `src/host` with `src/host/records`).
- `tests` — vitest specs with fake host services and the built browser half under jsdom.
- `scripts` — the development toolchain linker.
- `locale` — Plugins page title and description in Chinese and English.
- `lib` — generated build output, committed.
- `build.js` — type-check, emit the host half and prompts, bundle and self-check the browser half.
- `cordis.patch.yml` — the bundle patch: settings row, sub-plugin group, router preset, worker preset.
- `package.json` — identity, pinned sub-plugins, peers, engine range, entries, and the browser half.
- `tsconfig.json` — host type-check settings.
- `tsconfig.build.json` — host emit settings for `lib/`.
- `tsconfig.client.json` — browser half compile settings.
- `vitest.config.ts` — test runner settings, with `DSH_HOME` in a fresh temporary folder so no spec writes to the real one.
- `README.md` — user documentation, English by default; `README-zh.md` is the Chinese version.
- `THIRD_PARTY_NOTICES.md` — notices for vendored third-party code.
- `LICENSE` — MIT.
- `.gitignore` — ignores dependencies, browser compile output, machine-local configuration, and editing backups, keeps `lib/`.
- `.npmrc` — machine-local package mirror, ignored by git.
- `.github/workflows/publish.yml` — tag-driven npm publish through trusted publishing.

## 4. Progress

- Done (2026-11-14): the workspace became this plugin's repository. The plugin source moved from `spa-assistant/` to the repository root, the dispatch-desk content moved out, the ten unrelated commits were dropped, and the history restarted from one orphan commit. `node build.js` passes from the root and `lib/` holds 76 committed files.
- Done (2026-11-14): the second-development identity is in place: `package.json` name `spa-assistant` and version `0.1.0`, `PACKAGE_NAME` in `src/shared/settings.ts`, and the four `name` fields in `cordis.patch.yml`.
- Done (2026-11-14): all 304 specs pass across 21 files. The rename's broken assertions in `tests/patch.test.ts`, `tests/bundle.test.ts`, and `tests/client.test.tsx` now expect `spa-assistant` and `0.1.0`, and `tests/setup.ts` restores the `localStorage` global that vitest 4 does not expose under jsdom.
- Open: the other prompt rules are unit-tested only, not checked one by one with the real model.
- Known limits: under the default permission no worker can modify anything outside the user's workspace, on any supported host, because the router cannot grant what it cannot modify itself; on 0.2.1-rc.5 a grant reaches only `write` and `edit`, not the shell.
- Known limits: choosing a model in an assistant's composer also saves it as the host's default for new sessions; heartbeats stop while the app is closed or the computer sleeps; WeChat takes the assistant's first messages only for about a day after the user's last one there; only files inside the workspace can be sent to WeChat, and voice cannot.
- Goal later: more chat channels through im-robot; Windows and Linux.
