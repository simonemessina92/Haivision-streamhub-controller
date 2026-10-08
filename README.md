# Haivision Streamhub Controller

[Download development build](https://github.com/simonemessina92/Haivision-streamhub-controller/raw/refs/heads/develop/downloads/haivision-streamhub-controller-v0.24.0-dev1.zip) · [Download stable 0.22.2](https://github.com/simonemessina92/Haivision-streamhub-controller/raw/refs/heads/main/downloads/haivision-streamhub-controller-v0.22.2.zip)

A floating Chrome panel for StreamHub routing and MoJo Pro camera control.

## Development build: 0.24.0-dev1

Open the controller on a regular webpage while a signed-in StreamHub tab stays open in the same Chrome profile. The extension locates an authenticated tab and checks the server hardware identity before allowing native commands. Local IP, public IP and hostname aliases can point to the same server.

The StreamHub tab can remain in the background. Hiding the overlay or switching away from its tab stops the controller's native connection and polling. Closing the source tab disables native features until a matching signed-in tab becomes available. The original StreamHub page keeps its own connection.

The build also includes the neutral grey/cyan appearance update from 0.23.0. Camera controls, REST routing and existing profile assignments retain the 0.22.2 behavior.

## Install or update

1. Extract the ZIP to a permanent folder.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select the `streamhub-virtual-panel` folder containing `manifest.json`.
4. For an existing installation, replace files in its existing folder and click **Reload**. Refresh pages that hosted the old overlay.
5. Click the extension icon on a regular HTTP/HTTPS page. Allow site access when Chrome asks; cross-tab discovery needs access to the authenticated StreamHub tab as well as the overlay page.
6. Enter the StreamHub REST address and API key. Keep its native GUI signed in on another tab.

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
