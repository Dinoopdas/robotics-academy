import type { CourseSource } from "../schema";

export const sensorsMathKinematicsCourses: CourseSource[] = [
  {
    slug: "sensors-deep-dive",
    track: "sensors-actuators",
    title: "Sensors Deep Dive",
    subtitle: "Every major sensing modality, examined the same way",
    description:
      "Each sensor gets the same nine questions — what it is, how it works, what it measures, how robots use it, its advantages, its limits, where it appears, and a worked programming example. Answering them uniformly is what makes honest comparison possible.",
    difficulty: "INTERMEDIATE",
    tags: ["sensors", "perception", "hardware"],
    prerequisites: ["electronics-foundations"],
    skills: ["sensing"],
    modules: [
      {
        slug: "ranging",
        title: "Measuring distance",
        description: "Ultrasonic, infrared and LiDAR — three ways to answer 'how far?'",
        lessons: [
          {
            slug: "ultrasonic",
            title: "Ultrasonic sensors",
            summary:
              "Sound-based ranging: cheap, forgiving of dark surfaces, and blind to exactly the obstacles that matter most.",
            estimatedMinutes: 12,
            keyTerms: ["microcontroller"],
            objectives: [
              "Explain time-of-flight ranging and compute distance from echo time",
              "Predict the three surfaces an ultrasonic sensor reliably fails on",
              "Write correct triggering and timeout code",
            ],
            blocks: [
              {
                type: "prose",
                text: "An ultrasonic sensor emits a burst of sound above human hearing — typically 40 kHz — and times how long the echo takes to return. Distance follows from the speed of sound.",
              },
              {
                type: "math",
                title: "Time of flight",
                latex: "d = \\frac{v_{\\text{sound}} \\times t_{\\text{echo}}}{2}",
                where: [
                  { symbol: "d", meaning: "distance to the surface", unit: "m" },
                  { symbol: "v_{\\text{sound}}", meaning: "speed of sound, ≈343 at 20 °C", unit: "m/s" },
                  { symbol: "t_{\\text{echo}}", meaning: "round-trip time", unit: "s" },
                ],
                note: "The division by two is the whole trick: the sound travels out and back, so it covers twice the distance you want.",
              },
              {
                type: "callout",
                tone: "warning",
                title: "The speed of sound is not a constant",
                text: "It rises about 0.6 m/s per °C. Code calibrated at 20 °C and run at 40 °C reads roughly 3.5% short — 3.5 cm error at one metre. Outdoor and industrial robots compensate with a temperature sensor; indoor hobby robots usually accept the error.",
              },
              {
                type: "heading",
                level: 2,
                text: "The three failures you must design around",
              },
              {
                type: "table",
                title: "When ultrasonic sensing fails",
                columns: ["Situation", "What happens", "Why"],
                rows: [
                  ["Angled surface (>~30°)", "No reading at all — reports maximum range", "Sound reflects away like light off a mirror"],
                  ["Soft material (curtain, foam)", "Weak or missing echo", "The material absorbs rather than reflects"],
                  ["Thin objects (chair leg, cable)", "Object invisible", "Beam is ~30° wide; the return is dominated by larger surfaces"],
                  ["Two sensors firing together", "Wildly wrong readings", "Each hears the other's burst — crosstalk"],
                ],
              },
              {
                type: "callout",
                tone: "mistake",
                title: "The failure mode that causes crashes",
                text: "A missed echo does not report an error. It reports **maximum range** — which reads exactly like *clear ahead*. A robot approaching a wall at 40° sees open space and drives straight into it. Never treat a maximum reading as confirmation that the path is clear; treat it as *no information*.",
              },
              {
                type: "code",
                language: "python",
                filename: "ultrasonic.py",
                title: "Reading an HC-SR04 correctly",
                code: `import RPi.GPIO as GPIO
import time

TRIG, ECHO = 23, 24
SPEED_OF_SOUND = 343.0
TIMEOUT_S = 0.04          # ~6.8 m round trip — beyond the sensor's range

GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)


def measure_distance_m() -> float | None:
    """Return distance in metres, or None if no echo came back."""
    GPIO.output(TRIG, True)
    time.sleep(0.00001)        # 10 microsecond trigger pulse
    GPIO.output(TRIG, False)

    deadline = time.time() + TIMEOUT_S
    while GPIO.input(ECHO) == 0:
        if time.time() > deadline:
            return None
    pulse_start = time.time()

    while GPIO.input(ECHO) == 1:
        if time.time() > deadline:
            return None
    pulse_end = time.time()

    return (pulse_end - pulse_start) * SPEED_OF_SOUND / 2.0


reading = measure_distance_m()
if reading is None:
    print("No echo — surface may be angled, soft, or out of range")
else:
    print(f"Distance: {reading:.3f} m")`,
                annotations: [
                  { line: 16, text: "The datasheet specifies a 10 µs trigger. Shorter and the burst may not fire." },
                  { line: 19, text: "A deadline, not a retry count — this is what stops the loop hanging forever if no echo returns." },
                  { line: 33, text: "Returning None rather than a large number forces the caller to handle 'no information' explicitly." },
                ],
                output: "Distance: 0.412 m",
              },
              {
                type: "interactive",
                widget: "sensor-sim",
                title: "Ultrasonic beam simulator",
                instructions:
                  "Rotate the wall and watch the echo disappear past about 30°. Add a thin post inside the beam and see it vanish behind the wall return.",
                config: { sensor: "ultrasonic" },
              },
              {
                type: "check",
                question:
                  "Your robot reports 4.0 m — the sensor maximum — while facing a wall 0.5 m away. What is happening?",
                hint: "What angle is the wall at relative to the sensor?",
                answer:
                  "The wall is almost certainly angled more than about 30° from perpendicular, so the burst reflects away instead of returning. The sensor times out and reports maximum range, which is indistinguishable from clear space. Mount several sensors at different angles, or add an infrared or LiDAR sensor whose failure modes differ.",
              },
              {
                type: "summary",
                points: [
                  "Distance = speed of sound × echo time ÷ 2; the ÷2 accounts for the round trip",
                  "The speed of sound varies with temperature — about 3.5% over a 20 °C swing",
                  "Angled, soft and thin objects are effectively invisible",
                  "A missed echo reports maximum range, which reads like 'clear' — always handle it explicitly",
                ],
              },
            ],
            quiz: {
              title: "Ultrasonic sensing",
              questions: [
                {
                  prompt: "Echo time is 3 ms. What is the distance, at 343 m/s?",
                  explanation: "d = 343 × 0.003 / 2 = 0.51 m.",
                  answers: [
                    { text: "About 0.51 m", correct: true },
                    { text: "About 1.03 m" },
                    { text: "About 0.26 m" },
                    { text: "About 2.06 m" },
                  ],
                },
                {
                  prompt: "Why is a missed echo more dangerous than an obviously wrong reading?",
                  explanation:
                    "It is reported as maximum range, which is indistinguishable from a clear path — so the robot accelerates rather than stopping.",
                  answers: [
                    { text: "It reads as maximum range, which looks exactly like a clear path", correct: true },
                    { text: "It crashes the sensor driver" },
                    { text: "It reports zero, so the robot stops unnecessarily" },
                    { text: "It permanently damages the sensor" },
                  ],
                },
              ],
            },
          },
          {
            slug: "encoders",
            title: "Encoders",
            summary:
              "The sensor that closes the loop on every motor: how quadrature works, why it gives four counts per line, and what homing is for.",
            estimatedMinutes: 12,
            keyTerms: ["encoder", "odometry", "closed-loop-control"],
            objectives: [
              "Explain how quadrature encoding recovers direction as well as motion",
              "Compute resolution in degrees from counts per revolution",
              "Choose between incremental and absolute encoders for a given axis",
            ],
            blocks: [
              {
                type: "prose",
                text: "An encoder answers one question: *how far has this shaft turned?* Without it a motor is a hopeful suggestion. With it, position control becomes possible.",
              },
              {
                type: "heading",
                level: 2,
                text: "Quadrature: two channels, four states",
              },
              {
                type: "prose",
                text: "A single channel produces a pulse train — you can count motion, but not tell forward from backward. Add a second channel offset by a quarter cycle and the **order** in which edges arrive reveals direction.",
              },
              {
                type: "diagram",
                name: "quadrature",
                title: "Quadrature signals",
                caption:
                  "Forward: A leads B. Reverse: B leads A. Four distinct edges per line pair give 4× the resolution.",
              },
              {
                type: "math",
                title: "Resolution",
                latex: "\\text{counts/rev} = 4 \\times \\text{lines}, \\qquad \\text{resolution} = \\frac{360°}{\\text{counts/rev}}",
                where: [
                  { symbol: "\\text{lines}", meaning: "optical or magnetic lines on the disc" },
                  { symbol: "4\\times", meaning: "quadrature decoding counts every rising and falling edge on both channels" },
                ],
                note: "A 500-line encoder gives 2000 counts per revolution — 0.18° per count. Behind a 50:1 gearbox that becomes 0.0036° at the joint.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "Gearing multiplies resolution as well as torque",
                text: "Mount the encoder on the **motor** shaft rather than the joint and every gearbox reduction multiplies your angular resolution by the ratio. This is why cheap encoders work fine on geared joints — and why a direct-drive joint needs a far more expensive encoder for the same precision.",
              },
              {
                type: "compare",
                title: "Incremental vs absolute",
                columns: [
                  {
                    heading: "Incremental",
                    tone: "neutral",
                    points: [
                      "Reports change, not position",
                      "Position is lost at every power-off",
                      "Needs a homing sequence at startup",
                      "Cheap and very high resolution",
                    ],
                  },
                  {
                    heading: "Absolute",
                    tone: "neutral",
                    points: [
                      "Reports a unique code per shaft angle",
                      "Position survives a power cycle",
                      "No homing needed — ready instantly",
                      "More expensive; multi-turn versions more so",
                    ],
                  },
                ],
              },
              {
                type: "prose",
                text: "This is why an industrial arm with incremental encoders must be **homed** after a power failure — it genuinely does not know where its joints are. It is also why an operator must never restore power with the arm inside a machine: homing moves the axes.",
              },
              {
                type: "code",
                language: "python",
                title: "Decoding quadrature in software",
                code: `class QuadratureDecoder:
    """Software decoding. Real systems use a hardware counter."""

    # Index by (previous_state, current_state) -> increment
    TRANSITIONS = {
        (0b00, 0b01): +1, (0b01, 0b11): +1, (0b11, 0b10): +1, (0b10, 0b00): +1,
        (0b00, 0b10): -1, (0b10, 0b11): -1, (0b11, 0b01): -1, (0b01, 0b00): -1,
    }

    def __init__(self, counts_per_rev: int):
        self.counts_per_rev = counts_per_rev
        self.count = 0
        self._state = 0b00

    def update(self, a: int, b: int) -> None:
        new_state = (a << 1) | b
        self.count += self.TRANSITIONS.get((self._state, new_state), 0)
        self._state = new_state

    @property
    def revolutions(self) -> float:
        return self.count / self.counts_per_rev

    @property
    def degrees(self) -> float:
        return self.revolutions * 360.0`,
                annotations: [
                  { line: 5, text: "Only eight transitions are valid. Anything else means a missed edge — so .get() returning 0 quietly ignores impossible jumps rather than corrupting the count." },
                  { line: 16, text: "Pack the two channel bits into a 2-bit state, so a transition is just a pair of states." },
                  { line: 20, text: "@property lets callers write decoder.degrees rather than decoder.degrees()." },
                ],
              },
              {
                type: "callout",
                tone: "warning",
                title: "Software decoding drops counts",
                text: "At 3000 rpm a 500-line encoder produces 100,000 edges per second. Polling in Python cannot keep up, and every missed edge is a permanent position error that never self-corrects. Real systems use the microcontroller's hardware quadrature peripheral. The code above is for understanding the algorithm, not for production.",
              },
              {
                type: "check",
                question:
                  "A 250-line encoder sits on a motor behind a 20:1 gearbox. What is the resolution at the joint?",
                hint: "Quadrature first, then gearing.",
                answer:
                  "250 lines × 4 = 1000 counts per motor revolution, so 0.36° per count at the motor. The 20:1 gearbox means 20 motor revolutions per joint revolution, giving 20,000 counts per joint revolution — 0.018° per count at the joint.",
              },
              {
                type: "summary",
                points: [
                  "Two channels offset by a quarter cycle recover direction as well as displacement",
                  "Quadrature decoding yields four counts per line pair",
                  "Encoder-on-motor plus gearing multiplies effective resolution by the gear ratio",
                  "Incremental encoders lose position at power-off, which is why homing exists",
                  "Decode in hardware — software polling drops counts and the error is permanent",
                ],
              },
            ],
            quiz: {
              title: "Encoders",
              questions: [
                {
                  prompt: "How many counts per revolution does a 500-line quadrature encoder give?",
                  explanation: "Quadrature decoding counts all four edges per line pair: 500 × 4 = 2000.",
                  answers: [
                    { text: "2000", correct: true },
                    { text: "500" },
                    { text: "1000" },
                    { text: "250" },
                  ],
                },
                {
                  prompt: "Why must a robot with incremental encoders be homed after power-up?",
                  explanation:
                    "Incremental encoders report change, not absolute position, so after a power cycle the controller has no idea where the joints are.",
                  answers: [
                    { text: "Incremental encoders report change only, so absolute position is unknown", correct: true },
                    { text: "The motors need to warm up" },
                    { text: "It recalibrates the gearbox backlash" },
                    { text: "It clears the encoder's internal memory" },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },

  {
    slug: "math-for-robotics",
    track: "mathematics",
    title: "Mathematics for Robotics",
    subtitle: "Every concept introduced by the robot problem that needs it",
    description:
      "No abstract theory first. Trigonometry arrives because an arm needs to know where its hand is; vectors arrive because a robot needs to face a target; matrices arrive because chaining transformations by hand becomes unbearable.",
    difficulty: "INTERMEDIATE",
    tags: ["mathematics", "linear algebra", "trigonometry"],
    prerequisites: ["python-for-robotics"],
    skills: ["robot-math"],
    modules: [
      {
        slug: "geometry",
        title: "Trigonometry and vectors",
        description: "The maths of pointing at things and reaching for them.",
        lessons: [
          {
            slug: "trigonometry-for-arms",
            title: "Trigonometry, because an arm needs it",
            summary:
              "Sine and cosine are not abstractions — they are the answer to 'my arm is 30 cm long and rotated 40°, so where is my hand?'",
            estimatedMinutes: 13,
            objectives: [
              "Convert between an angle-and-length description and x, y coordinates",
              "Use atan2 correctly and explain why plain atan is insufficient",
              "Apply the law of cosines to a two-link arm",
            ],
            blocks: [
              {
                type: "prose",
                text: "Here is the problem trigonometry exists to solve. A robot arm segment is 0.30 m long, anchored at the origin, rotated 40° above horizontal. Where is its tip?",
              },
              {
                type: "math",
                title: "From polar to Cartesian",
                latex: "x = L\\cos\\theta, \\qquad y = L\\sin\\theta",
                where: [
                  { symbol: "L", meaning: "link length", unit: "m" },
                  { symbol: "\\theta", meaning: "angle from the positive x axis", unit: "rad" },
                ],
                note: "0.30 × cos(40°) = 0.230 m, 0.30 × sin(40°) = 0.193 m. That is forward kinematics for a one-link arm, complete.",
              },
              {
                type: "callout",
                tone: "warning",
                title: "Python's trig functions take radians",
                text: "`math.cos(40)` computes the cosine of 40 **radians**, which is about −0.67 — a completely different arm pose. Convert first: `math.cos(math.radians(40))`. This bug is silent, plausible-looking and extremely common.",
              },
              {
                type: "heading",
                level: 2,
                text: "Going backwards needs atan2",
              },
              {
                type: "prose",
                text: "Given a target at (0.230, 0.193), what angle points at it? The naive answer is `atan(y/x)` — and it is wrong half the time, because dividing y by x discards which quadrant the point is in.",
              },
              {
                type: "table",
                title: "Why atan alone fails",
                columns: ["Target", "y/x", "atan(y/x)", "atan2(y, x)", "Correct?"],
                rows: [
                  ["(1, 1)", "1", "45°", "45°", "Both fine"],
                  ["(−1, −1)", "1", "45°", "−135°", "Only atan2 — the target is behind"],
                  ["(0, 1)", "∞", "Error", "90°", "Only atan2"],
                  ["(−1, 1)", "−1", "−45°", "135°", "Only atan2"],
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "Always use atan2",
                text: "`atan2(y, x)` takes both coordinates separately, so it knows the quadrant and returns the full −π to +π range. It also handles x = 0 without dividing by zero. In robotics you will effectively never want plain `atan`.",
              },
              {
                type: "heading",
                level: 2,
                text: "Two links: the law of cosines",
              },
              {
                type: "prose",
                text: "With two links, the geometry of reaching a target becomes a triangle: link 1, link 2, and the straight-line distance to the target. The law of cosines relates the sides of any triangle to one of its angles — which is exactly the elbow angle you need.",
              },
              {
                type: "math",
                title: "Law of cosines, applied to an elbow",
                latex: "\\cos\\theta_2 = \\frac{x^2 + y^2 - L_1^2 - L_2^2}{2 L_1 L_2}",
                where: [
                  { symbol: "L_1, L_2", meaning: "the two link lengths", unit: "m" },
                  { symbol: "x, y", meaning: "target position relative to the shoulder", unit: "m" },
                  { symbol: "\\theta_2", meaning: "elbow angle" },
                ],
                note: "If the right-hand side falls outside [−1, 1], no triangle exists and the target is out of reach. That check is your workspace test, and it costs one comparison.",
              },
              {
                type: "code",
                language: "python",
                title: "Reaching, with the unreachable case handled",
                code: `import math

L1, L2 = 0.30, 0.25

def elbow_angle_rad(x: float, y: float) -> float | None:
    """Elbow angle for a 2-link planar arm, or None if unreachable."""
    cos_theta2 = (x*x + y*y - L1*L1 - L2*L2) / (2 * L1 * L2)

    if not -1.0 <= cos_theta2 <= 1.0:
        return None                       # outside the workspace

    return math.acos(cos_theta2)


for target in [(0.40, 0.20), (0.55, 0.00), (0.90, 0.10)]:
    angle = elbow_angle_rad(*target)
    if angle is None:
        print(f"{target}: unreachable")
    else:
        print(f"{target}: elbow {math.degrees(angle):.1f}°")`,
                annotations: [
                  { line: 9, text: "The reachability test. Floating-point error can push a just-reachable target to 1.0000000001, so real code often clamps into range first." },
                  { line: 12, text: "acos returns 0 to π, giving the elbow-up solution. Negate it for elbow-down — both are valid." },
                ],
                output: `(0.4, 0.2): elbow 65.2°
(0.55, 0.0): elbow 0.0°
(0.9, 0.1): unreachable`,
              },
              {
                type: "interactive",
                widget: "arm-ik",
                title: "Drag the target",
                instructions:
                  "Move the target and watch the joint angles solve in real time. Drag it beyond the outer circle to see the unreachable case. Toggle elbow-up and elbow-down to see both valid solutions.",
              },
              {
                type: "check",
                question:
                  "Links of 0.3 m and 0.25 m. Is a target at (0.6, 0.0) reachable?",
                hint: "What is the furthest the arm can stretch?",
                answer:
                  "No. Maximum reach is L1 + L2 = 0.55 m with the arm fully straight, and the target is 0.60 m away. The cosine formula returns a value greater than 1, which is the algebra telling you the triangle does not close.",
              },
              {
                type: "summary",
                points: [
                  "x = L cos θ, y = L sin θ is one-link forward kinematics in full",
                  "Python trig works in radians — convert, or get silently wrong answers",
                  "Use atan2(y, x), never atan(y/x): it keeps the quadrant and handles x = 0",
                  "The law of cosines solves a two-link elbow, and its domain check is the workspace test",
                ],
              },
            ],
            quiz: {
              title: "Trigonometry for arms",
              questions: [
                {
                  prompt: "Why use atan2(y, x) rather than atan(y / x)?",
                  explanation:
                    "The division discards quadrant information and blows up at x = 0. atan2 keeps both coordinates and returns the full −π to π range.",
                  answers: [
                    { text: "It preserves the quadrant and handles x = 0", correct: true },
                    { text: "It is faster" },
                    { text: "It returns degrees instead of radians" },
                    { text: "It never returns a negative angle" },
                  ],
                },
                {
                  prompt: "In the 2-link cosine formula, the right-hand side evaluates to 1.4. What does that mean?",
                  explanation:
                    "Cosine is bounded by ±1, so no triangle closes: the target lies outside the arm's reachable workspace.",
                  answers: [
                    { text: "The target is unreachable", correct: true },
                    { text: "The elbow angle is 1.4 radians" },
                    { text: "The arm is at a singularity" },
                    { text: "The links are too short by 40%" },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },

  {
    slug: "coordinate-frames",
    track: "kinematics",
    title: "Coordinate Frames & Transformations",
    subtitle: "Where things are, relative to what",
    description:
      "The single most useful idea in robotics: a position means nothing without a frame. Learn to attach frames, transform between them, and compose chains of transformations — the machinery underneath TF2, URDF and every kinematics library.",
    difficulty: "INTERMEDIATE",
    tags: ["kinematics", "transformations", "frames"],
    prerequisites: ["math-for-robotics"],
    skills: ["kinematics"],
    modules: [
      {
        slug: "frames",
        title: "Frames and transformations",
        description: "From 'a position is meaningless alone' to composing transformation chains.",
        lessons: [
          {
            slug: "why-frames-exist",
            title: "Why coordinate frames exist",
            summary:
              "A camera says the object is at (0.2, 0.1, 0.8). The robot cannot use that. This lesson explains why, and what fixes it.",
            estimatedMinutes: 12,
            keyTerms: ["coordinate-frame", "tf", "tcp"],
            objectives: [
              "Explain why a coordinate triple alone is not a position",
              "Name the standard frames on a mobile manipulator and their parents",
              "Describe how a frame tree turns local measurements into shared knowledge",
            ],
            blocks: [
              {
                type: "prose",
                text: "A vision system reports a bottle at **(0.2, 0.1, 0.8)**. The arm is asked to pick it up and misses by half a metre. Nothing is broken. The numbers were correct — and useless.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "The central idea",
                text: "**A coordinate triple is not a position.** It is a position *relative to some frame*. (0.2, 0.1, 0.8) in the camera frame and (0.2, 0.1, 0.8) in the robot base frame are different places in the room. Numbers without a frame are meaningless — and treating them as meaningful is the root of a large share of integration bugs.",
              },
              {
                type: "prose",
                text: "A **coordinate frame** is an origin plus three perpendicular axes attached to something physical. Robotics uses right-handed frames everywhere: point the right hand's fingers along +X, curl toward +Y, and the thumb points along +Z.",
              },
              {
                type: "heading",
                level: 2,
                text: "The standard frames",
              },
              {
                type: "table",
                title: "Frames on a mobile manipulator",
                columns: ["Frame", "Attached to", "Parent", "Why it exists"],
                rows: [
                  ["map", "The building", "—", "A fixed reference the robot navigates in"],
                  ["odom", "Where the robot started", "map", "Smooth, continuous — but drifts"],
                  ["base_link", "The robot chassis", "odom", "Everything on the robot is described from here"],
                  ["arm_base", "Arm mounting plate", "base_link", "Where the manipulator begins"],
                  ["link_1 … link_6", "Each arm segment", "the previous link", "Moves as the joint moves"],
                  ["flange", "Arm mounting face", "link_6", "Fixed, tool-independent"],
                  ["tool0 / TCP", "The working point of the tool", "flange", "What motion commands actually control"],
                  ["camera_link", "The camera body", "base_link", "Where vision measurements originate"],
                ],
              },
              {
                type: "callout",
                tone: "note",
                title: "Why both map and odom exist",
                text: "Odometry is **smooth but drifts** — integrate wheel rotations and error accumulates forever. Localisation against a map is **accurate but jumpy** — a scan match can correct the pose by 10 cm in a single step. Controllers need smooth; planners need accurate. Keeping two frames, with localisation adjusting the map→odom transform, gives each consumer what it needs. This is why the ROS convention has both, and it confuses everyone exactly once.",
              },
              {
                type: "flow",
                title: "The frame tree",
                direction: "vertical",
                nodes: [
                  { label: "map", detail: "fixed to the world" },
                  { label: "odom", detail: "corrected by localisation" },
                  { label: "base_link", detail: "the robot itself", accent: true },
                  { label: "arm_base → link_1 … link_6 → flange → tool0" },
                  { label: "camera_link", detail: "a sibling branch off base_link" },
                ],
              },
              {
                type: "prose",
                text: "Because every frame has exactly one parent, the tree lets you compute the relationship between *any* two frames by walking the path between them. The camera's measurement becomes usable by the arm without either component knowing anything about the other — which is precisely what makes modular robot software possible.",
              },
              {
                type: "callout",
                tone: "mistake",
                title: "Two parents breaks everything",
                text: "If two nodes both publish a transform for `base_link`, the tree is no longer a tree. Lookups return whichever arrived most recently, so results flicker between two answers and the robot behaves erratically in a way that is very hard to trace. **Exactly one publisher per frame, always.**",
              },
              {
                type: "example",
                title: "The bottle, resolved",
                scenario:
                  "The camera reports a bottle at (0.2, 0.1, 0.8) in `camera_link`. The arm plans in `base_link`.",
                steps: [
                  "Look up the transform from camera_link to base_link — a fixed mounting offset",
                  "The camera sits 0.35 m forward and 0.60 m above base_link, pitched 30° down",
                  "Apply that transform to the measured point",
                  "The bottle is at (0.83, 0.10, 0.29) in base_link",
                  "The arm plans to that pose",
                ],
                result:
                  "Same physical bottle, two valid descriptions. The transform is the translator — and TF2 does this lookup automatically once every frame is published correctly.",
              },
              {
                type: "interactive",
                widget: "frame-viewer",
                title: "Two frames, one point",
                instructions:
                  "Move and rotate the camera frame. The physical point stays put while its coordinates in each frame change — which is the whole idea in one picture.",
              },
              {
                type: "check",
                question:
                  "A robot's gripper is at (0.5, 0, 0.4). Is that enough to know where it is?",
                hint: "Relative to what?",
                answer:
                  "No. Relative to `base_link` it is half a metre in front of the robot. Relative to `map` it is somewhere in the building that depends entirely on where the robot is standing. Without a named frame the triple is not a location.",
              },
              {
                type: "summary",
                points: [
                  "A coordinate triple without a frame is not a position",
                  "A frame is an origin plus three axes attached to something physical; robotics uses right-handed frames",
                  "Every frame has exactly one parent, forming a tree that makes any-to-any lookup possible",
                  "map and odom both exist because controllers need smoothness and planners need accuracy",
                  "Two publishers on one frame corrupts the tree and produces flickering, hard-to-trace faults",
                ],
              },
            ],
            quiz: {
              title: "Coordinate frames",
              questions: [
                {
                  prompt: "Why does the ROS convention keep both an odom frame and a map frame?",
                  explanation:
                    "Odometry is smooth but drifts; map-based localisation is accurate but jumps on correction. Separating them lets controllers use the smooth one and planners the accurate one.",
                  answers: [
                    { text: "Odometry is smooth but drifts; map localisation is accurate but jumps", correct: true },
                    { text: "map is for indoors and odom for outdoors" },
                    { text: "One is metric and the other is in pixels" },
                    { text: "odom is a backup used only if map fails" },
                  ],
                },
                {
                  prompt: "Two nodes both publish the transform for base_link. What happens?",
                  explanation:
                    "The tree becomes ambiguous. Lookups return whichever transform arrived last, so results flicker between two answers.",
                  answers: [
                    { text: "Lookups flicker between the two, causing erratic behaviour", correct: true },
                    { text: "TF2 averages them" },
                    { text: "The second publisher is rejected automatically" },
                    { text: "Nothing — extra publishers are harmless" },
                  ],
                },
              ],
            },
          },
          {
            slug: "homogeneous-transformations",
            title: "Homogeneous transformations",
            summary:
              "Rotation and translation packed into one 4×4 matrix, so composing a whole kinematic chain becomes a single multiplication.",
            estimatedMinutes: 14,
            keyTerms: ["transformation-matrix", "rotation-matrix"],
            objectives: [
              "Construct a homogeneous transformation matrix from a rotation and a translation",
              "Compose transformations in the correct order and explain why order matters",
              "Invert a transformation using the structure of the matrix rather than a general inverse",
            ],
            blocks: [
              {
                type: "prose",
                text: "Moving a point between frames needs two operations: **rotate** to align the axes, then **translate** to shift the origin. Doing them separately is workable for one frame and unbearable for a six-joint chain. The homogeneous transformation packs both into one object.",
              },
              {
                type: "math",
                title: "The 4×4 transformation",
                latex: "T = \\begin{bmatrix} r_{11} & r_{12} & r_{13} & p_x \\\\ r_{21} & r_{22} & r_{23} & p_y \\\\ r_{31} & r_{32} & r_{33} & p_z \\\\ 0 & 0 & 0 & 1 \\end{bmatrix} = \\begin{bmatrix} R & p \\\\ 0^{T} & 1 \\end{bmatrix}",
                where: [
                  { symbol: "R", meaning: "3×3 rotation matrix — how the axes are turned" },
                  { symbol: "p", meaning: "3×1 translation — where the origin moved", unit: "m" },
                  { symbol: "[0\\ 0\\ 0\\ 1]", meaning: "the row that makes composition work by matrix multiplication" },
                ],
              },
              {
                type: "prose",
                text: "Points get a fourth coordinate of 1, so a point becomes [x, y, z, 1]ᵀ. Multiply by T and both the rotation and the translation are applied in one step. That bottom row of zeros and a one is what makes the algebra close.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "The payoff",
                text: "A six-joint arm's forward kinematics becomes **one line**: multiply the six joint transformations together. Without the homogeneous form you would be tracking rotations and translations separately and applying them in the right order by hand at every step, which is exactly as error-prone as it sounds.",
              },
              {
                type: "math",
                title: "Composing a chain",
                latex: "{}^{0}T_{3} = {}^{0}T_{1} \\; {}^{1}T_{2} \\; {}^{2}T_{3}",
                note: "Read right to left as operations, left to right as frames. Superscripts and subscripts cancel like units: 0→1, 1→2, 2→3 gives 0→3.",
              },
              {
                type: "callout",
                tone: "mistake",
                title: "Matrix multiplication does not commute",
                text: "`rotate_then_translate ≠ translate_then_rotate`. Rotate 90° about Z then move 1 m along X, and you end up somewhere entirely different than if you move first. Getting this backwards is the single most common transformation bug, and it produces a robot that is confidently, consistently in the wrong place.",
              },
              {
                type: "code",
                language: "python",
                filename: "transforms.py",
                title: "Building and composing transformations",
                code: `import numpy as np

def rotation_z(theta_rad: float) -> np.ndarray:
    c, s = np.cos(theta_rad), np.sin(theta_rad)
    return np.array([[c, -s, 0],
                     [s,  c, 0],
                     [0,  0, 1]])


def transform(R: np.ndarray, p: np.ndarray) -> np.ndarray:
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = p
    return T


def invert(T: np.ndarray) -> np.ndarray:
    """Exploit the structure: R inverse is R transpose."""
    R, p = T[:3, :3], T[:3, 3]
    T_inv = np.eye(4)
    T_inv[:3, :3] = R.T
    T_inv[:3, 3] = -R.T @ p
    return T_inv


# Camera: 0.35 m forward, 0.60 m up, yawed 30° relative to base_link
T_base_camera = transform(rotation_z(np.radians(30)), np.array([0.35, 0.0, 0.60]))

point_in_camera = np.array([0.2, 0.1, 0.8, 1.0])
point_in_base = T_base_camera @ point_in_camera

print("in base_link:", np.round(point_in_base[:3], 3))
print("round trip: ", np.round((invert(T_base_camera) @ point_in_base)[:3], 3))`,
                annotations: [
                  { line: 19, text: "A rotation matrix is orthonormal, so its inverse is its transpose — no general matrix inversion needed, and no numerical error introduced." },
                  { line: 21, text: "The translation part is −Rᵀp, not −p. Undoing the rotation changes which direction 'back' points." },
                  { line: 30, text: "@ is matrix multiplication in NumPy. Using * here would multiply element-wise and silently produce nonsense." },
                ],
                output: `in base_link: [0.423 0.287 1.4  ]
round trip:  [0.2   0.1   0.8  ]`,
              },
              {
                type: "callout",
                tone: "tip",
                title: "Inverting the cheap way",
                text: "`np.linalg.inv(T)` works but does far more arithmetic than necessary and introduces avoidable numerical error. Because R is orthonormal, the inverse is exactly [Rᵀ, −Rᵀp]. In a control loop running at 1 kHz that difference is worth having.",
              },
              {
                type: "interactive",
                widget: "transform-visualiser",
                title: "Compose two transformations",
                instructions:
                  "Set a rotation and a translation, then swap their order with the toggle. The resulting frame lands somewhere different — that is non-commutativity, made visible.",
              },
              {
                type: "check",
                question: "Why is the inverse translation −Rᵀp rather than just −p?",
                hint: "Undo the rotation first, then ask which way is 'back'.",
                answer:
                  "Because the translation p is expressed in the parent frame's axes. To reverse the whole transform you must first undo the rotation, which changes the axes the translation is measured along. Rotating −p by Rᵀ expresses it correctly in the child frame. Using −p alone gives a transform that is wrong by exactly the rotation.",
              },
              {
                type: "summary",
                points: [
                  "A 4×4 homogeneous matrix packs a rotation and a translation into one composable object",
                  "Chains compose by matrix multiplication, so a whole arm is one product",
                  "Order matters — rotate-then-translate is a different result from translate-then-rotate",
                  "Inverting is [Rᵀ, −Rᵀp], which is both cheaper and more accurate than a general inverse",
                ],
              },
            ],
            quiz: {
              title: "Homogeneous transformations",
              questions: [
                {
                  prompt: "What does the bottom row [0 0 0 1] achieve?",
                  explanation:
                    "It makes the matrix square and closed under multiplication, so rotation and translation compose in a single matrix product.",
                  answers: [
                    { text: "It lets rotation and translation compose by matrix multiplication", correct: true },
                    { text: "It stores the scale factor" },
                    { text: "It is padding with no mathematical role" },
                    { text: "It holds the joint angle" },
                  ],
                },
                {
                  prompt: "How do you invert a homogeneous transformation efficiently?",
                  explanation:
                    "Rotation matrices are orthonormal, so R⁻¹ = Rᵀ, and the translation becomes −Rᵀp.",
                  answers: [
                    { text: "Transpose R and set the translation to −Rᵀp", correct: true },
                    { text: "Negate every element" },
                    { text: "Transpose the whole 4×4 matrix" },
                    { text: "Negate the translation and leave R unchanged" },
                  ],
                },
              ],
            },
          },
        ],
      },
    ],
  },
];
