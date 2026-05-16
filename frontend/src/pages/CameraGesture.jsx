import { useEffect, useRef, useState } from 'react'

const GESTURE_EMOJI = { Rock: '🪨', Paper: '📄', Scissors: '✂️' }
const STABLE_FRAMES  = 18   // frames before a gesture is "confirmed"
const AUTO_PLAY_MS   = 2000 // ms to hold a confirmed gesture before auto-submitting

/**
 * Looks at the 21 hand landmark points MediaPipe gives us and decides
 * which gesture the hand is making.
 *
 * MediaPipe gives y=0 at the TOP of the image, so a fingertip that is
 * ABOVE (smaller y) its middle joint means the finger is extended.
 *
 * Landmark indices:
 *   8  = index tip,  6  = index PIP (middle joint)
 *   12 = middle tip, 10 = middle PIP
 *   16 = ring tip,   14 = ring PIP
 *   20 = pinky tip,  18 = pinky PIP
 */
function classifyGesture(lm) {
  const up = (tip, pip) => lm[tip].y < lm[pip].y - 0.03
  const index  = up(8,  6)
  const middle = up(12, 10)
  const ring   = up(16, 14)
  const pinky  = up(20, 18)

  if (index && middle && ring && pinky)     return 'Paper'
  if (index && middle && !ring && !pinky)   return 'Scissors'
  if (!index && !middle && !ring && !pinky) return 'Rock'
  return null
}

export default function CameraGesture({ onGesture, onClose }) {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const stableRef   = useRef({ gesture: null, count: 0 })
  const autoTimerRef = useRef(null)   // setTimeout handle for auto-submit

  const [detected,  setDetected]  = useState(null)  // what we see right now
  const [stable,    setStable]    = useState(null)  // confirmed stable gesture
  const [countdown, setCountdown] = useState(null)  // seconds left until auto-play

  useEffect(() => {
    let live = true

    // --- 1. Set up MediaPipe Hands ---
    // window.Hands, window.Camera etc. are injected by the <script> tags in
    // index.html — they're not ES module exports so we can't import them.
    //
    // locateFile tells MediaPipe where to download its WASM/binary files from.
    const hands = new window.Hands({
      locateFile: f =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
    })

    hands.setOptions({
      maxNumHands: 1,        // we only need one hand
      modelComplexity: 1,    // 0 = fast/less accurate, 1 = balanced
      minDetectionConfidence: 0.75,
      minTrackingConfidence:  0.5,
    })

    // --- 2. Called every frame after MediaPipe processes the image ---
    hands.onResults(results => {
      if (!live) return
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')

      // Draw the raw camera frame onto the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height)

      let gesture = null

      if (results.multiHandLandmarks?.length) {
        const lm = results.multiHandLandmarks[0]

        // Draw the skeleton lines connecting the 21 landmarks
        window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
          color: '#7B4FBF',
          lineWidth: 3,
        })

        // Draw a dot at each of the 21 landmarks
        window.drawLandmarks(ctx, lm, {
          color: '#ffffff',
          fillColor: '#9B6FDF',
          lineWidth: 1,
          radius: 5,
        })

        gesture = classifyGesture(lm)
      }

      // --- 3. Stability check ---
      // We only accept a gesture once it has been the same for STABLE_FRAMES frames
      // (~0.6 s at 30 fps). This prevents flickering.
      const s = stableRef.current
      if (gesture && gesture === s.gesture) {
        s.count++
        if (s.count === STABLE_FRAMES) {
          // Just became stable — set it and start the 2-second auto-play timer
          setStable(gesture)
          setCountdown(2)

          let remaining = 2
          const tick = setInterval(() => {
            remaining -= 1
            setCountdown(remaining)
            if (remaining <= 0) {
              clearInterval(tick)
              // Auto-submit — capture the gesture name from the ref so the
              // closure doesn't stale-close over an old value
              onGesture(s.gesture)
              onClose()
            }
          }, 1000)
          autoTimerRef.current = tick
        }
      } else {
        // Gesture changed — cancel any running auto-play timer
        if (autoTimerRef.current) {
          clearInterval(autoTimerRef.current)
          autoTimerRef.current = null
        }
        s.gesture = gesture
        s.count   = 0
        setStable(null)
        setCountdown(null)
      }

      setDetected(gesture)
    })

    // --- 4. Set up the camera ---
    // Camera utility grabs frames from the <video> element and feeds them
    // to hands.send() on every frame (like a requestAnimationFrame loop).
    const cam = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (live && videoRef.current) await hands.send({ image: videoRef.current })
      },
      width: 640,
      height: 480,
    })
    cam.start()

    // --- 5. Cleanup when the component is closed ---
    return () => {
      live = false
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
      cam.stop()
      hands.close()
    }
  }, [onGesture, onClose])

  return (
    <div className="cam-overlay">
      <div className="cam-modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Show Your Gesture</div>

        <div className="cam-video-wrap">
          {/*
            Video must NOT be display:none — the browser won't play a hidden video.
            We place it off-screen via CSS (.cam-video-hidden) so it runs
            but is invisible; the canvas draws its frames instead.
          */}
          <video ref={videoRef} className="cam-video-hidden" playsInline />

          {/*
            CSS scaleX(-1) mirrors the canvas so it looks like a selfie camera
            (left/right flipped) instead of a through-the-window view.
          */}
          <canvas ref={canvasRef} width={640} height={480} className="cam-canvas" />

          {/* Big countdown number shown over the video once gesture is locked in */}
          {countdown !== null && (
            <div className="cam-countdown">{countdown}</div>
          )}
        </div>

        {/* Status badge */}
        <div className="cam-badge">
          {stable
            ? <span className="cam-stable">{GESTURE_EMOJI[stable]} {stable} — hold still! Playing in {countdown}s…</span>
            : detected
            ? <span className="cam-detecting">{GESTURE_EMOJI[detected]} Detecting {detected}...</span>
            : <span className="cam-waiting">Show ✊ Rock &nbsp; ✋ Paper &nbsp; ✌️ Scissors</span>
          }
        </div>

        <div className="cam-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
