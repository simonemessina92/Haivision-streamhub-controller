# Haivision Streamhub Controller

[Download stable 0.22.2](https://github.com/simonemessina92/Haivision-streamhub-controller/raw/refs/heads/main/downloads/haivision-streamhub-controller-v0.22.2.zip) · [Development branch](https://github.com/simonemessina92/Haivision-streamhub-controller/tree/develop)

A floating Chrome panel for StreamHub routing and MoJo Pro camera control.

## Stable build: 0.22.2

The stable controller uses the authenticated StreamHub page beneath the overlay for native previews and commands. Open it on the signed-in StreamHub GUI for complete functionality. Cross-tab operation and the appearance update are available on `develop` for testing.

## Install or update

1. Extract the ZIP to a permanent folder.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select the `streamhub-virtual-panel` folder containing `manifest.json`.
4. For an existing installation, replace files in its existing folder and click **Reload**. Refresh pages that hosted the old overlay.
5. Click the extension icon on the signed-in StreamHub GUI page. Allow access to the configured StreamHub address when Chrome asks.
6. Enter the StreamHub REST address and API key. Open the overlay on its signed-in native GUI page.

Chrome internal pages, the Web Store and other protected browser pages cannot host injected overlays.

## Features

- Inputs and existing source assignment; ON/OFF, recording and EJECT.
- Outputs grouped as physical, NDI and IP; existing output assignment and source selection.
- One input assigned to multiple outputs using **ASSIGN**.
- Native thumbnails, including connected inputs that are OFF.
- Licensed encoder slots and existing encoder profiles.
- Terminal intercom and compatible video-return assignment.
- MoJo Pro camera selection, white balance, ISO, shutter, focus when available, vertical zoom and audio gain.
- 2/3/4-column grids, vertical touch scrolling and a compact RCP.

Profile creation, saved-profile deletion and definition editing are disabled. EJECT detaches a dashboard assignment while preserving the saved profile.

## Connections

REST uses the configured API key and address. Native previews, terminal status and native controls use a signed-in StreamHub browser session. Session tokens remain in the source tab; they are not returned by tab discovery or relayed to the panel.

If no matching authenticated tab is available, REST controls remain available. Native commands are rejected instead of being sent to an unverified server. Browser logout, tab discard or reload can temporarily interrupt native features.

## Branches and validation

| Branch | Purpose |
| --- | --- |
| `main` | Stable 0.22.2, reported working on StreamHub hardware |
| `develop` | Appearance and cross-tab changes under test |

Cross-tab checks use simulated Chrome messaging and Socket.IO responses. They cover background tabs, server matching, token isolation, command forwarding, missing sessions and shutdown. Appearance was rendered in Chromium with simulated inputs at 2/3/4 columns. Cross-tab operation has not yet been verified on StreamHub hardware.

Promote `develop` through a pull request after device testing. Keep the stable build available until the development build is accepted.

## Build and test

```sh
node tools/check.cjs
python3 tools/build.py
```

The ZIP contains only the extension folder. Tests, documentation and development tools are excluded.
