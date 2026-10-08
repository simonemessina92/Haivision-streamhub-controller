Haivision Streamhub Controller 0.24.0-dev1

Chrome extension: floating resizable panel with Inputs, Outputs, Encoders and MoJo Pro tabs.
Install unpacked in chrome://extensions, then click the extension icon on a normal webpage.
Connect using the StreamHub REST address and API key (HTTP TCP 8893 / HTTPS TCP 8896).

Inputs: show slots read from StreamHub. Select an existing source profile, ON/OFF, record and EJECT.
Outputs: show the server dashboard outputs. Add selects an existing output profile, not a creator.
Routing: click an input, select outputs, press ASSIGN. Output ON/OFF and EJECT change server assignment state.
EJECT detaches the source/output; it does not delete its saved profile.
No profile creation, deletion or definition editing. /config/object, /config/newobject and /config/removeobject are blocked. Only named assignment fields may be updated through /config/item.

MoJo: preserves 0.20.12 camera controls, Focus capability detection, shutter conversion, stepped controls, recording and native OFF previews.
OFF previews use the authenticated StreamHub GUI session: open this panel on the signed-in GUI page and configure an address belonging to the same server. The native socket receives previews and status; constrained commands are sent only after an explicit user action. It closes when hidden. Other pages use REST previews when available.
Output thumbnails use native SDI/NDI output events when available; otherwise an enabled output can show its assigned input thumbnail labelled Source preview. OFF outputs clear the image.

All UI text is English. Checks performed against simulated API responses; user hardware feedback is noted separately below. Native OFF previews were reported working by the user on two StreamHub servers in 0.20.12.
0.23.0 appearance update:
- Neutral Haivision-inspired surfaces, cyan accents, consistent controls and quieter camera-console styling.
- Original 0.22.2 API, routing, previews, camera controls and grid/resize logic retained.
- No HLS player or new service ports.

0.22.2 functional baseline:
- Encoder ON/OFF and EJECT use the same icon buttons, sizing and labels as Inputs/Outputs.
- Intercom no longer holds the whole UI busy while waiting for a status event. As in the native GUI, unitCommand startIntercom/stopIntercom is dispatched directly. The notification reports command dispatch, not remote reception.
- STARTING and ERROR states permit STOP, matching the native dashboard. The channel state remains authoritative over independent terminal device status. No repeated commands or optimistic state updates are issued.
- Video-return assignment and disconnect logic are unchanged; the user confirmed terminal reception before this release.

Validation: JavaScript syntax and simulated native/DOM tests, including STOP during STARTING, no pending intercom confirmation timer, encoder icon labels, existing return routing, licensed encoder Add/EJECT, aliases, hidden shutdown, grids and camera controls. These are simulated checks, not hardware intercom verification.

IP input ON/OFF updates inputProtocol.<profile>.enable, as the native GUI does. OFF never unassigns the profile. Public and local stream addresses use native ip_public/ip_local events; hostname comes from native getConfig. No tokens or unrelated configuration are forwarded.

Preview aliases: the configured REST server hardwareIdentifier is compared with getDeviceInfo/abusProxyIsReady from the open GUI socket. A matching server may use different LAN/WAN IPs or hostnames. The GUI session token stays on the page origin; API credentials are not forwarded.

Restyling validation: real headless Chromium rendering with simulated server data at panel widths 518, 748 and 998 px. Inputs, Outputs, Encoders and MoJo RCP were compared against 0.22.2; card/control geometry and 16:9 previews match. No clipped card buttons or RCP controls, and no page errors in these fixtures. Functional scripts are byte-identical to 0.22.2; panel.js differs only in version and appearance values. No new hardware tests performed.

0.24.0-dev1: cross-tab native connection. Keep a matching signed-in StreamHub tab open; the overlay can run on another regular webpage in the same Chrome profile. Optional HTTP/HTTPS site access and tabs permission support discovery. Hardware identity is required before native command dispatch. Tokens remain in the StreamHub tab. Hiding/backgrounding the overlay closes its provider; a six-and-a-half-second lease closes abandoned providers. Cross-tab behavior is verified with simulated Chrome/socket tests, not yet hardware-tested.

0.24.1-dev2: Native preview errors/warnings with StreamHub English labels and terminal parameters. Unknown messages retain their original text. Click an alert for the complete message. Diagnostics are read-only; routing and device commands are unchanged. Validated with simulated API/socket data and Chromium layout checks; device acceptance is pending.

0.24.2-dev3: ASSIGN offers assignment only or assignment followed by source ON. Source starts only after all routes confirm; an already ON source is not restarted. Input/output LIVE indicators use runtime status 2. Existing output activation behavior is retained.

0.24.3-dev4: Physical/NDI previews use dedicated output frames and native ready patterns. IP previews use only a LIVE input or the assigned encoder. Pattern requests are read-only and use the authenticated StreamHub tab. Compact Only assign / red LIVE dialog. New behavior requires device acceptance.
