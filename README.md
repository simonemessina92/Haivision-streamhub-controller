# Haivision StreamHub Controller

[**Download 0.25.5 DEV6**](https://github.com/simonemessina92/Haivision-streamhub-controller/raw/refs/heads/develop/downloads/haivision-streamhub-controller-v0.25.5-dev6.zip) · [Stable Golden](https://github.com/simonemessina92/Haivision-streamhub-controller/tree/main)

A floating Chrome panel for StreamHub routing, monitoring and MoJo Pro camera control.

## Controls

- Route an input directly to physical, NDI or IP outputs, or through an existing encoder to physical/IP outputs.
- **Only assign** keeps ON/OFF states. **LIVE** starts the required input, encoder and outputs after routing is confirmed.
- Control ON/OFF, hub and terminal recording, intercom and video return.
- Use the **BULK ON / OFF / UNASSIGN / EJECT** buttons in Inputs, Outputs and Encoders. Select individual channels or **Select all**, then confirm. **UNASSIGN** clears sources and retains profiles, dashboard positions and ON/OFF states. **EJECT** removes a dashboard assignment or disconnects a terminal.
- Open **⋯** on a channel for configuration, reported statistics and alerts. Compatible transmitters also offer existing live profiles and remote access.
- Configure **Multiview** from 1×1 to 4×4, select sources, toggle information overlays and route it to outputs. IP output requires an encoding profile, not passthrough.
- Read server information, current system measurements and reported licenses in **System**.
- Control MoJo Pro white balance, ISO, shutter, focus, zoom and audio gain according to camera capabilities.

Previews and LIVE/error indicators follow StreamHub. Availability depends on the server version, licenses and connected device. Create and edit stream profiles in StreamHub.

## Install or update

1. Download and extract the ZIP.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select `streamhub-virtual-panel`. For an update, replace the files in the existing folder and click **Reload**.
4. Refresh pages where the previous panel was open.
5. Click the extension icon on a normal webpage and allow site access.
6. Enter the StreamHub address and API key. The extension checks HTTPS **8896** and HTTP **8893** and selects a responding API, preferring usable HTTPS.
7. Enter the web username and password for previews and device controls. Web access is detected independently on HTTPS **443** and HTTP **8888**. The probes send no credentials.

An explicit API URL fixes that endpoint. Use **Advanced web address** only for a custom web host or port. The API address appears in the footer; the Web button shows its endpoint on hover.

API access and web login are independent. A failed web login leaves the API panel connected; use **Web login** in the header to retry. Existing installations can add or update web access without removing the API connection.

With a web login, previews and native controls connect from the extension worker, with automatic HTTP polling fallback if the native WebSocket cannot open: **no StreamHub page needs to remain open**. The password is not saved. A server-scoped session token is stored locally and reused; an expired or rejected session requires a new web login. Both HTTP and HTTPS are supported independently for API and web access. HTTPS needs a certificate trusted by Chrome and valid for the selected hostname. Connection failures show the endpoint and Chrome network error when available, without API keys or session tokens.

You can leave the web login blank to retain the authenticated-tab connection. Hiding the panel stops its polling and native socket.

## Development

`main` contains the Golden build. `develop` contains the test build. This DEV has automated tests with simulated responses and Chromium layout checks; device operation needs testing on StreamHub.

```sh
node tools/check.cjs
python3 tools/build.py
```

Optional browser checks, with Playwright, ws and Chromium installed:

```sh
node tools/ui-smoke.cjs
node tools/standalone-smoke.cjs
```

See [testing](docs/TESTING.md) for the device checks.
