Haivision StreamHub Controller 0.25.5 DEV6

Chrome: enable Developer mode in chrome://extensions, choose Load unpacked and select this folder.
For an update, replace the files in the existing extension folder, reload the extension and refresh the open pages.

Open the panel on a normal webpage. Enter the StreamHub address and API key, plus the web username/password for previews. The extension detects the API on HTTPS 8896 / HTTP 8893 and detects web access independently on HTTPS 443 / HTTP 8888, preferring usable HTTPS. Discovery sends no credentials. An explicit API URL fixes the API endpoint; Advanced web address supports custom web hosts or ports. A failed web login leaves the API connected. Native connections run in the extension worker, with HTTP polling fallback if WebSocket cannot open. Only the session token is saved; the password is not saved. HTTPS certificates must be trusted by Chrome and match the hostname.

Inputs, outputs, encoders, MoJo Pro, Multiview and System are available according to server capabilities. Use the channel dots for details and BULK ON / OFF / UNASSIGN / EJECT for multiple operations. Only assign keeps power states; LIVE starts the required routing chain. UNASSIGN retains profiles and dashboard positions; EJECT is a separate operation.

This is a development build. Automated checks use simulated responses. Test operation on StreamHub before production use.
