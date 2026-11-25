# Restro mascot media

These assets use the exact character from the user-supplied MP4. No replacement
character, generated limbs, CSS dance, or background blending is used.

- `shawarma-cycle.webm`: the only full animation loaded by the page; 14.25s,
  512 x 512, 24 fps, VP9 + alpha, silent, about 2.3 MiB.
- `shawarma-run.webm`: extracted and retimed original running movement (3s).
- `shawarma-peek.webm`: original right-edge lean, blink, and gripping hands (1.5s).
- `shawarma-dance-wave.webm`: original dance, wave, and turn (6s).
- `shawarma-poster.png`: transparent first dance pose for reduced motion/fallback.
- `alpha-probe.webm`: 819-byte decode test; unsupported alpha falls back to PNG.
- `timeline.json`: authored media phase boundaries consumed by the application.

Rebuild with `python scripts/prepare-mascot.py "path/to/source.mp4"`. Python
OpenCV, NumPy, Pillow, and imageio-ffmpeg are local media-authoring prerequisites,
not application dependencies. The supplied MP4 is 1920 x 1080 at 24fps, 287 frames.
The source remains outside the repository; the script needs its path to rebuild.

Background removal uses saturation/dark foreground seeds, a connected silhouette,
protected interior holes (eyes/teeth), and a foreground/background trimap solve.
Boundary RGB is decontaminated against the source background. All source borders
are connected for background flood-fill, preserving transparent gaps beside the
peeking hands. Frames are resized in premultiplied alpha and encoded using
libvpx-vp9 `yuva420p`. The source shadow and backdrop are excluded.

Timeline: run fully past the right viewport edge 0-3s; original peek 3-4.5s;
re-enter toward the measured hero anchor 4.5-5.25s; dance 5.25-8.75s;
wave 8.75-10.75s; turn 10.75-11.25s; run back left 11.25-14.25s, then repeat.
The original peek is extracted from source 3.0-4.3s, retaining its tilted pose,
face, and gripping hands. Its source right-edge cut is fixed at x=256 in the
512px canvas and aligned to the actual viewport right edge at runtime. It is
not centered on the partially visible torso. The actor starts peeking fully
outside the right edge and slides into this alignment over 0.3s without a
position jump. Re-entry uses intact mirrored running footage because the
source's 4.45-4.7s hop cuts the lettuce off the original frame.

The video itself is the single clock. On smaller layouts running/re-entry
playback adapts to actual travel distance. The two main runs use a 0.5x multiplier
relative to their previous responsive speed; re-entry is unchanged. Peeking, dance, wave, and turn retain
their authored playback speed. The character is wholly offscreen at both sides
of the 14.25s/0s loop boundary. No visible position reset is used.

Limitations: original footage is retained at clip joins, which can show small
pose cuts, including peek-to-running re-entry. Animator-authored transition
frames are still needed for perfectly seamless pose changes. No ghosting
crossfade was substituted. Alpha playback was tested in the Codex Chromium
browser; other browser/OS codec combinations are not verified. Browsers that
fail the decoded-alpha probe show the transparent poster instead of a rectangle.
