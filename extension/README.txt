Haivision Streamhub Controller 0.22.2

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
0.22.2 changes:
- Encoder ON/OFF and EJECT use the same icon buttons, sizing and labels as Inputs/Outputs.
- Intercom no longer holds the whole UI busy while waiting for a status event. As in the native GUI, unitCommand startIntercom/stopIntercom is dispatched directly. The notification reports command dispatch, not remote reception.
- STARTING and ERROR states permit STOP, matching the native dashboard. The channel state remains authoritative over independent terminal device status. No repeated commands or optimistic state updates are issued.
- Video-return assignment and disconnect logic are unchanged; the user confirmed terminal reception before this release.

Validation: JavaScript syntax and simulated native/DOM tests, including STOP during STARTING, no pending intercom confirmation timer, encoder icon labels, existing return routing, licensed encoder Add/EJECT, aliases, hidden shutdown, grids and camera controls. These are simulated checks, not hardware intercom verification.

IP input ON/OFF updates inputProtocol.<profile>.enable, as the native GUI does. OFF never unassigns the profile. Public and local stream addresses use native ip_public/ip_local events; hostname comes from native getConfig. No tokens or unrelated configuration are forwarded.

Preview aliases: the configured REST server hardwareIdentifier is compared with getDeviceInfo/abusProxyIsReady from the open GUI socket. A matching server may use different LAN/WAN IPs or hostnames. The GUI session token stays on the page origin; API credentials are not forwarded.
