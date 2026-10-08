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

## Native diagnostic messages (0.24.1-dev2)

- Compare an already-failing SRT output with the native GUI: both must display “Bad destination or credentials”, with output power still ON.
- Compare an input/encoder error and an output warning with the native GUI. Terminal errors with bitrate/resolution parameters must include those exact parameters.
- Resolve the error in StreamHub or switch the output OFF. Its overlay and colored state must clear on readback.
- Click a long diagnostic to read the full text. This must not select an output or perform routing.
- Disconnect the API/source tab and reconnect; old terminal errors must not transfer to a replacement unit.

## Assignment and LIVE (0.24.2-dev3)

- Select an OFF source and multiple outputs. Cancel ASSIGN: no requests.
- Choose Assign only: output routing must work without starting the input.
- Choose Assign and start input: all routes must confirm before the source ON command. If any route fails, the input must not be started.
- Starting an already ON input must not send a duplicate start command.
- LIVE appears only for reported runtime status 2; output status 1 stays ON, OFF stays OFF, errors/warnings retain their native text.
- A source replaced between assignment and start must not receive the original start command.

## Output preview parity (0.24.3-dev4)

- With a connected but OFF MoJo input, assign NDI and SRT outputs using Only assign. NDI should show the native ready pattern, and SRT should show no input thumbnail.
- Start the source and compare dedicated NDI/physical previews with the native dashboard.
- Stop the source: the ready pattern must replace the output live frame even while input previews remain available.
- Assign a software encoder to an IP output: its thumbnail must come from that encoder.
- If the native pattern endpoint fails, show Output ready rather than an unrelated input image.
- Hide the controller: no additional pattern requests should continue.
