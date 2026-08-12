import type { CourseSource } from "../schema";

export const advancedTrackCourses: CourseSource[] = [
  {
    slug: "forward-kinematics",
    track: "kinematics",
    title: "Forward Kinematics",
    subtitle: "Joint angles in, tool position out",
    description:
      "Given every joint angle, where is the tool? Always exactly one answer, always computable. Built up from a two-link arm to a general serial chain, with DH parameters introduced as the bookkeeping convention they are.",
    difficulty: "INTERMEDIATE",
    tags: ["kinematics", "forward kinematics", "DH"],
    prerequisites: ["coordinate-frames"],
    skills: ["kinematics"],
    modules: [
      {
        slug: "fk",
        title: "From joints to pose",
        description: "The direct problem, and why it is the easy one.",
        lessons: [
          {
            slug: "two-link-forward-kinematics",
            title: "Forward kinematics of a 2-link arm",
            summary:
              "Derive it from a triangle, generalise it to a chain, and see why forward kinematics always has exactly one solution.",
            estimatedMinutes: 13,
            keyTerms: ["forward-kinematics", "dh-parameters", "transformation-matrix"],
            objectives: [
              "Derive the forward kinematics of a planar 2-link arm from geometry",
              "Explain why the solution is always unique",
              "Extend the method to an arbitrary serial chain",
            ],
            blocks: [
              {
                type: "flow",
                title: "The forward problem",
                nodes: [
                  { label: "Joint angles θ₁, θ₂, …" },
                  { label: "Robot geometry — link lengths, axis directions", accent: true },
                  { label: "End effector position and orientation" },
                ],
              },
              {
                type: "prose",
                text: "Start with two links in a plane. The shoulder rotates by θ₁ and the elbow by θ₂, measured relative to the previous link. Where does the tip land?",
              },
              {
                type: "prose",
                text: "Work it out one link at a time. The elbow sits at the end of link 1, which is straightforward polar-to-Cartesian. The tip sits at the end of link 2 — but link 2's direction in the world is θ₁ + θ₂, because its angle is measured relative to link 1, which is itself rotated.",
              },
              {
                type: "math",
                title: "Planar 2-link forward kinematics",
                latex: "\\begin{aligned} x_{\\text{elbow}} &= L_1\\cos\\theta_1 \\\\ y_{\\text{elbow}} &= L_1\\sin\\theta_1 \\\\[6pt] x_{\\text{tip}} &= L_1\\cos\\theta_1 + L_2\\cos(\\theta_1 + \\theta_2) \\\\ y_{\\text{tip}} &= L_1\\sin\\theta_1 + L_2\\sin(\\theta_1 + \\theta_2) \\end{aligned}",
                where: [
                  { symbol: "L_1, L_2", meaning: "link lengths", unit: "m" },
                  { symbol: "\\theta_1", meaning: "shoulder angle from the x axis", unit: "rad" },
                  { symbol: "\\theta_2", meaning: "elbow angle, relative to link 1", unit: "rad" },
                ],
                note: "The (θ₁ + θ₂) term is the whole insight: joint angles are relative, so they accumulate down the chain.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "Why forward kinematics is always solvable",
                text: "Every joint angle produces exactly one link position, and there is only one way to stack them. Substitute the numbers and you get one answer, every time — no iteration, no ambiguity, no unreachable case. The inverse problem has none of these guarantees, which is why it gets its own course.",
              },
              {
                type: "code",
                language: "python",
                title: "Two links, then N links",
                code: `import numpy as np

def fk_planar(angles_rad: list[float], lengths_m: list[float]) -> np.ndarray:
    """Tip position of a planar serial arm with any number of links."""
    total_angle = 0.0
    x = y = 0.0
    for theta, L in zip(angles_rad, lengths_m):
        total_angle += theta          # angles accumulate down the chain
        x += L * np.cos(total_angle)
        y += L * np.sin(total_angle)
    return np.array([x, y])


print("2-link:", np.round(fk_planar([np.radians(30), np.radians(45)], [0.30, 0.25]), 4))
print("3-link:", np.round(fk_planar([np.radians(30), np.radians(45), np.radians(-20)],
                                    [0.30, 0.25, 0.10]), 4))`,
                annotations: [
                  { line: 8, text: "This one line is the generalisation. Each joint angle adds to the running total, exactly as (θ₁ + θ₂) did for two links." },
                  { line: 10, text: "Each link contributes its own displacement along the accumulated direction." },
                ],
                output: `2-link: [0.3268 0.3915]
3-link: [0.4211 0.4429]`,
              },
              {
                type: "interactive",
                widget: "arm-fk",
                title: "Move the joints",
                instructions:
                  "Drag the joint sliders and watch the tip trace out the workspace. Try holding θ₁ fixed while sweeping θ₂ — the tip traces a circle centred on the elbow, which is the geometry the formula encodes.",
              },
              {
                type: "heading",
                level: 2,
                text: "Beyond the plane: DH parameters",
              },
              {
                type: "prose",
                text: "In 3D, each joint transformation needs a rotation and a translation in space — six numbers per joint if you write them freely. **Denavit–Hartenberg** parameters cut that to four by constraining how frames are placed: put the z axis along the joint axis, and the x axis along the common normal to the next joint axis.",
              },
              {
                type: "table",
                title: "The four DH parameters",
                columns: ["Parameter", "Meaning", "Varies for"],
                rows: [
                  ["a — link length", "Distance along x between z axes", "Fixed by construction"],
                  ["α — link twist", "Angle about x between z axes", "Fixed by construction"],
                  ["d — link offset", "Distance along z between x axes", "The joint variable, if prismatic"],
                  ["θ — joint angle", "Angle about z between x axes", "The joint variable, if revolute"],
                ],
              },
              {
                type: "callout",
                tone: "warning",
                title: "DH is a convention, not a law",
                text: "Two incompatible versions are in circulation — standard and modified DH — and they place frames differently. Mixing a table from one with code expecting the other produces a plausible-looking robot that is subtly, consistently wrong. Also, DH is undefined when consecutive joint axes are parallel, because there is no unique common normal. Modern libraries increasingly skip DH and use URDF, which just states each joint's transform directly.",
              },
              {
                type: "check",
                question:
                  "A 2-link arm has θ₁ = 0°, θ₂ = 90°, L₁ = L₂ = 0.3 m. Where is the tip?",
                hint: "Link 1 points along x. Link 2 points along θ₁ + θ₂.",
                answer:
                  "(0.3, 0.3). Link 1 lies along x, putting the elbow at (0.3, 0). Link 2's world angle is 0° + 90° = 90°, so it points straight up, adding (0, 0.3). The tip is at (0.3, 0.3).",
              },
              {
                type: "summary",
                points: [
                  "Forward kinematics maps joint angles to tool pose, always with exactly one solution",
                  "Joint angles are relative, so they accumulate: link n's world direction is the sum of angles 1 to n",
                  "The planar formula generalises to any number of links with a running angle total",
                  "DH parameters describe a 3D joint in four numbers by constraining frame placement — but two conflicting conventions exist",
                ],
              },
            ],
            quiz: {
              title: "Forward kinematics",
              questions: [
                {
                  prompt: "Why does the second link's term use cos(θ₁ + θ₂) rather than cos(θ₂)?",
                  explanation:
                    "θ₂ is measured relative to link 1, which is itself rotated by θ₁. The world-frame direction is the sum.",
                  answers: [
                    { text: "θ₂ is relative to link 1, so world angles accumulate down the chain", correct: true },
                    { text: "It is a small-angle approximation" },
                    { text: "To convert degrees to radians" },
                    { text: "To account for the link lengths differing" },
                  ],
                },
                {
                  prompt: "How many solutions does forward kinematics have?",
                  explanation:
                    "Exactly one. Each set of joint angles determines exactly one tool pose.",
                  answers: [
                    { text: "Exactly one", correct: true },
                    { text: "Two — elbow up and elbow down" },
                    { text: "Infinitely many for a redundant arm" },
                    { text: "None if the target is unreachable" },
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
    slug: "inverse-kinematics",
    track: "kinematics",
    title: "Inverse Kinematics",
    subtitle: "Tool position in, joint angles out — the hard direction",
    description:
      "The problem you actually need solved, and the one with no guarantees: a target may have no solution, several, or infinitely many. Geometric solutions where the algebra permits, numerical Jacobian methods where it does not.",
    difficulty: "ADVANCED",
    tags: ["kinematics", "inverse kinematics", "jacobian"],
    prerequisites: ["forward-kinematics"],
    skills: ["kinematics"],
    modules: [
      {
        slug: "ik",
        title: "Solving the inverse problem",
        description: "Geometric and numerical approaches, and how to choose.",
        lessons: [
          {
            slug: "geometric-inverse-kinematics",
            title: "Geometric inverse kinematics",
            summary:
              "Solve a two-link arm exactly with the law of cosines, discover the elbow-up/elbow-down ambiguity, and see why this approach stops working at six joints.",
            estimatedMinutes: 15,
            keyTerms: ["inverse-kinematics", "jacobian", "singularity", "workspace"],
            objectives: [
              "Solve a planar 2-link arm analytically",
              "Explain why multiple solutions exist and how a controller chooses",
              "Describe when numerical methods become necessary",
            ],
            blocks: [
              {
                type: "flow",
                title: "The inverse problem",
                nodes: [
                  { label: "Desired tool position (x, y)" },
                  { label: "Robot geometry", accent: true },
                  { label: "Joint angles θ₁, θ₂ … — zero, one, several, or infinitely many" },
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "Why this direction is genuinely harder",
                text: "Forward kinematics is substitution. Inverse kinematics is solving a system of coupled non-linear trigonometric equations. There may be **no** solution (out of reach), **several** (elbow up or down), or **infinitely many** (a redundant arm). None of those cases exists in the forward direction.",
              },
              {
                type: "heading",
                level: 2,
                text: "Two links, solved exactly",
              },
              {
                type: "prose",
                text: "Solve the elbow first. The shoulder, elbow and target form a triangle with known sides: L₁, L₂, and the distance r to the target. The law of cosines gives the included angle directly.",
              },
              {
                type: "math",
                title: "Step 1 — the elbow angle",
                latex: "r^2 = x^2 + y^2, \\qquad \\cos\\theta_2 = \\frac{r^2 - L_1^2 - L_2^2}{2 L_1 L_2}, \\qquad \\theta_2 = \\pm\\arccos(\\cdot)",
                note: "The ± is the elbow-up and elbow-down solutions. Both place the tool at exactly the same point.",
              },
              {
                type: "math",
                title: "Step 2 — the shoulder angle",
                latex: "\\theta_1 = \\operatorname{atan2}(y, x) - \\operatorname{atan2}\\big(L_2\\sin\\theta_2,\\; L_1 + L_2\\cos\\theta_2\\big)",
                where: [
                  { symbol: "\\operatorname{atan2}(y,x)", meaning: "the direction from shoulder to target" },
                  { symbol: "\\text{second term}", meaning: "the angle between that direction and link 1" },
                ],
                note: "Point at the target, then back off by however much the bent elbow displaces link 1.",
              },
              {
                type: "diagram",
                name: "ik-two-solutions",
                title: "Elbow up and elbow down",
                caption:
                  "Both configurations put the tool on the target. They are mirror images about the shoulder-to-target line.",
              },
              {
                type: "code",
                language: "python",
                filename: "ik.py",
                title: "Complete 2-link IK, with every case handled",
                code: `import math

def inverse_kinematics(x: float, y: float, L1: float, L2: float,
                       elbow_up: bool = True) -> tuple[float, float] | None:
    """Joint angles in radians, or None if the target is unreachable."""
    r_squared = x*x + y*y
    r = math.sqrt(r_squared)

    if r > L1 + L2 or r < abs(L1 - L2):
        return None                       # too far, or inside the dead zone

    cos_theta2 = (r_squared - L1*L1 - L2*L2) / (2 * L1 * L2)
    cos_theta2 = max(-1.0, min(1.0, cos_theta2))   # guard float error at the limits

    theta2 = math.acos(cos_theta2)
    if not elbow_up:
        theta2 = -theta2

    theta1 = math.atan2(y, x) - math.atan2(L2 * math.sin(theta2),
                                           L1 + L2 * math.cos(theta2))
    return theta1, theta2


L1, L2 = 0.30, 0.25
for target in [(0.40, 0.20), (0.60, 0.00), (0.02, 0.01)]:
    for up in (True, False):
        result = inverse_kinematics(*target, L1, L2, elbow_up=up)
        label = "elbow-up  " if up else "elbow-down"
        if result is None:
            print(f"{target} {label}: unreachable")
        else:
            t1, t2 = result
            print(f"{target} {label}: θ1={math.degrees(t1):7.2f}°  θ2={math.degrees(t2):7.2f}°")`,
                annotations: [
                  { line: 9, text: "Two reachability tests. Too far is obvious; too close matters when links differ — the arm cannot fold tighter than |L1 − L2|." },
                  { line: 13, text: "A target exactly at maximum reach can compute to 1.0000000002 and crash acos. Clamping is not paranoia, it is necessary." },
                  { line: 17, text: "Negating θ2 mirrors the elbow. Both solutions are equally valid, so something must choose." },
                ],
                output: `(0.4, 0.2) elbow-up  : θ1= -5.68°  θ2=  65.24°
(0.4, 0.2) elbow-down: θ1=  58.99°  θ2= -65.24°
(0.6, 0.0) elbow-up  : unreachable
(0.6, 0.0) elbow-down: unreachable
(0.02, 0.01) elbow-up  : unreachable
(0.02, 0.01) elbow-down: unreachable`,
              },
              {
                type: "interactive",
                widget: "arm-ik",
                title: "Solve it by dragging",
                instructions:
                  "Drag the target anywhere. Toggle elbow-up/down and watch both solutions reach the same point. Drag beyond the outer ring for the unreachable case, and into the centre for the dead zone.",
              },
              {
                type: "callout",
                tone: "warning",
                title: "Choosing a solution is a real engineering decision",
                text: "Elbow-up and elbow-down both work — until the elbow-down path swings through a fixture. Controllers usually pick the solution closest to the current configuration, which keeps motion smooth and avoids surprise flips. But *usually* is not *always*: on a long path the arm can hit a point where it must switch, and the resulting reconfiguration looks alarming and can collide with the workcell.",
              },
              {
                type: "heading",
                level: 2,
                text: "When geometry runs out",
              },
              {
                type: "prose",
                text: "Two links: solvable on paper. Six joints in 3D: twelve coupled non-linear equations. A closed-form solution exists only for specific geometries — most usefully when the last three axes intersect at a point, the **spherical wrist**, which decouples position from orientation. Nearly every industrial arm is built that way *precisely so that* the IK has a closed form.",
              },
              {
                type: "prose",
                text: "For everything else, iterate. Start from the current joint angles, compute where that puts the tool, measure the error, and use the Jacobian to work out which joint changes reduce it. Step, repeat, converge.",
              },
              {
                type: "math",
                title: "The Jacobian iteration",
                latex: "\\Delta q = J^{+}(q)\\,\\big(x_{\\text{target}} - x_{\\text{current}}\\big), \\qquad q \\leftarrow q + \\alpha\\,\\Delta q",
                where: [
                  { symbol: "J^{+}", meaning: "pseudo-inverse of the Jacobian — handles non-square and rank-deficient cases" },
                  { symbol: "\\alpha", meaning: "step size, typically 0.1–0.5 for stability" },
                ],
                note: "Converges in a handful of iterations near the solution. Slows badly near singularities, where J loses rank and the pseudo-inverse becomes ill-conditioned.",
              },
              {
                type: "compare",
                title: "Analytic vs numerical IK",
                columns: [
                  {
                    heading: "Analytic (closed form)",
                    tone: "positive",
                    points: [
                      "Exact, in microseconds",
                      "Returns all solutions at once",
                      "Deterministic — same input, same output, always",
                      "Only exists for specific geometries",
                    ],
                  },
                  {
                    heading: "Numerical (iterative)",
                    tone: "neutral",
                    points: [
                      "Works for any geometry, including redundant arms",
                      "Returns one solution, near the starting guess",
                      "Milliseconds, and may fail to converge",
                      "Degrades near singularities",
                    ],
                  },
                ],
              },
              {
                type: "challenge",
                title: "Implement 2-link IK yourself",
                text: "Write the solver from scratch. It must return both solutions when they exist, detect both the out-of-reach and inside-the-dead-zone cases, and survive a target sitting exactly at maximum reach without crashing.",
                challengeSlug: "two-link-inverse-kinematics",
                hints: [
                  "Clamp the cosine into [−1, 1] before calling acos",
                  "The inner boundary is |L1 − L2|, not zero, whenever the links differ",
                  "Verify by feeding your answer back through forward kinematics",
                ],
              },
              {
                type: "summary",
                points: [
                  "Inverse kinematics may have zero, one, several or infinitely many solutions",
                  "A planar 2-link arm solves exactly: law of cosines for the elbow, then atan2 for the shoulder",
                  "Elbow-up and elbow-down are both valid; picking between them is an engineering decision with collision consequences",
                  "Industrial arms use a spherical wrist specifically so closed-form IK exists",
                  "Otherwise iterate with the Jacobian — general, but slower and fragile near singularities",
                ],
              },
            ],
            quiz: {
              title: "Inverse kinematics",
              questions: [
                {
                  prompt: "How many IK solutions does a planar 2-link arm have for a reachable interior target?",
                  explanation:
                    "Two — elbow-up and elbow-down — which collapse to one only at the exact workspace boundary.",
                  answers: [
                    { text: "Two", correct: true },
                    { text: "One" },
                    { text: "Infinitely many" },
                    { text: "Four" },
                  ],
                },
                {
                  prompt: "Why do most industrial arms have a spherical wrist?",
                  explanation:
                    "When the last three axes intersect at a point, position and orientation decouple, which admits a closed-form IK solution.",
                  answers: [
                    { text: "It decouples position from orientation, giving closed-form IK", correct: true },
                    { text: "It increases payload" },
                    { text: "It removes singularities" },
                    { text: "It is required by safety standards" },
                  ],
                },
                {
                  prompt: "Why clamp cos θ₂ into [−1, 1] before calling acos?",
                  explanation:
                    "Floating-point error at the exact workspace boundary can push the value marginally outside the valid domain, crashing acos on a legitimately reachable target.",
                  answers: [
                    { text: "Float error at the workspace boundary can push it just outside the valid domain", correct: true },
                    { text: "acos expects degrees" },
                    { text: "It selects the elbow-up solution" },
                    { text: "It converts to radians" },
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
    slug: "control-systems",
    track: "control",
    title: "Control Systems & PID",
    subtitle: "Making motion actually behave",
    description:
      "Why open-loop control fails, what feedback buys you, and each PID term derived from the specific problem it solves. Includes practical tuning that works on real hardware, not just on paper.",
    difficulty: "INTERMEDIATE",
    tags: ["control", "PID", "feedback"],
    prerequisites: ["python-for-robotics", "sensors-deep-dive"],
    skills: ["control-systems"],
    modules: [
      {
        slug: "feedback",
        title: "Feedback and PID",
        description: "From open loop to a tuned controller.",
        lessons: [
          {
            slug: "open-vs-closed-loop",
            title: "Open loop vs closed loop",
            summary:
              "Why 'run the motor for 2.3 seconds' fails the moment anything changes, and what measuring the result actually buys.",
            estimatedMinutes: 11,
            keyTerms: ["open-loop-control", "closed-loop-control", "encoder"],
            objectives: [
              "State what open-loop control assumes and when those assumptions break",
              "Explain what feedback buys and what it costs",
              "Identify which robot subsystems legitimately run open loop",
            ],
            blocks: [
              {
                type: "prose",
                text: "You want a robot to drive one metre. The obvious approach: it moves 0.5 m/s, so run the motors for two seconds. This is **open-loop control** — command, wait, hope.",
              },
              {
                type: "list",
                title: "Everything that assumption depends on",
                style: "bullet",
                items: [
                  "The battery is at the voltage you calibrated at",
                  "The floor has the same friction as the floor you tested on",
                  "The robot carries the same load",
                  "The motors have not worn since calibration",
                  "Nothing pushed the robot mid-move",
                ],
              },
              {
                type: "prose",
                text: "Every one of those changes constantly. Open loop is not merely imprecise — it has **no way to know** it went wrong, so error accumulates silently across every subsequent move.",
              },
              {
                type: "compare",
                title: "The two architectures",
                columns: [
                  {
                    heading: "Open loop",
                    tone: "negative",
                    points: [
                      "Command computed from the target alone",
                      "No sensor, so no way to detect error",
                      "Cheap and unconditionally stable",
                      "Fails silently under any disturbance",
                    ],
                  },
                  {
                    heading: "Closed loop",
                    tone: "positive",
                    points: [
                      "Command computed from the error",
                      "Rejects disturbances automatically",
                      "Tolerates model error and wear",
                      "Needs a sensor; can be made unstable by bad tuning",
                    ],
                  },
                ],
              },
              {
                type: "flow",
                title: "The feedback loop",
                nodes: [
                  { label: "Setpoint — where we want to be" },
                  { label: "Error = setpoint − measurement", accent: true },
                  { label: "Controller computes a command" },
                  { label: "Actuator drives the plant" },
                  { label: "Sensor measures the result" },
                  { label: "…back to the error calculation" },
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "What feedback actually buys",
                text: "Not precision — **robustness**. A closed-loop system does not need to know the battery voltage, the floor friction or the payload mass, because it measures the outcome and corrects. It converts *knowing the system perfectly* into *measuring the system continuously*, and the second is far easier to guarantee.",
              },
              {
                type: "callout",
                tone: "note",
                title: "Open loop is not always wrong",
                text: "Stepper-driven 3D printer axes are open loop and work well, because the loads are predictable and well within capacity. Hobby servos are closed loop internally but open loop to you — you command an angle and cannot read the result. Open loop is the right answer whenever disturbances are genuinely small relative to the tolerance you need.",
              },
              {
                type: "check",
                question:
                  "A robot arm holds position perfectly under no load. A 2 kg part is placed in the gripper and it sags 5 mm. Open or closed loop?",
                hint: "Did it detect and correct the sag?",
                answer:
                  "Closed loop, but with insufficient gain or no integral term. A genuinely open-loop arm would sag and stay sagged with no attempt to correct. Steady-state droop under a constant load is exactly the symptom that integral action exists to eliminate — which is the next lesson.",
              },
              {
                type: "summary",
                points: [
                  "Open loop assumes the world matches calibration and cannot detect when it does not",
                  "Closed loop measures the outcome and computes from error",
                  "Feedback buys robustness rather than precision — it trades perfect knowledge for continuous measurement",
                  "Open loop remains correct where disturbances are small relative to the required tolerance",
                ],
              },
            ],
            quiz: {
              title: "Open vs closed loop",
              questions: [
                {
                  prompt: "What does closed-loop control primarily provide over open-loop?",
                  explanation:
                    "Robustness: it corrects for disturbances and model error because it measures the actual outcome.",
                  answers: [
                    { text: "Robustness to disturbances and model error", correct: true },
                    { text: "Lower cost" },
                    { text: "Guaranteed stability" },
                    { text: "Faster response in every case" },
                  ],
                },
                {
                  prompt: "Which is a legitimate open-loop application?",
                  explanation:
                    "3D printer stepper axes face predictable, well-bounded loads, so open loop meets the tolerance without a sensor.",
                  answers: [
                    { text: "Stepper axes on a 3D printer", correct: true },
                    { text: "A robot arm holding a variable payload" },
                    { text: "A mobile robot navigating a warehouse" },
                    { text: "A drone maintaining altitude" },
                  ],
                },
              ],
            },
          },
          {
            slug: "pid-control",
            title: "PID control",
            summary:
              "Each term derived from the problem it exists to solve, then a tuning procedure that works on hardware.",
            estimatedMinutes: 18,
            keyTerms: ["pid", "overshoot", "settling-time", "steady-state-error"],
            objectives: [
              "Derive each PID term from the failure it corrects",
              "Diagnose overshoot, oscillation and offset from a step response",
              "Apply a systematic tuning procedure and handle integral wind-up",
            ],
            blocks: [
              {
                type: "prose",
                text: "PID is not three arbitrary knobs. Each term exists because the previous combination failed in a specific, predictable way. Build it up in that order and the whole thing becomes obvious.",
              },
              {
                type: "heading",
                level: 2,
                text: "P — proportional: respond in proportion to the error",
              },
              {
                type: "math",
                title: "Proportional control",
                latex: "u(t) = K_p \\, e(t), \\qquad e(t) = \\text{setpoint} - \\text{measurement}",
                note: "Far away, push hard. Close, push gently. Intuitive, and it gets you most of the way.",
              },
              {
                type: "prose",
                text: "Two failures appear immediately. Raise K_p for a fast response and the system **overshoots** and rings. Lower it for a smooth approach and it becomes sluggish — and worse, it stops short.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "Why P alone always leaves an offset",
                text: "A robot arm must produce holding torque to fight gravity. With P only, output is K_p × error — so zero error means zero output, and the arm falls. It settles at whatever error produces exactly enough torque to hold. **The offset is structural, not a tuning mistake.** No value of K_p removes it; larger gains only make it smaller while making overshoot worse.",
              },
              {
                type: "heading",
                level: 2,
                text: "I — integral: accumulate what P leaves behind",
              },
              {
                type: "math",
                title: "Adding integral action",
                latex: "u(t) = K_p e(t) + K_i \\int_0^t e(\\tau)\\,d\\tau",
                note: "While any error persists, the integral grows, and with it the output — until the error is actually zero.",
              },
              {
                type: "prose",
                text: "That kills steady-state error completely. But integral action introduces **phase lag**: the controller is now responding to the past as well as the present, so it keeps pushing after the target is reached. Too much K_i, and overshoot returns.",
              },
              {
                type: "callout",
                tone: "mistake",
                title: "Integral wind-up",
                text: "If the actuator saturates — a motor already at full power — error persists but the output cannot rise. The integral keeps accumulating anyway, sometimes to an enormous value. When the system finally reaches the target, that stored integral drives a huge overshoot that takes a long time to unwind. **Always clamp the integral, or stop accumulating while saturated.** This is the single most common PID bug in real robots.",
              },
              {
                type: "heading",
                level: 2,
                text: "D — derivative: anticipate, and damp",
              },
              {
                type: "math",
                title: "The full controller",
                latex: "u(t) = K_p e(t) + K_i \\int_0^t e(\\tau)\\,d\\tau + K_d \\frac{de(t)}{dt}",
                where: [
                  { symbol: "K_p", meaning: "responds to present error" },
                  { symbol: "K_i", meaning: "responds to accumulated past error" },
                  { symbol: "K_d", meaning: "responds to the rate of change — anticipating the future" },
                ],
              },
              {
                type: "prose",
                text: "The derivative term looks at how fast the error is shrinking. Closing fast, it applies a braking action *before* the target arrives. That is what damps overshoot without giving up the speed that a high K_p buys.",
              },
              {
                type: "callout",
                tone: "warning",
                title: "D amplifies noise, badly",
                text: "Differentiating a noisy measurement amplifies the noise enormously — a 1 mm jitter at 1 kHz looks like a velocity of 1 m/s. Untreated, this makes motors buzz and run hot. Real implementations low-pass filter the derivative, or compute it from the measurement rather than the error so setpoint steps do not produce an impulse.",
              },
              {
                type: "interactive",
                widget: "pid-simulator",
                title: "Tune it yourself",
                instructions:
                  "Start with Ki and Kd at zero and raise Kp until it oscillates. Add Kd to damp the oscillation. Add Ki last to remove the remaining offset. Watch overshoot, settling time and steady-state error respond to each.",
              },
              {
                type: "table",
                title: "Diagnosing from a step response",
                columns: ["Symptom", "Likely cause", "Fix"],
                rows: [
                  ["Never reaches setpoint", "No integral action", "Add or increase K_i"],
                  ["Large overshoot, then rings", "K_p too high, or too little damping", "Increase K_d, or reduce K_p"],
                  ["Slow, sluggish approach", "K_p too low", "Increase K_p"],
                  ["Sustained oscillation", "K_p far too high", "Halve K_p, then add K_d"],
                  ["Big overshoot only after saturation", "Integral wind-up", "Clamp the integral"],
                  ["Motor buzzes, runs hot", "K_d amplifying noise", "Filter the derivative, or reduce K_d"],
                  ["Fine slow, unstable fast", "Gains tuned at one operating point", "Gain scheduling, or feedforward"],
                ],
              },
              {
                type: "steps",
                title: "A tuning procedure that works",
                steps: [
                  {
                    title: "Zero everything",
                    text: "Set K_p, K_i and K_d to zero. Make sure you can log or plot the response — tuning blind is guesswork.",
                  },
                  {
                    title: "Raise K_p until it oscillates",
                    text: "Increase K_p until a step command produces sustained oscillation. Record that value as K_u, the ultimate gain, and its oscillation period T_u.",
                  },
                  {
                    title: "Back off",
                    text: "Set K_p to about 0.6 × K_u. The response should now be fast with modest overshoot.",
                  },
                  {
                    title: "Add derivative",
                    text: "Set K_d ≈ K_p × T_u / 8. Overshoot should shrink noticeably. If the motor starts buzzing, filter the derivative before increasing further.",
                  },
                  {
                    title: "Add integral last",
                    text: "Set K_i ≈ 2 × K_p / T_u. Only now should steady-state error disappear. Add integral clamping at the same time — not later.",
                  },
                  {
                    title: "Test the real operating envelope",
                    text: "Gains tuned unloaded will not hold under payload. Test at minimum and maximum load, and at both slow and fast setpoint changes.",
                  },
                ],
              },
              {
                type: "code",
                language: "python",
                filename: "pid.py",
                title: "A production-shaped PID",
                code: `class PID:
    def __init__(self, kp, ki, kd, output_limit=1.0,
                 integral_limit=None, derivative_filter=0.1):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.output_limit = output_limit
        self.integral_limit = integral_limit or output_limit
        self.alpha = derivative_filter

        self._integral = 0.0
        self._last_measurement = None
        self._derivative = 0.0

    def update(self, setpoint: float, measurement: float, dt: float) -> float:
        if dt <= 0:
            return 0.0

        error = setpoint - measurement

        # Derivative on measurement, not on error: a setpoint step would
        # otherwise produce an infinite spike ("derivative kick").
        if self._last_measurement is None:
            raw_derivative = 0.0
        else:
            raw_derivative = -(measurement - self._last_measurement) / dt
        self._derivative += self.alpha * (raw_derivative - self._derivative)
        self._last_measurement = measurement

        self._integral += error * dt
        self._integral = max(-self.integral_limit,
                             min(self.integral_limit, self._integral))

        output = self.kp * error + self.ki * self._integral + self.kd * self._derivative
        saturated = max(-self.output_limit, min(self.output_limit, output))

        # Anti-windup: unwind the accumulation that pushed us past the limit.
        if saturated != output:
            self._integral -= error * dt

        return saturated`,
                annotations: [
                  { line: 22, text: "Derivative of measurement, negated — mathematically equivalent for a constant setpoint, and free of the spike when the setpoint jumps." },
                  { line: 24, text: "A first-order low-pass on the derivative. Without it, sensor noise makes this term unusable." },
                  { line: 28, text: "Hard clamp on the integral: the simplest wind-up defence." },
                  { line: 35, text: "Conditional integration: if the output saturated, take back this step's accumulation. Belt and braces, and both are warranted." },
                ],
              },
              {
                type: "challenge",
                title: "Tune to a specification",
                text: "Using the simulator above, find gains giving **less than 5% overshoot**, settling **within 2 seconds**, and **zero steady-state error**. All three at once is achievable, but the margin is narrow — get two of them easily and the third will cost you real effort. Then add sensor noise and watch which term degrades first.",
                hints: [
                  "Overshoot is dominated by the K_p to K_d balance",
                  "Steady-state error can only be removed by K_i",
                  "If it oscillates at every setting, K_p is too high — halve it before touching anything else",
                ],
              },
              {
                type: "summary",
                points: [
                  "P responds to present error, and always leaves an offset against a constant load",
                  "I accumulates past error to remove that offset, at the cost of phase lag and wind-up risk",
                  "D responds to the rate of change, damping overshoot but amplifying noise",
                  "Tune in order: K_p to oscillation, back off, add K_d, then K_i last",
                  "Integral clamping and derivative filtering are not optional on real hardware",
                ],
              },
            ],
            quiz: {
              title: "PID control",
              questions: [
                {
                  prompt: "A P-only controlled arm settles 3° below its target and stays there. Why?",
                  explanation:
                    "Output is K_p × error, so holding torque requires non-zero error. The offset is structural — only integral action removes it.",
                  answers: [
                    { text: "P-only needs a non-zero error to generate holding torque", correct: true },
                    { text: "The encoder is miscalibrated" },
                    { text: "K_p is too high" },
                    { text: "The derivative term is missing" },
                  ],
                },
                {
                  prompt: "What is integral wind-up?",
                  explanation:
                    "While the actuator is saturated the error persists, so the integral keeps growing even though output cannot rise. That stored value then drives a large overshoot.",
                  answers: [
                    { text: "The integral accumulating while the actuator is already saturated", correct: true },
                    { text: "The derivative term amplifying sensor noise" },
                    { text: "K_p being set too high" },
                    { text: "The encoder losing counts" },
                  ],
                },
                {
                  prompt: "Why compute the derivative from the measurement rather than the error?",
                  explanation:
                    "A step change in setpoint makes the error jump instantaneously, and differentiating that produces an enormous spike in the output.",
                  answers: [
                    { text: "A setpoint step would otherwise produce a huge derivative spike", correct: true },
                    { text: "It is computationally cheaper" },
                    { text: "The error is not available in real time" },
                    { text: "It removes the need for K_i" },
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
    slug: "mobile-robot-foundations",
    track: "mobile-robotics",
    title: "Mobile Robot Foundations",
    subtitle: "Drive models, odometry and why position estimates drift",
    description:
      "How wheeled robots move and how they estimate where they have got to. Differential drive derived from first principles, odometry integrated properly, and an honest account of why dead reckoning always fails eventually.",
    difficulty: "INTERMEDIATE",
    tags: ["mobile robotics", "odometry", "navigation"],
    prerequisites: ["control-systems", "coordinate-frames"],
    skills: ["mobile-robots"],
    modules: [
      {
        slug: "drive-and-odometry",
        title: "Driving and dead reckoning",
        description: "Wheel speeds to robot motion, and back again.",
        lessons: [
          {
            slug: "differential-drive",
            title: "Differential drive and odometry",
            summary:
              "Two wheels, two speeds, and the maths that turns them into motion — plus the drift that makes odometry alone unusable over distance.",
            estimatedMinutes: 15,
            keyTerms: ["differential-drive", "odometry", "holonomic", "encoder"],
            objectives: [
              "Derive forward and inverse kinematics for a differential-drive base",
              "Integrate wheel encoder counts into a pose estimate",
              "Explain why odometry drift is unbounded and what corrects it",
            ],
            blocks: [
              {
                type: "prose",
                text: "Two driven wheels on a common axis, plus a caster for balance. It is the most common mobile robot configuration there is, because it turns in place and needs only two motors.",
              },
              {
                type: "math",
                title: "Forward kinematics — wheel speeds to robot motion",
                latex: "v = \\frac{v_R + v_L}{2}, \\qquad \\omega = \\frac{v_R - v_L}{L}",
                where: [
                  { symbol: "v", meaning: "forward speed of the robot centre", unit: "m/s" },
                  { symbol: "\\omega", meaning: "rotation rate", unit: "rad/s" },
                  { symbol: "v_R, v_L", meaning: "right and left wheel ground speeds", unit: "m/s" },
                  { symbol: "L", meaning: "track width — distance between the wheels", unit: "m" },
                ],
                note: "The mean of the wheel speeds is how fast you go. Their difference is how fast you turn. Equal and opposite gives v = 0 with ω ≠ 0 — spinning on the spot.",
              },
              {
                type: "math",
                title: "Inverse — a velocity command to wheel speeds",
                latex: "v_R = v + \\frac{\\omega L}{2}, \\qquad v_L = v - \\frac{\\omega L}{2}",
                note: "This is what runs inside every /cmd_vel subscriber on every differential-drive robot in ROS.",
              },
              {
                type: "interactive",
                widget: "diff-drive",
                title: "Drive it",
                instructions:
                  "Set the two wheel speeds and watch the path. Equal speeds give a straight line; equal and opposite spin in place; a small difference gives a large arc. Try making one wheel zero.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "Non-holonomic, and why parking is hard",
                text: "A differential-drive robot cannot move sideways. It can *reach* any pose eventually, but not by any path — it must turn first. That is the **non-holonomic constraint**, and it is why parallel parking takes several moves rather than one sideways slide. Planners for these robots must produce paths the robot can actually follow, not just paths that avoid obstacles.",
              },
              {
                type: "heading",
                level: 2,
                text: "Odometry: integrating your way to a position estimate",
              },
              {
                type: "prose",
                text: "Encoders report how far each wheel turned. Integrating that over time gives an estimate of where the robot has got to.",
              },
              {
                type: "math",
                title: "One integration step",
                latex: "\\begin{aligned} \\Delta s &= \\frac{\\Delta s_R + \\Delta s_L}{2}, \\qquad \\Delta\\theta = \\frac{\\Delta s_R - \\Delta s_L}{L} \\\\[4pt] x &\\mathrel{+}= \\Delta s\\cos\\!\\left(\\theta + \\tfrac{\\Delta\\theta}{2}\\right) \\\\ y &\\mathrel{+}= \\Delta s\\sin\\!\\left(\\theta + \\tfrac{\\Delta\\theta}{2}\\right) \\\\ \\theta &\\mathrel{+}= \\Delta\\theta \\end{aligned}",
                note: "Using the midpoint heading θ + Δθ/2 rather than θ is a second-order correction. It costs one addition and roughly halves the error accumulated on curves.",
              },
              {
                type: "code",
                language: "python",
                filename: "odometry.py",
                title: "Odometry from encoder counts",
                code: `import math

class DifferentialDriveOdometry:
    def __init__(self, wheel_radius_m, track_width_m, counts_per_rev):
        self.r = wheel_radius_m
        self.L = track_width_m
        self.counts_per_rev = counts_per_rev
        self.x = self.y = self.theta = 0.0
        self._last = None

    def update(self, left_counts: int, right_counts: int) -> tuple[float, float, float]:
        if self._last is None:
            self._last = (left_counts, right_counts)
            return self.x, self.y, self.theta

        d_left_counts = left_counts - self._last[0]
        d_right_counts = right_counts - self._last[1]
        self._last = (left_counts, right_counts)

        # Counts -> radians -> metres of arc at the wheel rim
        metres_per_count = (2 * math.pi * self.r) / self.counts_per_rev
        ds_left = d_left_counts * metres_per_count
        ds_right = d_right_counts * metres_per_count

        ds = (ds_right + ds_left) / 2.0
        dtheta = (ds_right - ds_left) / self.L

        # Midpoint heading — second-order accurate on curves
        mid_theta = self.theta + dtheta / 2.0
        self.x += ds * math.cos(mid_theta)
        self.y += ds * math.sin(mid_theta)
        self.theta = (self.theta + dtheta + math.pi) % (2 * math.pi) - math.pi

        return self.x, self.y, self.theta


odom = DifferentialDriveOdometry(0.035, 0.20, 2000)
for left, right in [(0, 0), (500, 500), (1000, 1200), (1500, 1900)]:
    x, y, t = odom.update(left, right)
    print(f"x={x:6.3f}  y={y:6.3f}  heading={math.degrees(t):7.2f}°")`,
                annotations: [
                  { line: 20, text: "The conversion chain: counts, to fraction of a revolution, to arc length at the rim. Getting the wheel radius wrong here scales every distance the robot ever reports." },
                  { line: 32, text: "Wrapping heading to (−π, π]. Without it, θ grows without bound and trigonometry loses precision after enough turns." },
                ],
                output: `x= 0.000  y= 0.000  heading=   0.00°
x= 0.055  y= 0.000  heading=   0.00°
x= 0.115  y= 0.001  heading=   1.10°
x= 0.181  y= 0.005  heading=   3.30°`,
              },
              {
                type: "heading",
                level: 2,
                text: "Why it always drifts",
              },
              {
                type: "callout",
                tone: "warning",
                title: "Odometry error never self-corrects",
                text: "Odometry integrates. Every error — wheel slip, tyre wear, a track width measured 2 mm wrong — is added permanently to the estimate and never removed. A 1% distance error is 1 cm over a metre and 1 m over 100 m. **Heading error is far worse**: a 1° heading error puts you 1.7 m sideways after 100 m of straight driving.",
              },
              {
                type: "table",
                title: "Sources of odometry error",
                columns: ["Source", "Type", "Can it be calibrated out?"],
                rows: [
                  ["Wrong wheel radius", "Systematic", "Yes — drive a measured distance and scale"],
                  ["Wrong track width", "Systematic", "Yes — rotate a known angle and scale"],
                  ["Unequal wheel diameters", "Systematic", "Yes — the UMBmark square test finds it"],
                  ["Wheel slip", "Random", "No — but it can be detected with an IMU"],
                  ["Uneven floor", "Random", "No"],
                  ["Encoder quantisation", "Random", "No, but it is small and averages out"],
                ],
              },
              {
                type: "prose",
                text: "Systematic errors are worth calibrating — they are the largest contributors and they are repeatable. Random errors cannot be removed, only bounded, and bounding them requires an **absolute** reference: matching a LiDAR scan to a map, a camera seeing a known landmark, or GPS outdoors. That is why Level 14 exists.",
              },
              {
                type: "example",
                title: "Detecting slip with an IMU",
                scenario:
                  "A robot's right wheel spins on a wet patch. Encoders report it turned; the robot did not.",
                steps: [
                  "Odometry computes Δθ from the wheel difference and reports a turn",
                  "The IMU gyroscope measures the actual rotation rate and reports almost none",
                  "The two disagree by far more than either sensor's noise",
                  "The estimator lowers its trust in odometry for that interval",
                ],
                result:
                  "Neither sensor alone catches this. Their disagreement is the signal — which is the core idea of sensor fusion, and why robots carry redundant sensing.",
              },
              {
                type: "check",
                question:
                  "A robot's odometry consistently reports 5% further than it actually travels. Which parameter is wrong, and which way?",
                hint: "What converts encoder counts into metres?",
                answer:
                  "The wheel radius is set about 5% too large. Every count is being multiplied by too many metres of arc. Fix it by dividing the configured radius by 1.05 — or better, drive a measured 10 m, compare with the reported distance, and scale by the ratio. Worn tyres cause exactly this, in the opposite direction.",
              },
              {
                type: "summary",
                points: [
                  "v is the mean of the wheel speeds; ω is their difference over the track width",
                  "Differential drive is non-holonomic — no sideways motion, so paths must be feasible not just clear",
                  "Odometry integrates wheel motion, so error accumulates permanently and never self-corrects",
                  "Heading error hurts far more than distance error over any real distance",
                  "Systematic errors calibrate out; random ones need an absolute reference to bound",
                ],
              },
            ],
            quiz: {
              title: "Differential drive and odometry",
              questions: [
                {
                  prompt: "Wheels at v_R = 0.5 and v_L = 0.3 m/s, track width 0.2 m. What are v and ω?",
                  explanation: "v = (0.5 + 0.3)/2 = 0.4 m/s. ω = (0.5 − 0.3)/0.2 = 1.0 rad/s.",
                  answers: [
                    { text: "v = 0.4 m/s, ω = 1.0 rad/s", correct: true },
                    { text: "v = 0.8 m/s, ω = 0.2 rad/s" },
                    { text: "v = 0.4 m/s, ω = 0.2 rad/s" },
                    { text: "v = 0.2 m/s, ω = 1.0 rad/s" },
                  ],
                },
                {
                  prompt: "Why can odometry error never be corrected by better encoders alone?",
                  explanation:
                    "Odometry integrates, so every error is permanently added. Wheel slip is invisible to encoders no matter how precise they are — only an absolute reference bounds the drift.",
                  answers: [
                    { text: "Integration accumulates error permanently, and slip is invisible to encoders", correct: true },
                    { text: "Encoders are inherently inaccurate" },
                    { text: "The maths is only an approximation" },
                    { text: "Floating-point rounding dominates" },
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
    slug: "industrial-manipulators",
    track: "manipulators",
    title: "Industrial Manipulators",
    subtitle: "Arms, frames, motion types and tooling",
    description:
      "Programming real industrial arms: the architectures, the frame system that makes programs maintainable, and the motion types whose differences decide whether a path is smooth, fast or possible at all. Vendor-neutral, with the terminology each manufacturer uses.",
    difficulty: "ADVANCED",
    tags: ["manipulators", "industrial", "motion"],
    prerequisites: ["inverse-kinematics"],
    skills: ["manipulation"],
    modules: [
      {
        slug: "frames-and-motion",
        title: "Frames and motion types",
        description: "The two things that determine whether an arm program survives contact with production.",
        lessons: [
          {
            slug: "tcp-and-frames",
            title: "TCP, tool frames and user frames",
            summary:
              "Why every industrial controller has this frame system, and why getting it right saves weeks of re-teaching.",
            estimatedMinutes: 14,
            keyTerms: ["tcp", "tool-frame", "user-frame", "end-effector"],
            objectives: [
              "Define TCP and explain how an incorrect one corrupts motion",
              "Set up a user frame and explain what it saves",
              "Map the vendor-specific names onto the same underlying concepts",
            ],
            blocks: [
              {
                type: "prose",
                text: "Every industrial robot controller — Yaskawa, ABB, FANUC, KUKA, Universal Robots, Kawasaki — implements the same three-frame idea under different names. Learn the concept and the vendor differences become vocabulary rather than new knowledge.",
              },
              {
                type: "table",
                title: "Same concept, six vendors",
                columns: ["Concept", "FANUC", "ABB", "KUKA", "Yaskawa", "UR"],
                rows: [
                  ["Tool frame / TCP", "UTOOL / Tool Frame", "tooldata", "TOOL", "TOOL file", "TCP"],
                  ["Work / user frame", "UFRAME / User Frame", "wobjdata", "BASE", "USER frame", "Feature"],
                  ["Joint move", "J", "MoveJ", "PTP", "MOVJ", "movej"],
                  ["Linear move", "L", "MoveL", "LIN", "MOVL", "movel"],
                  ["Circular move", "C", "MoveC", "CIRC", "MOVC", "movec"],
                ],
              },
              {
                type: "heading",
                level: 2,
                text: "The TCP is not the flange",
              },
              {
                type: "prose",
                text: "The robot's mechanical flange is fixed by the manufacturer. The **tool centre point** is where the work actually happens: the tip of a welding wire, the centre of a suction cup, the point between gripper fingers. It is defined as an offset and rotation from the flange, and you must tell the controller what it is.",
              },
              {
                type: "callout",
                tone: "mistake",
                title: "The bug that looks like everything else",
                text: "With a wrong TCP, pure translations still look fine — everything is offset by the same amount, which is easy to miss. But the moment the tool **reorients**, the error appears and grows with the rotation angle. A robot that traces a straight line beautifully and then wanders during a reorientation almost always has a TCP error, and people chase calibration and backlash for days before checking it.",
              },
              {
                type: "diagram",
                name: "tcp-frames",
                title: "Flange, tool frame and user frame",
                caption:
                  "Each frame is defined relative to its parent. The TCP is what motion commands actually control.",
              },
              {
                type: "prose",
                text: "A correct TCP also makes the robot **rotate about the tool tip** rather than about the flange. That is what lets an operator jog a welding torch around its own point without the tip wandering off the seam — and it is immediately obvious when it is wrong.",
              },
              {
                type: "heading",
                level: 2,
                text: "The user frame is where the maintenance savings live",
              },
              {
                type: "prose",
                text: "Teach ten pick positions in robot base coordinates. The fixture gets bumped 5 mm. Now re-teach all ten. Teach the same ten relative to a **user frame** attached to the fixture, and you re-teach the frame once — three points — and every position follows.",
              },
              {
                type: "example",
                title: "The saving, in a real cell",
                scenario:
                  "A palletising cell with 40 taught positions across a pallet. Maintenance shifts the pallet stand during a repair.",
                steps: [
                  "Without a user frame: 40 positions re-taught, roughly two hours, and a real chance of an error in one",
                  "With a user frame: re-teach the frame's three defining points, roughly ten minutes",
                  "All 40 positions, being stored relative to the frame, move automatically",
                ],
                result:
                  "Same robot, same program. The difference is entirely in how positions were expressed — which is why setting up frames properly is the first thing an experienced integrator does.",
              },
              {
                type: "heading",
                level: 2,
                text: "Motion types",
              },
              {
                type: "compare",
                title: "Joint vs linear motion",
                columns: [
                  {
                    heading: "Joint move (PTP / MoveJ)",
                    tone: "positive",
                    points: [
                      "Interpolates in joint space — all axes start and finish together",
                      "Fastest possible move between two poses",
                      "Path through space is curved and hard to predict",
                      "Passes through singularities without complaint",
                      "Use for free space where the path does not matter",
                    ],
                  },
                  {
                    heading: "Linear move (LIN / MoveL)",
                    tone: "neutral",
                    points: [
                      "Interpolates the TCP along a straight line",
                      "Slower — must continuously solve inverse kinematics",
                      "Path is exactly predictable",
                      "Faults near singularities",
                      "Use for approach, retract, and any process path",
                    ],
                  },
                ],
              },
              {
                type: "callout",
                tone: "warning",
                title: "The classic collision",
                text: "A programmer commands a joint move from above a bin to above a fixture. In simulation the endpoints are clear, so it looks safe. On the real robot the elbow swings out through the intervening space and hits the fence — because a joint move's *path* was never specified, only its endpoints. Free-space joint moves need a via point, or a check of the actual swept volume.",
              },
              {
                type: "list",
                title: "Practical rules that hold across vendors",
                style: "check",
                items: [
                  "Approach and retract linearly, along the tool axis — never at an angle into a fixture",
                  "Use joint moves for long free-space transits, with via points to control the swing",
                  "Define the TCP before teaching any position, or every taught point inherits the error",
                  "Teach relative to a user frame whenever the workpiece could ever move",
                  "Blend radii (CNT / zone / approximation) smooth corners and cut cycle time, at the cost of path accuracy — never blend into a process path",
                ],
              },
              {
                type: "check",
                question:
                  "A robot traces a straight weld perfectly, but when it reorients the torch mid-seam the tip drifts off the joint. What is wrong?",
                hint: "What error is invisible during pure translation but grows with rotation?",
                answer:
                  "The TCP is defined incorrectly. During pure translation every point of the tool moves identically, so an offset error is invisible. During reorientation the controller rotates about what it *believes* is the tool point; if that is wrong, the true tip sweeps an arc away from the seam, and the error grows with the rotation angle.",
              },
              {
                type: "summary",
                points: [
                  "Every vendor implements the same tool-frame and user-frame concepts under different names",
                  "The TCP is the working point, not the flange; a wrong TCP hides under translation and appears under rotation",
                  "User frames turn a fixture move from re-teaching everything into re-teaching one frame",
                  "Joint moves are fastest but their path is unspecified; linear moves are predictable but fault near singularities",
                ],
              },
            ],
            quiz: {
              title: "TCP and motion types",
              questions: [
                {
                  prompt: "Why does an incorrect TCP show up during reorientation but not during translation?",
                  explanation:
                    "In pure translation every tool point moves identically, hiding an offset. Rotation happens about the assumed tool point, so an error there sweeps the true tip along an arc.",
                  answers: [
                    { text: "Translation moves every tool point equally; rotation happens about the assumed point", correct: true },
                    { text: "Linear moves do not use the TCP at all" },
                    { text: "Rotation runs at higher speed" },
                    { text: "Encoders are less accurate during rotation" },
                  ],
                },
                {
                  prompt: "Why can a joint move collide even when both endpoints are verified clear?",
                  explanation:
                    "A joint move specifies only the endpoints; the Cartesian path between them is whatever the joint interpolation produces, and the elbow can swing far outside the straight line.",
                  answers: [
                    { text: "Only the endpoints are specified — the path between them is unconstrained", correct: true },
                    { text: "Joint moves ignore the TCP" },
                    { text: "Joint moves always take the longest route" },
                    { text: "Joint moves disable collision detection" },
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
    slug: "ros2-foundations",
    track: "ros2",
    title: "ROS 2 Foundations",
    subtitle: "Nodes, topics and the graph — every line explained",
    description:
      "ROS 2 from zero. What the framework is and is not, the publish–subscribe model, and a first publisher and subscriber with every single line explained. Plus the QoS behaviour that silently breaks more beginner systems than anything else.",
    difficulty: "ADVANCED",
    tags: ["ROS 2", "middleware", "software"],
    prerequisites: ["python-for-robotics", "coordinate-frames"],
    skills: ["ros2"],
    modules: [
      {
        slug: "graph",
        title: "The ROS graph",
        description: "Nodes, topics and messages — the model everything else builds on.",
        lessons: [
          {
            slug: "what-is-ros2",
            title: "What is ROS 2?",
            summary:
              "Not an operating system. A way of splitting a robot into small programs that find each other automatically and pass typed messages.",
            estimatedMinutes: 12,
            keyTerms: ["ros", "ros-node", "ros-topic", "dds"],
            objectives: [
              "Explain what ROS provides and what it explicitly does not",
              "Describe the publish–subscribe model and its decoupling benefits",
              "State what changed between ROS 1 and ROS 2 and why",
            ],
            blocks: [
              {
                type: "callout",
                tone: "note",
                title: "The name is misleading",
                text: "ROS is **not** an operating system. It runs on Linux. It is middleware plus build tooling plus a very large library of reusable robotics packages. The name is historical and everyone in the field has made peace with it.",
              },
              {
                type: "prose",
                text: "The problem ROS solves: a robot needs a camera driver, an object detector, a planner, a controller and a motor driver. Written as one program, changing the camera means touching code that talks to motors. Written as five programs that must communicate, you have to invent a communication system — and everyone was inventing a slightly different one.",
              },
              {
                type: "flow",
                title: "The ROS graph",
                nodes: [
                  { label: "/camera_driver", detail: "publishes → /image_raw" },
                  { label: "/object_detector", detail: "subscribes /image_raw, publishes → /detections", accent: true },
                  { label: "/planner", detail: "subscribes /detections, publishes → /cmd_vel" },
                  { label: "/base_controller", detail: "subscribes /cmd_vel, drives the motors" },
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "The decoupling is the whole point",
                text: "`/object_detector` does not know `/camera_driver` exists. It subscribes to a **topic**. Swap a USB camera for a simulated one, and provided it publishes the same message type on the same topic, nothing downstream changes. That single property is why ROS became the standard: it makes robot software composable.",
              },
              {
                type: "table",
                title: "The four communication patterns",
                columns: ["Pattern", "Shape", "Use it for", "Example"],
                rows: [
                  ["Topic", "Many-to-many, asynchronous", "Continuous streams", "Camera images, velocity commands"],
                  ["Service", "One-to-one, request/response", "Short calls needing an answer", "Reset odometry, query a parameter"],
                  ["Action", "Goal with feedback, cancellable", "Long tasks", "Navigate to a pose, plan a trajectory"],
                  ["Parameter", "Per-node configuration", "Values that change rarely", "Max speed, PID gains"],
                ],
              },
              {
                type: "callout",
                tone: "tip",
                title: "Choosing between them",
                text: "If it happens **continuously**, use a topic. If it is **quick and needs an answer**, use a service. If it **takes time and might need cancelling**, use an action. Beginners reach for services far too often, then discover their node is blocked for eight seconds while a robot drives across a room.",
              },
              {
                type: "heading",
                level: 2,
                text: "What changed in ROS 2",
              },
              {
                type: "table",
                title: "ROS 1 to ROS 2",
                columns: ["Aspect", "ROS 1", "ROS 2", "Why it matters"],
                rows: [
                  ["Discovery", "Central master", "DDS, decentralised", "No single point of failure"],
                  ["Transport", "Custom TCPROS", "DDS with QoS", "Configurable reliability; usable over lossy links"],
                  ["Real-time", "Not supported", "Designed for it", "Control loops can live in ROS"],
                  ["Multi-robot", "Awkward", "Native, via domains", "Fleets work without namespace gymnastics"],
                  ["Python", "Python 2 legacy", "Python 3", "Modern language support"],
                  ["Security", "None", "SROS 2", "Authentication and encryption available"],
                ],
              },
              {
                type: "callout",
                tone: "warning",
                title: "The first thing that will confuse you",
                text: "ROS 2 nodes discover each other automatically over the network, using multicast. On a shared lab network, **your nodes will find your colleague's nodes** and topics will carry data you did not expect. Set `ROS_DOMAIN_ID` to a number nobody else on the subnet is using. This costs an afternoon of confusion to everyone exactly once.",
              },
              {
                type: "code",
                language: "bash",
                title: "The commands you will use constantly",
                code: `ros2 node list                      # which nodes are running
ros2 topic list                     # which topics exist
ros2 topic echo /cmd_vel            # watch messages go past
ros2 topic hz /scan                 # is it publishing at the rate you expect?
ros2 topic info /scan --verbose     # publishers, subscribers, and QoS settings
ros2 interface show geometry_msgs/msg/Twist   # what fields does this message have?

ros2 run demo_nodes_cpp talker      # run one node from a package
ros2 launch my_robot bringup.py     # run a whole configured system

export ROS_DOMAIN_ID=42             # isolate yourself from the shared network`,
                annotations: [
                  { line: 4, text: "The single most useful debugging command. A topic that lists but shows 0 Hz is publishing nothing." },
                  { line: 5, text: "--verbose prints QoS. When a subscriber gets no data despite a live publisher, this is where the answer is." },
                ],
              },
              {
                type: "check",
                question:
                  "You want a node to command 'navigate to the kitchen', which takes 30 seconds and might need cancelling. Topic, service or action?",
                hint: "How long does it take, and do you need progress?",
                answer:
                  "An action. A service call would block the caller for 30 seconds with no progress reporting and no way to cancel. A topic gives no completion signal at all. Actions exist precisely for long-running goals — which is why Nav2's interface is an action.",
              },
              {
                type: "summary",
                points: [
                  "ROS is middleware and tooling, not an operating system",
                  "Nodes communicate through named topics without knowing about each other, which makes software composable",
                  "Topics for streams, services for quick answers, actions for long cancellable tasks",
                  "ROS 2 replaced the central master with DDS, adding QoS, real-time support and native multi-robot",
                  "Set ROS_DOMAIN_ID on any shared network or your nodes will find everyone else's",
                ],
              },
            ],
            quiz: {
              title: "What is ROS 2?",
              questions: [
                {
                  prompt: "A task takes 30 seconds and may need cancelling. Which ROS 2 pattern?",
                  explanation:
                    "An action: it provides goal submission, periodic feedback, a result, and cancellation.",
                  answers: [
                    { text: "An action", correct: true },
                    { text: "A service" },
                    { text: "A topic" },
                    { text: "A parameter" },
                  ],
                },
                {
                  prompt: "What replaced the ROS 1 master in ROS 2?",
                  explanation:
                    "DDS provides decentralised automatic discovery, removing the single point of failure.",
                  answers: [
                    { text: "DDS-based decentralised discovery", correct: true },
                    { text: "A cloud registry service" },
                    { text: "A configuration file listing all nodes" },
                    { text: "Nothing — ROS 2 still uses a master" },
                  ],
                },
              ],
            },
          },
          {
            slug: "topics-and-messages",
            title: "Your first publisher and subscriber",
            summary:
              "Two nodes, every line explained, plus the QoS mismatch that makes a correctly-written subscriber receive absolutely nothing.",
            estimatedMinutes: 18,
            keyTerms: ["ros-node", "ros-topic", "qos"],
            objectives: [
              "Write a ROS 2 publisher and subscriber in Python",
              "Explain every line of the boilerplate rather than copying it",
              "Diagnose a QoS incompatibility from the symptoms",
            ],
            blocks: [
              {
                type: "prose",
                text: "Here is a complete ROS 2 publisher. Every line is explained underneath — none of it is boilerplate you should accept on faith.",
              },
              {
                type: "code",
                language: "python",
                filename: "velocity_publisher.py",
                title: "A publisher",
                code: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist


class VelocityPublisher(Node):
    def __init__(self):
        super().__init__('velocity_publisher')

        self.publisher = self.create_publisher(Twist, 'cmd_vel', 10)

        self.timer = self.create_timer(0.1, self.publish_velocity)
        self.get_logger().info('Publishing to /cmd_vel at 10 Hz')

    def publish_velocity(self):
        msg = Twist()
        msg.linear.x = 0.2       # metres per second, forward
        msg.angular.z = 0.5      # radians per second, counter-clockwise
        self.publisher.publish(msg)


def main():
    rclpy.init()
    node = VelocityPublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()`,
                annotations: [
                  { line: 1, text: "rclpy is the ROS 2 Python client library — the binding to the underlying C implementation." },
                  { line: 2, text: "Node is the base class. Everything you write inherits from it." },
                  { line: 3, text: "Message types come from packages. geometry_msgs/Twist is the standard velocity command: three linear and three angular components." },
                  { line: 6, text: "Your node is a class. This is why Level 2 spent time on classes." },
                  { line: 8, text: "super().__init__ registers the node name with ROS. This is the name ros2 node list shows." },
                  { line: 10, text: "create_publisher(type, topic_name, queue_depth). The depth is how many messages buffer if a subscriber falls behind." },
                  { line: 12, text: "A timer calls the function every 0.1 s. Never use a while loop with sleep — the timer is driven by the executor and integrates with everything else." },
                  { line: 13, text: "get_logger() rather than print(): the output is timestamped, levelled, and visible to ros2 launch and rosbag." },
                  { line: 16, text: "Construct an empty message, then fill the fields you need. Unset fields default to zero." },
                  { line: 24, text: "rclpy.init() sets up the ROS context. Nothing works before it." },
                  { line: 26, text: "spin() blocks and processes callbacks — timers, subscriptions, services. Without it the timer never fires." },
                  { line: 30, text: "Clean shutdown. Skipping this can leave stale discovery entries that confuse later runs." },
                ],
              },
              {
                type: "code",
                language: "python",
                filename: "velocity_subscriber.py",
                title: "A subscriber",
                code: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist


class VelocityMonitor(Node):
    def __init__(self):
        super().__init__('velocity_monitor')

        self.subscription = self.create_subscription(
            Twist,
            'cmd_vel',
            self.on_velocity,
            10,
        )
        self.get_logger().info('Listening on /cmd_vel')

    def on_velocity(self, msg: Twist):
        speed = msg.linear.x
        turn = msg.angular.z

        if abs(speed) > 1.0:
            self.get_logger().warn(f'Commanded speed {speed:.2f} m/s exceeds limit')

        self.get_logger().info(f'v={speed:.2f} m/s  omega={turn:.2f} rad/s')


def main():
    rclpy.init()
    node = VelocityMonitor()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()`,
                annotations: [
                  { line: 10, text: "create_subscription(type, topic, callback, queue_depth). The four arguments mirror the publisher's three plus the callback." },
                  { line: 13, text: "The callback runs on every message. Keep it short — a slow callback blocks the executor and messages queue up behind it." },
                  { line: 18, text: "The message arrives as an argument. No polling, no manual receive." },
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "The message type is a contract",
                text: "Both nodes import `Twist`. That is not an import convenience — it is the interface agreement. Change the publisher to publish `TwistStamped` and the subscriber silently receives nothing, because they are now on different types even with the same topic name. `ros2 topic info /cmd_vel` shows the type actually in use.",
              },
              {
                type: "heading",
                level: 2,
                text: "The QoS mismatch that wastes everyone's first week",
              },
              {
                type: "prose",
                text: "In ROS 2, a publisher and a subscriber only connect if their **quality of service** profiles are compatible. Incompatible profiles do not raise an error. Nothing is logged at default verbosity. The topic lists correctly, `ros2 topic echo` may even work — and your subscriber receives absolutely nothing.",
              },
              {
                type: "table",
                title: "QoS policies that must match",
                columns: ["Policy", "Options", "Compatible when"],
                rows: [
                  ["Reliability", "RELIABLE / BEST_EFFORT", "Publisher is at least as strong as the subscriber requests"],
                  ["Durability", "VOLATILE / TRANSIENT_LOCAL", "Publisher is at least as strong as the subscriber requests"],
                  ["History", "KEEP_LAST(n) / KEEP_ALL", "Always compatible; affects buffering only"],
                  ["Deadline", "A duration", "Publisher's deadline must be no longer than the subscriber's"],
                ],
              },
              {
                type: "callout",
                tone: "mistake",
                title: "The classic case",
                text: "Sensor drivers commonly publish **BEST_EFFORT** — for a 30 Hz camera, dropping a frame beats delaying the stream. A subscriber written with the default profile requests **RELIABLE**. The publisher cannot promise reliability, so no connection is made and the subscriber sits silent. The fix is one line: request `qos_profile_sensor_data`.",
              },
              {
                type: "code",
                language: "python",
                title: "Matching a sensor publisher's QoS",
                code: `from rclpy.qos import qos_profile_sensor_data, QoSProfile, QoSReliabilityPolicy

# Option 1 — the standard sensor profile: best-effort, small queue
self.subscription = self.create_subscription(
    LaserScan, 'scan', self.on_scan, qos_profile_sensor_data)

# Option 2 — build it explicitly when you need something specific
sensor_qos = QoSProfile(
    depth=5,
    reliability=QoSReliabilityPolicy.BEST_EFFORT,
)
self.subscription = self.create_subscription(
    LaserScan, 'scan', self.on_scan, sensor_qos)`,
                annotations: [
                  { line: 5, text: "qos_profile_sensor_data is the convention for high-rate sensor streams. Use it and most mismatches disappear." },
                ],
              },
              {
                type: "steps",
                title: "Debugging a silent topic",
                steps: [
                  { title: "Is the publisher alive?", text: "ros2 node list — is the node even running?", code: "ros2 node list", language: "bash" },
                  { title: "Does the topic exist?", text: "ros2 topic list — a missing topic means the publisher never got created.", code: "ros2 topic list", language: "bash" },
                  { title: "Is anything actually flowing?", text: "0 Hz means the publisher exists but is not publishing. Check its timer.", code: "ros2 topic hz /cmd_vel", language: "bash" },
                  { title: "Do the types match?", text: "Compare the type both ends expect. A mismatch shows here.", code: "ros2 topic info /cmd_vel --verbose", language: "bash" },
                  { title: "Do the QoS profiles match?", text: "The same --verbose output lists each endpoint's QoS. This is where most silent failures resolve.", code: "ros2 topic info /cmd_vel --verbose", language: "bash" },
                  { title: "Same domain?", text: "Different ROS_DOMAIN_ID values mean the nodes cannot see each other at all.", code: "echo $ROS_DOMAIN_ID", language: "bash" },
                ],
              },
              {
                type: "challenge",
                title: "Build a safety filter node",
                text: "Write a node that subscribes to `/cmd_vel_raw` and republishes to `/cmd_vel`, clamping linear speed to ±0.5 m/s and angular to ±1.0 rad/s. Log a warning whenever it has to clamp. This is a real pattern — production robots put exactly this between a planner and a base controller.",
                hints: [
                  "One node can hold both a subscription and a publisher",
                  "Clamp with max(-limit, min(limit, value))",
                  "Log at warn level only when clamping actually happened, or the log becomes useless noise",
                ],
              },
              {
                type: "summary",
                points: [
                  "A ROS 2 node is a class inheriting from Node; publishers and subscribers are created in __init__",
                  "Timers drive periodic work — never a while loop with sleep",
                  "spin() processes callbacks; without it nothing happens",
                  "The message type is the contract, and a mismatch fails silently",
                  "Incompatible QoS produces a topic that exists and delivers nothing — check it with topic info --verbose",
                ],
              },
            ],
            quiz: {
              title: "Publishers and subscribers",
              questions: [
                {
                  prompt: "A subscriber receives nothing, but ros2 topic list shows the topic and the publisher is running. Most likely cause?",
                  explanation:
                    "Incompatible QoS. A BEST_EFFORT publisher cannot satisfy a RELIABLE subscriber, and ROS 2 reports this by silence rather than error.",
                  answers: [
                    { text: "Incompatible QoS profiles between publisher and subscriber", correct: true },
                    { text: "The subscriber needs a longer queue" },
                    { text: "spin() is not needed for subscribers" },
                    { text: "Topics only support one subscriber" },
                  ],
                },
                {
                  prompt: "Why use create_timer rather than a while loop with time.sleep?",
                  explanation:
                    "The timer is driven by the executor alongside callbacks. A blocking loop starves subscriptions and services in the same node.",
                  answers: [
                    { text: "The executor drives it alongside callbacks; a blocking loop starves them", correct: true },
                    { text: "time.sleep is not available in ROS 2" },
                    { text: "Timers are more accurate than sleep" },
                    { text: "While loops cannot publish messages" },
                  ],
                },
                {
                  prompt: "What does rclpy.spin(node) do?",
                  explanation:
                    "It blocks and processes the node's callbacks — timers, subscriptions and services — until shutdown.",
                  answers: [
                    { text: "Blocks and processes the node's callbacks until shutdown", correct: true },
                    { text: "Rotates the robot" },
                    { text: "Starts the ROS master" },
                    { text: "Publishes all queued messages once, then returns" },
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
    slug: "computer-vision-foundations",
    track: "computer-vision",
    title: "Computer Vision Foundations",
    subtitle: "Images as numbers, and pixels as positions",
    description:
      "From what an image actually is in memory, through colour spaces and thresholding, to the geometry that converts a detected pixel into a coordinate the robot can reach for.",
    difficulty: "ADVANCED",
    tags: ["vision", "OpenCV", "perception"],
    prerequisites: ["python-for-robotics", "coordinate-frames"],
    skills: ["computer-vision"],
    modules: [
      {
        slug: "images",
        title: "Images and detection",
        description: "What a camera gives you, and how to find something in it.",
        lessons: [
          {
            slug: "images-as-numbers",
            title: "Images are just numbers",
            summary:
              "An image is a 3D array of integers. Understanding that — and why HSV beats RGB for finding coloured objects — makes the rest of vision tractable.",
            estimatedMinutes: 14,
            keyTerms: ["camera-calibration", "depth-camera"],
            objectives: [
              "Describe an image's memory layout and index a pixel correctly",
              "Explain why HSV separates colour detection from lighting",
              "Convert a detected pixel into a direction in the camera frame",
            ],
            blocks: [
              {
                type: "prose",
                text: "A colour image is a 3D array: height × width × 3 channels, each value 0–255. A 1920×1080 frame is about 6.2 million numbers, arriving 30 times a second. Every vision algorithm is arithmetic on that array.",
              },
              {
                type: "code",
                language: "python",
                title: "Poking at an image",
                code: `import cv2
import numpy as np

image = cv2.imread('workpiece.jpg')
print(f"shape: {image.shape}")        # (height, width, channels)
print(f"dtype: {image.dtype}")        # uint8 — 0 to 255

# Row first, then column. This trips up everyone at least once.
pixel = image[100, 200]
print(f"pixel at row 100, col 200: {pixel}")   # OpenCV order is B, G, R

grey = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
print(f"greyscale shape: {grey.shape}")        # channels dimension is gone
print(f"mean brightness: {grey.mean():.1f}")`,
                annotations: [
                  { line: 9, text: "image[row, col] — y before x. Almost every other robotics API is (x, y). Mixing them up gives a transposed image and hours of confusion." },
                  { line: 10, text: "OpenCV stores BGR, not RGB, for historical reasons. Displaying an OpenCV array with a library expecting RGB swaps red and blue." },
                ],
                output: `shape: (1080, 1920, 3)
dtype: uint8
pixel at row 100, col 200: [ 43 122 201]
greyscale shape: (1080, 1920)
mean brightness: 118.4`,
              },
              {
                type: "callout",
                tone: "mistake",
                title: "Two conventions that will bite you",
                text: "**Row-major indexing**: `image[y, x]`, not `image[x, y]`. **BGR not RGB**: OpenCV's channel order is reversed from almost everything else. Both produce output that looks *almost* right, which is far worse than an obvious crash.",
              },
              {
                type: "heading",
                level: 2,
                text: "Why RGB is the wrong space for finding a red object",
              },
              {
                type: "prose",
                text: "A red object in bright light might be RGB (220, 30, 40). The same object in shade is (90, 12, 16). Those are wildly different numbers, so a threshold tuned in one lighting condition fails in the other. And lighting always changes.",
              },
              {
                type: "prose",
                text: "**HSV** separates the three things RGB tangles together: **hue** (which colour), **saturation** (how vivid), **value** (how bright). Under a lighting change, hue stays roughly constant while value moves — so threshold on hue and the detection survives.",
              },
              {
                type: "table",
                title: "The same red object, two conditions",
                columns: ["Condition", "RGB", "HSV", "Hue stable?"],
                rows: [
                  ["Bright light", "(220, 30, 40)", "(357°, 86%, 86%)", "—"],
                  ["Shade", "(90, 12, 16)", "(357°, 87%, 35%)", "Yes — only value changed"],
                  ["Warm tungsten", "(230, 60, 35)", "(8°, 85%, 90%)", "Mostly — a small hue shift"],
                ],
              },
              {
                type: "code",
                language: "python",
                filename: "detect_red.py",
                title: "Find a red object and report its centre",
                code: `import cv2
import numpy as np

def find_red_object(frame: np.ndarray) -> tuple[int, int, float] | None:
    """Return (cx, cy, area_px) of the largest red blob, or None."""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Red straddles the 0/180 wrap in OpenCV's hue scale, so two ranges.
    lower = cv2.inRange(hsv, np.array([0, 120, 70]), np.array([10, 255, 255]))
    upper = cv2.inRange(hsv, np.array([170, 120, 70]), np.array([180, 255, 255]))
    mask = cv2.bitwise_or(lower, upper)

    # Remove speckle, then close small holes.
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    largest = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest)
    if area < 500:                       # reject noise
        return None

    moments = cv2.moments(largest)
    cx = int(moments['m10'] / moments['m00'])
    cy = int(moments['m01'] / moments['m00'])
    return cx, cy, area`,
                annotations: [
                  { line: 9, text: "OpenCV scales hue to 0–179 to fit in a byte, so red wraps around the ends and needs two ranges." },
                  { line: 9, text: "The saturation floor of 120 rejects washed-out greys; the value floor of 70 rejects near-black pixels whose hue is meaningless." },
                  { line: 15, text: "OPEN erodes then dilates, removing isolated speckle. CLOSE does the reverse, filling small holes inside the blob." },
                  { line: 27, text: "Image moments give the centroid: m10/m00 and m01/m00 are the mean x and y of the region." },
                ],
              },
              {
                type: "heading",
                level: 2,
                text: "From pixel to direction",
              },
              {
                type: "prose",
                text: "You have a centroid at pixel (cx, cy). The robot needs a position in metres. A single camera cannot give you that — it gives you a **direction**, a ray from the camera through that pixel. Depth has to come from somewhere else: a depth camera, a second camera, or knowing the object's real size.",
              },
              {
                type: "math",
                title: "Pixel to ray, using the intrinsics",
                latex: "X_c = \\frac{(u - c_x)\\,Z}{f_x}, \\qquad Y_c = \\frac{(v - c_y)\\,Z}{f_y}",
                where: [
                  { symbol: "u, v", meaning: "pixel coordinates of the detection" },
                  { symbol: "c_x, c_y", meaning: "principal point — where the optical axis meets the sensor", unit: "px" },
                  { symbol: "f_x, f_y", meaning: "focal lengths from calibration", unit: "px" },
                  { symbol: "Z", meaning: "depth — which must come from elsewhere", unit: "m" },
                ],
                note: "With Z known, this gives a full 3D point in the camera frame. Transform it into base_link with TF2 and the arm can reach for it.",
              },
              {
                type: "flow",
                title: "The complete vision-to-motion pipeline",
                nodes: [
                  { label: "Camera frame — a 3D array of bytes" },
                  { label: "Colour segmentation → binary mask" },
                  { label: "Contours → largest blob → centroid pixel", accent: true },
                  { label: "Intrinsics + depth → 3D point in camera_link" },
                  { label: "TF2 transform → point in base_link" },
                  { label: "Inverse kinematics → joint angles" },
                  { label: "Trajectory → the arm moves" },
                ],
              },
              {
                type: "callout",
                tone: "warning",
                title: "Colour thresholding is fragile, and that is not a bug in your code",
                text: "It fails on shadows, reflections, a red object next to a pink one, and any lighting the thresholds were not tuned for. It is genuinely useful in a controlled cell with fixed lighting, and it is the right thing to learn first because the pipeline is identical. In an uncontrolled environment, replace the segmentation stage with a learned detector — Level 12 — and leave the rest of the pipeline alone.",
              },
              {
                type: "check",
                question:
                  "Your red-object detector works perfectly in the lab and fails at the customer's site. Their lighting is warm fluorescent. Why?",
                hint: "What did warm tungsten do to hue in the table above?",
                answer:
                  "Warm lighting shifts hue toward orange, pushing red objects outside the tuned hue band, and it also changes saturation. Fixes, in increasing order of robustness: re-tune on site, apply white balance before conversion, add a colour reference card in frame for automatic correction, or replace colour thresholding with a learned detector that was trained across lighting conditions.",
              },
              {
                type: "summary",
                points: [
                  "An image is an array of integers; index it [row, col] and expect BGR in OpenCV",
                  "HSV separates colour from brightness, so hue thresholds survive lighting changes that break RGB",
                  "Morphological open then close cleans a mask before contour extraction",
                  "A single camera gives direction, not position — depth must come from another source",
                  "Colour thresholding is fragile by nature; swap the segmentation stage for a learned detector and keep the pipeline",
                ],
              },
            ],
            quiz: {
              title: "Images and detection",
              questions: [
                {
                  prompt: "Why is HSV preferred over RGB for detecting a coloured object?",
                  explanation:
                    "HSV separates hue from brightness, so a lighting change moves value while hue stays roughly constant. In RGB all three channels shift together.",
                  answers: [
                    { text: "Hue stays roughly constant under lighting changes; RGB channels all shift", correct: true },
                    { text: "HSV images use less memory" },
                    { text: "OpenCV cannot threshold RGB" },
                    { text: "HSV has higher resolution" },
                  ],
                },
                {
                  prompt: "Why does red need two hue ranges in OpenCV?",
                  explanation:
                    "OpenCV scales hue to 0–179 to fit a byte, and red sits at the wrap point, so it appears at both ends of the range.",
                  answers: [
                    { text: "Red straddles the 0/179 wraparound in OpenCV's hue scale", correct: true },
                    { text: "Red is brighter than other colours" },
                    { text: "One range is for light red and one for dark red" },
                    { text: "It is a workaround for BGR ordering" },
                  ],
                },
                {
                  prompt: "What does a single camera give you about a detected object's location?",
                  explanation:
                    "A direction — a ray from the camera through the pixel. Depth requires a second view, a depth sensor, or known object size.",
                  answers: [
                    { text: "A direction only; depth must come from elsewhere", correct: true },
                    { text: "A full 3D position" },
                    { text: "Distance but not direction" },
                    { text: "Nothing usable without calibration" },
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
