# Device acceptance checks

Use a test StreamHub with existing profiles. This release adds no profile creation or deletion.

1. Sign in to StreamHub on tab A. Open a normal webpage on tab B and show the overlay there.
2. Confirm native previews update on B while A stays in the background, including an input that is OFF.
3. Use a REST IP/hostname alias different from A's address. Confirm the same server is recognized.
4. With two different StreamHub servers signed in, confirm the controller uses the configured server only.
5. Test intercom ON/OFF, terminal recording and a known working video-return assignment.
6. Check routing and MoJo changes against the native GUI/device.
7. Hide the overlay. Confirm its additional Socket.IO connection closes; the native GUI's own connection remains.
8. Reopen and confirm the Inputs view and native updates resume.
9. Close A, reload it, or sign out. Native controls must become unavailable and must not silently switch to another server. Sign back in and check reconnection.
10. Check card and RCP controls at minimum and maximum overlay width, using mouse and touchscreen.

Automated messaging/socket tests do not establish remote-device reception. Record actual device results separately before promoting to `main`.
