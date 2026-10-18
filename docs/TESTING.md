# Testing

## Automated checks

Run `node tools/check.cjs` and `python3 tools/build.py`.

The tests exercise actual REST/native code with simulated server responses: cross-tab server matching, bridge cleanup, error messages, dedicated output previews, direct and encoded routing, source identity checks, Multiview changes, preserved ON/OFF states, UNASSIGN, live-profile confirmation, recording confirmation and camera pending-state handling.

`node tools/ui-smoke.cjs` requires Playwright and a compatible Chromium installation. `STREAMHUB_CHROMIUM_PATH` can point to an installed browser. `STREAMHUB_UI_OUTPUT` selects a screenshot folder. The UI fixture checks 2/3/4-column layouts, state/details-key overlap, details, encoders, outputs, Multiview, System and the bulk dialog. All 12 bulk buttons are pressed while repeated state renders occur between pointer-down and pointer-up; the pressed DOM node must survive and open the requested operation. The integration harness also exercises individual ON/OFF and all input/output/encoder bulk operations, including preservation of saved profiles and routes where required. The network monitor is checked before and after host permission grants and revocations.

`node tools/standalone-smoke.cjs` starts a local fake StreamHub and exercises the real HTTP login, worker WebSocket through the runtime-port facade, identity verification, preview delivery, intercom, socket cleanup/reopen, bulk output UNASSIGN and encoder EJECT. It requires Playwright and ws. Set `STREAMHUB_POLLING=1` with engine.io installed to reject WebSocket connections and exercise the real Engine.IO HTTP fallback. `STREAMHUB_EXTENSION=1` optionally loads the extension in a full Chromium browser; its temporary test manifest grants only localhost access. This mode requires support for extensions and local process sockets. The same browser-path environment variable is supported.

`STREAMHUB_LOGIN_FAILURE=1` exercises a rejected initial web login, verifies the API workspace stays connected, then signs in from the header and repeats the native-control checks. API and web discovery are checked independently, including mixed HTTP/HTTPS services and probes without credentials. The API fixture returns an HTML root page without a key; authenticated API requests return JSON. This covers discovery against a responding API which does not expose unauthenticated JSON metadata.

TLS integration: set `STREAMHUB_TLS_CERT` and `STREAMHUB_TLS_KEY` to a localhost certificate/key pair and trust that certificate in the Node fixture worker with `NODE_EXTRA_CA_CERTS`. The browser certificate exception is confined to the temporary local test context; production code retains normal certificate validation. Both HTTP/WS and HTTPS/WSS paths, rejected initial login, protocol-selector changes, preview images and HTTPS polling fallback were exercised for DEV5. Chrome runtime ports and webRequest events are simulated in the default harness; this does not validate Chrome policies on a user machine.

These checks do not establish compatibility with a real StreamHub or terminal.

## StreamHub test sequence

Keep the Golden available and test this DEV on `develop` before promotion.

1. Update the extension in its existing folder, reload it and refresh the panel host page. Use **Web login** in the header to enter the StreamHub web username/password. Check the web origin, then close the StreamHub GUI tab. Verify that previews, state, encoders, System and controls continue to update. Hide/reopen the panel; check reconnection without another password. Test an incorrect password and an expired session. The password must not be saved.
2. Check existing previews, ON/OFF, intercom, video return, recording and MoJo controls first.
3. Route an input to an OFF output using **Only assign**. Verify that the route changes while input/output ON/OFF states remain unchanged. Repeat through an encoder to SDI/IP.
4. Use **LIVE**. Compare input, encoder and output assignments and states with the native GUI. Force an assignment failure and confirm the remaining chain is not started.
5. Use output **UNASSIGN** for direct and encoded routes. Verify that both route fields are cleared while profile, dashboard position and ON/OFF states remain unchanged. EJECT is a different operation.
6. Test bulk operations on a small selection. For IP inputs, UNASSIGN detaches the IP profile; EJECT disconnects field units or detaches IP profiles; encoder EJECT removes its dashboard assignment and clears routes which reference it. Saved profiles remain. Compare the result with StreamHub. On partial failure, remaining items must stay selected.
7. Open channel **⋯**. Compare CONFIG, STATS and ALERTS with StreamHub. Unavailable fields should say not reported. Change an existing transmitter live profile and verify device confirmation. Test remote access where supported.
8. Configure a small Multiview, change cells and grid size, toggle overlays and route to SDI/NDI. Test IP with an assigned non-passthrough encoder. Compare both Only assign and LIVE with the native GUI.
9. Compare System metrics and licenses with StreamHub. Old/disconnected measurements must not appear current.
10. Close a terminal connection or replace a source while its dialog is open. Commands must not operate on a replacement device. Hide the panel and confirm native subscriptions stop.

## Scope

The panel supports either a direct web login or the previous authenticated-tab bridge. It retains a single saved StreamHub. Multiple saved servers are outside this DEV. No stream-profile creation, editing or deletion is enabled.
