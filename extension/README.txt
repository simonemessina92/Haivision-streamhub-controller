Haivision StreamHub Controller 0.25.4 DEV5

Chrome: enable Developer mode in chrome://extensions, choose Load unpacked and select this folder.
For an update, replace the files in the existing extension folder, reload the extension and refresh the open pages.

Open the panel on a normal webpage. Enter the API address (HTTP 8893 / HTTPS 8896), API key, web username and password. API and web protocols are separate. Automatic web protocol follows the API, matching the Stream Deck native connection: HTTP 8888 / HTTPS 443 on the same host. A web login failure leaves the API panel connected; retry from Web login. Advanced web address is optional. Native connections run in the extension worker and fall back to HTTP polling when WebSocket cannot open. Existing installations can use Web login in the header. With a web login, no StreamHub page needs to remain open. Only the session token is saved, not the password. Sign in again when the session expires. HTTP and HTTPS are supported for both API and web access. Changing the API selector updates explicit URLs and standard ports. HTTPS certificates must be trusted by Chrome and match the server hostname. Network failures show the endpoint and Chrome error code when available; credentials are excluded.

Inputs, outputs, encoders, MoJo Pro, Multiview and System are available according to server capabilities. Use the channel dots for details and BULK ON / OFF / UNASSIGN / EJECT for multiple operations. Only assign keeps power states; LIVE starts the required routing chain. UNASSIGN retains profiles and dashboard positions; EJECT is a separate operation.

This is a development build. Automated checks use simulated responses. Test operation on StreamHub before production use.
