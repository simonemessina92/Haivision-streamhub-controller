# Haivision Streamhub Controller

[**Download 0.24.3 Golden**](https://github.com/simonemessina92/Haivision-streamhub-controller/raw/refs/heads/main/downloads/haivision-streamhub-controller-v0.24.3.zip)

A floating Chrome panel for StreamHub routing, monitoring and MoJo Pro camera control.

## What it does

- Assign one input to multiple physical, NDI or IP outputs. Choose **Only assign** or **LIVE** to also start the source input.
- Control input/output ON/OFF, recording and EJECT using existing StreamHub profiles.
- Show previews, LIVE status and StreamHub error messages.
- Manage existing encoder profiles, terminal intercom and video return.
- Control MoJo Pro cameras: white balance, ISO, shutter, focus, zoom and audio gain, according to the connected device's capabilities.
- Resize the panel between two and four columns and scroll with mouse or touchscreen.

Create and edit stream profiles in StreamHub. **EJECT** removes a dashboard assignment and keeps its saved profile.

## Install

1. Download and extract the ZIP.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the `streamhub-virtual-panel` folder.
4. Open StreamHub and sign in. Keep this tab open; it can stay in the background.
5. Click the extension icon on a normal webpage and allow the requested site access.
6. Enter the StreamHub API address and API key. HTTP uses port **8893** by default; include the port when using another address.

The panel can run on a different tab from StreamHub. Native previews and terminal controls require a signed-in tab for the same server. Hiding the panel pauses its polling and native connection.

To update, replace the extension files, click **Reload** in `chrome://extensions`, then refresh pages where the panel was open.

## Development

`main` contains the Golden build. `develop` is used for testing future changes.

```sh
node tools/check.cjs
python3 tools/build.py
```
