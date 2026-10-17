Haivision StreamHub Controller 0.25.1 DEV2

Chrome: enable Developer mode in chrome://extensions, choose Load unpacked and select this folder.
For an update, replace the files in the existing extension folder, reload the extension and refresh the open pages.

Open the panel on a normal webpage. Enter the API address (HTTP 8893 / HTTPS 8896), API key, web username and password. The web address defaults to HTTP 8888 / HTTPS 443 on the same host. Existing installations can use Web login in the header. With a web login, no StreamHub page needs to remain open. Only the session token is saved, not the password. Sign in again when the session expires. HTTPS certificates must be trusted by Chrome.

Inputs, outputs, encoders, MoJo Pro, Multiview and System are available according to server capabilities. Use the channel dots for details and BULK ON / OFF / UNASSIGN / EJECT for multiple operations. Only assign keeps power states; LIVE starts the required routing chain. UNASSIGN retains profiles and dashboard positions; EJECT is a separate operation.

This is a development build. Automated checks use simulated responses. Test operation on StreamHub before production use.
