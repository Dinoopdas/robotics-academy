import type { CourseSource } from "../schema";

export const programmingElectronicsCourses: CourseSource[] = [
  {
    slug: "python-for-robotics",
    track: "programming",
    title: "Python for Robotics",
    subtitle: "From your first variable to controlling a simulated robot",
    description:
      "Programming taught from zero, with every example doing something a robot would actually do. No prior coding experience assumed. By the end you write classes that model robot state and loops that run a control cycle — the exact shape of the ROS 2 code in Level 10.",
    difficulty: "BEGINNER",
    tags: ["python", "programming", "beginner"],
    prerequisites: ["intro-to-robotics"],
    skills: ["programming"],
    modules: [
      {
        slug: "foundations",
        title: "Language foundations",
        description: "Variables, control flow and functions — introduced through robot problems.",
        lessons: [
          {
            slug: "variables-and-types",
            title: "Variables and types",
            summary:
              "A variable is a labelled box holding a value. In robotics the label almost always needs a unit attached, and forgetting that has crashed spacecraft.",
            estimatedMinutes: 12,
            objectives: [
              "Create variables and choose appropriate types",
              "Explain why float and int behave differently in sensor maths",
              "Adopt a naming convention that encodes units",
            ],
            blocks: [
              {
                type: "prose",
                text: "A **variable** is a name attached to a value. That is genuinely all it is. The subtlety in robotics is not the mechanism — it is that almost every number you store is a physical quantity with a **unit**, and Python will not remind you which.",
              },
              {
                type: "code",
                language: "python",
                title: "Storing readings from a robot",
                code: `# A name on the left, a value on the right.
distance_m = 0.45          # metres to the nearest obstacle
battery_pct = 87           # percent remaining
robot_name = "Scout-1"     # text
is_moving = True           # yes or no

print(f"{robot_name}: obstacle at {distance_m} m, battery {battery_pct}%")`,
                annotations: [
                  { line: 2, text: "The _m suffix records the unit in the name. Python does not track units, so you must." },
                  { line: 3, text: "An integer — a whole number with no fractional part." },
                  { line: 4, text: "A string: text, always in quotes." },
                  { line: 5, text: "A boolean: exactly True or False, capitalised." },
                  { line: 7, text: "An f-string. The f prefix lets {expressions} be substituted into the text." },
                ],
                output: "Scout-1: obstacle at 0.45 m, battery 87%",
              },
              {
                type: "callout",
                tone: "mistake",
                title: "The unit bug that destroyed a Mars orbiter",
                text: "In 1999 NASA lost the Mars Climate Orbiter because one team supplied thrust data in pound-seconds while the receiving software expected newton-seconds. The numbers were valid; the units were not shared. **Put the unit in the variable name** — `distance_m`, `angle_deg`, `speed_mps` — and this entire class of bug becomes visible in code review.",
              },
              {
                type: "table",
                title: "The types you will use constantly",
                columns: ["Type", "Example", "Robotics use"],
                rows: [
                  ["int", "42", "Encoder counts, PWM duty values, indices"],
                  ["float", "0.45", "Distances, angles, voltages — anything measured"],
                  ["bool", "True", "Limit switch state, e-stop, enabled flags"],
                  ["str", '"base_link"', "Frame names, topic names, log messages"],
                  ["list", "[0.1, 0.4, 0.9]", "A LiDAR scan, a joint angle vector"],
                  ["dict", '{"kp": 2.0, "ki": 0.1}', "Named parameters, configuration"],
                ],
              },
              {
                type: "heading",
                level: 2,
                text: "Integers and floats behave differently, and it matters",
              },
              {
                type: "code",
                language: "python",
                title: "Integer division bites",
                code: `counts = 7
counts_per_rev = 2

# Integer division discards the remainder
revolutions_wrong = counts // counts_per_rev   # 3  — lost 0.5 of a turn
revolutions_right = counts / counts_per_rev    # 3.5

print(revolutions_wrong, revolutions_right)`,
                annotations: [
                  { line: 5, text: "// is floor division. Useful deliberately, disastrous accidentally." },
                  { line: 6, text: "/ always produces a float in Python 3, even for exact divisions." },
                ],
                output: "3 3.5",
              },
              {
                type: "callout",
                tone: "warning",
                title: "Floats are approximate",
                text: "`0.1 + 0.2` evaluates to `0.30000000000000004`. Binary floating point cannot represent 0.1 exactly, and the error is real. Never write `if angle == 90.0`. Write `if abs(angle - 90.0) < 0.001` — compare within a tolerance, always.",
              },
              {
                type: "interactive",
                widget: "python-playground",
                title: "Try it",
                instructions:
                  "Edit the variables and run. Try changing counts to 9 and see how the two division operators diverge.",
                config: {
                  initialCode: `counts = 7\ncounts_per_rev = 2\n\nprint("floor:", counts // counts_per_rev)\nprint("true: ", counts / counts_per_rev)\nprint("float check:", 0.1 + 0.2)`,
                },
              },
              {
                type: "check",
                question: "Why is `if sensor_reading == 0.3:` a bug waiting to happen?",
                hint: "What does 0.1 + 0.2 actually evaluate to?",
                answer:
                  "Because floats are binary approximations, a computed 0.3 may actually be 0.30000000000000004, and the comparison fails even though the value is right. Compare with a tolerance: `if abs(sensor_reading - 0.3) < 1e-6`.",
              },
              {
                type: "summary",
                points: [
                  "A variable is a name bound to a value; Python infers the type",
                  "Put units in variable names — the language will not track them for you",
                  "`/` gives a float, `//` discards the remainder; mixing them up silently loses data",
                  "Never test floats for exact equality; always compare within a tolerance",
                ],
              },
            ],
            quiz: {
              title: "Variables and types",
              questions: [
                {
                  prompt: "Why should a variable holding a distance be named `distance_m` rather than `distance`?",
                  explanation:
                    "Python does not track units. Encoding the unit in the name makes mismatches visible at the point of use and in review.",
                  answers: [
                    { text: "Python does not track units, so the name has to carry them", correct: true },
                    { text: "Python requires a type suffix" },
                    { text: "It makes the program run faster" },
                    { text: "Underscores are required in variable names" },
                  ],
                },
                {
                  prompt: "What does `7 // 2` evaluate to in Python 3?",
                  explanation: "// is floor division, discarding the remainder, so the result is 3.",
                  answers: [
                    { text: "3", correct: true },
                    { text: "3.5" },
                    { text: "4" },
                    { text: "3.0" },
                  ],
                },
              ],
            },
          },
          {
            slug: "control-flow",
            title: "Conditions and loops",
            summary:
              "Decisions and repetition. Together they are already enough to write an obstacle-avoiding robot.",
            estimatedMinutes: 13,
            objectives: [
              "Write if/elif/else chains that read cleanly",
              "Choose between for and while for a given robot task",
              "Write a control loop with a clean exit condition",
            ],
            blocks: [
              {
                type: "prose",
                text: "Every robot behaviour is decisions plus repetition. A robot that stops when something is close is one condition. A robot that keeps checking is one loop. Put them together and you have a working machine.",
              },
              {
                type: "code",
                language: "python",
                title: "Decide what to do about an obstacle",
                code: `distance_m = 0.35

if distance_m < 0.2:
    action = "STOP"
elif distance_m < 0.5:
    action = "SLOW"
else:
    action = "CRUISE"

print(f"{distance_m} m -> {action}")`,
                annotations: [
                  { line: 3, text: "Checked first. Order matters: the most urgent case goes at the top." },
                  { line: 5, text: "elif is only evaluated if every condition above it was False." },
                  { line: 7, text: "else catches everything remaining. Always have one — an unhandled case is a robot doing nothing." },
                ],
                output: "0.35 m -> SLOW",
              },
              {
                type: "callout",
                tone: "insight",
                title: "Order is a safety property",
                text: "Reverse those branches — test `< 0.5` first — and the STOP case becomes unreachable, because 0.15 m also satisfies `< 0.5`. The robot would slow when it needed to stop. In safety-relevant logic, **the most restrictive condition goes first**.",
              },
              {
                type: "heading",
                level: 2,
                text: "for when you know how many, while when you do not",
              },
              {
                type: "code",
                language: "python",
                title: "Both loop types on real data",
                code: `# for: a known collection — one LiDAR scan
scan_m = [1.2, 0.8, 0.4, 0.3, 0.9, 1.5]

closest = min(scan_m)
closest_index = scan_m.index(closest)
print(f"Closest: {closest} m at beam {closest_index}")

for index, reading in enumerate(scan_m):
    if reading < 0.5:
        print(f"  beam {index}: obstacle at {reading} m")

# while: repeat until a condition changes
battery_pct = 100
while battery_pct > 20:
    battery_pct -= 15
    print(f"  patrolling, battery {battery_pct}%")
print("Returning to dock")`,
                annotations: [
                  { line: 9, text: "enumerate gives index and value together — cleaner than tracking a counter by hand." },
                  { line: 15, text: "The condition is checked before each pass. If it starts False the body never runs." },
                  { line: 16, text: "Something inside must change the condition, or the loop never ends." },
                ],
                output: `Closest: 0.3 m at beam 3
  beam 2: obstacle at 0.4 m
  beam 3: obstacle at 0.3 m
  patrolling, battery 85%
  patrolling, battery 70%
  patrolling, battery 55%
  patrolling, battery 40%
  patrolling, battery 25%
  patrolling, battery 10%
Returning to dock`,
              },
              {
                type: "callout",
                tone: "mistake",
                title: "The infinite loop that locks up a robot",
                text: "If nothing inside a `while` changes the condition, the loop never exits — and on a robot that means the control cycle stops running while the motors keep their last command. The robot drives into the wall at full speed with a completely unresponsive controller. Every `while` needs a guaranteed exit: the condition changing, a timeout, or a `break`.",
              },
              {
                type: "heading",
                level: 2,
                text: "The shape of every robot program",
              },
              {
                type: "code",
                language: "python",
                title: "A control loop",
                code: `import time

TARGET_DISTANCE_M = 0.30
MAX_ITERATIONS = 500
distance_m = 1.20

for step in range(MAX_ITERATIONS):
    error_m = distance_m - TARGET_DISTANCE_M

    if abs(error_m) < 0.01:
        print(f"Arrived after {step} steps")
        break

    speed_mps = 0.8 * error_m              # proportional control
    speed_mps = max(-0.5, min(0.5, speed_mps))   # clamp to safe limits

    distance_m -= speed_mps * 0.1          # simulate 0.1 s of motion
    time.sleep(0.01)
else:
    print("Gave up — never reached the target")`,
                annotations: [
                  { line: 8, text: "Error: how far from where we want to be. Every controller starts here." },
                  { line: 12, text: "break leaves the loop immediately." },
                  { line: 14, text: "Output proportional to error. This is the P of PID, in one line." },
                  { line: 15, text: "Clamping is not optional — an unclamped controller commands speeds the hardware cannot deliver." },
                  { line: 19, text: "A for/else: the else runs only if the loop finished without break. Perfect for timeouts." },
                ],
                output: "Arrived after 41 steps",
              },
              {
                type: "interactive",
                widget: "python-playground",
                title: "Tune the gain",
                instructions:
                  "Change 0.8 to 3.0 and run. Then try 0.05. One overshoots and oscillates, the other crawls. You have just discovered the central problem of Level 7.",
                config: {
                  initialCode: `TARGET = 0.30\ndistance = 1.20\nGAIN = 0.8\n\nfor step in range(60):\n    error = distance - TARGET\n    if abs(error) < 0.01:\n        print(f"Arrived after {step} steps")\n        break\n    speed = GAIN * error\n    speed = max(-0.5, min(0.5, speed))\n    distance -= speed * 0.1\n    print(f"step {step:2d}  distance {distance:.3f}")\nelse:\n    print("Never converged")`,
                },
              },
              {
                type: "check",
                question:
                  "A robot processes a LiDAR scan of 360 readings, then repeats forever. Which loop for which part?",
                hint: "One quantity is known in advance; the other is not.",
                answer:
                  "A `for` loop over the 360 readings — the count is known. A `while` loop for the outer cycle, since it runs until shutdown. Nesting a known-length `for` inside an indefinite `while` is the standard shape of robot software.",
              },
              {
                type: "summary",
                points: [
                  "Order if/elif branches most-restrictive first; it is a safety property, not style",
                  "for iterates a known collection; while repeats until a condition changes",
                  "Every while needs a guaranteed exit or the robot freezes with motors still commanded",
                  "Clamp controller outputs to what the hardware can actually do",
                ],
              },
            ],
            quiz: {
              title: "Control flow",
              questions: [
                {
                  prompt: "Why must the most restrictive condition come first in an if/elif chain?",
                  explanation:
                    "elif branches are only evaluated when everything above them is False, so a broader condition placed first shadows the narrower one entirely.",
                  answers: [
                    { text: "A broader condition placed first makes the narrower branch unreachable", correct: true },
                    { text: "Python evaluates conditions in random order" },
                    { text: "It runs faster that way" },
                    { text: "elif cannot appear after else" },
                  ],
                },
                {
                  prompt: "What makes an infinite while loop dangerous on a robot specifically?",
                  explanation:
                    "The control loop stops updating but the motors retain their last command, so the robot keeps moving with an unresponsive controller.",
                  answers: [
                    { text: "The controller stops updating while motors hold their last command", correct: true },
                    { text: "It uses too much memory" },
                    { text: "Python raises an error after 1000 iterations" },
                    { text: "It only affects simulation" },
                  ],
                },
              ],
            },
          },
          {
            slug: "functions-and-classes",
            title: "Functions and classes",
            summary:
              "Package behaviour into functions, then bundle state with behaviour into classes — which is exactly how every ROS 2 node is written.",
            estimatedMinutes: 14,
            objectives: [
              "Write functions with clear parameters and return values",
              "Explain why a class is the right tool for something with persistent state",
              "Write a class that mirrors the structure of a ROS 2 node",
            ],
            blocks: [
              {
                type: "prose",
                text: "A **function** is a named piece of behaviour you can reuse. A **class** is behaviour bundled with the data it operates on. Robotics reaches for classes constantly, because controllers and sensors have **state** — they remember things between calls.",
              },
              {
                type: "code",
                language: "python",
                title: "Functions",
                code: `import math

def wheel_speeds(linear_mps: float, angular_rps: float, track_m: float) -> tuple[float, float]:
    """Convert a robot velocity command into left and right wheel speeds."""
    left = linear_mps - (angular_rps * track_m / 2.0)
    right = linear_mps + (angular_rps * track_m / 2.0)
    return left, right


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


left, right = wheel_speeds(0.5, 1.0, 0.30)
print(f"left {left:.3f} m/s   right {right:.3f} m/s")
print(f"clamped: {clamp(2.7, -1.0, 1.0)}")`,
                annotations: [
                  { line: 3, text: "Type hints. Python does not enforce them, but they document intent and let editors catch mistakes." },
                  { line: 4, text: "A docstring: what this function does, for whoever reads it next." },
                  { line: 7, text: "Returning a tuple gives back two values at once." },
                  { line: 15, text: "Tuple unpacking assigns both returned values in one statement." },
                ],
                output: `left 0.350 m/s   right 0.650 m/s
clamped: 1.0`,
              },
              {
                type: "callout",
                tone: "insight",
                title: "That first function is the differential drive model",
                text: "Those two lines are the complete inverse kinematics of a differential-drive robot. You will meet them again in Level 8 with a derivation, and again in Level 10 inside a ROS 2 node. Robotics reuses a small number of ideas relentlessly.",
              },
              {
                type: "heading",
                level: 2,
                text: "When a function is not enough",
              },
              {
                type: "prose",
                text: "A PID controller must remember the accumulated error and the previous error to compute its next output. A plain function forgets everything the moment it returns. You could pass the state in and out on every call, and it would be miserable. A class holds it.",
              },
              {
                type: "code",
                language: "python",
                filename: "pid.py",
                title: "A class with state",
                code: `class PIDController:
    """Position controller for one joint or one axis."""

    def __init__(self, kp: float, ki: float, kd: float, output_limit: float = 1.0):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.output_limit = output_limit
        self._integral = 0.0
        self._previous_error = 0.0

    def reset(self) -> None:
        self._integral = 0.0
        self._previous_error = 0.0

    def update(self, setpoint: float, measurement: float, dt: float) -> float:
        error = setpoint - measurement

        proportional = self.kp * error
        self._integral += error * dt
        derivative = (error - self._previous_error) / dt if dt > 0 else 0.0

        output = proportional + self.ki * self._integral + self.kd * derivative

        # Anti-windup: if we are saturated, stop accumulating.
        if abs(output) > self.output_limit:
            output = max(-self.output_limit, min(self.output_limit, output))
            self._integral -= error * dt

        self._previous_error = error
        return output


controller = PIDController(kp=2.0, ki=0.5, kd=0.1)
position = 0.0
for _ in range(5):
    command = controller.update(setpoint=1.0, measurement=position, dt=0.1)
    position += command * 0.1
    print(f"position {position:.4f}   command {command:.4f}")`,
                annotations: [
                  { line: 4, text: "__init__ runs when the object is created. It sets up initial state." },
                  { line: 5, text: "self refers to this particular object. Two controllers each keep their own gains." },
                  { line: 9, text: "A leading underscore signals internal state — not for callers to touch." },
                  { line: 21, text: "Guarding against dt == 0 avoids a division-by-zero crash mid-control-loop." },
                  { line: 26, text: "Integral wind-up: without this the integral grows while the output is already maxed, and the robot badly overshoots later. Level 7 covers it fully." },
                ],
                output: `position 0.0200   command 0.2000
position 0.0592   command 0.3920
position 0.1149   command 0.5568
position 0.1845   command 0.6961
position 0.2657   command 0.8118`,
              },
              {
                type: "callout",
                tone: "tip",
                title: "This is the shape of a ROS 2 node",
                text: "A ROS 2 node is a class: `__init__` creates publishers and subscribers, methods handle incoming messages, and instance attributes hold the state between messages. Reading the code above carefully means Level 10 will feel familiar rather than foreign.",
              },
              {
                type: "flow",
                title: "Function or class?",
                nodes: [
                  { label: "Does it need to remember anything between calls?" },
                  { label: "No → a function is correct. Keep it simple." },
                  { label: "Yes → a class. The state lives in self.", accent: true },
                ],
              },
              {
                type: "check",
                question:
                  "You need a helper that converts degrees to radians, and a moving-average filter over the last ten sensor readings. Which is which?",
                hint: "Which one needs to remember the previous readings?",
                answer:
                  "Degrees-to-radians is a pure function: same input, same output, nothing remembered. The moving average must hold the last ten readings between calls, so it is a class with a list in `self`.",
              },
              {
                type: "challenge",
                title: "Build a sensor smoother",
                text: "Write a `MovingAverage` class with a configurable window size and an `update(reading)` method returning the current average. It must handle the first few calls, before the window is full, without crashing or returning a wrong average.",
                challengeSlug: "moving-average-filter",
                hints: [
                  "Store readings in a list on self",
                  "After appending, drop the oldest if the list is longer than the window",
                  "Average over however many readings you actually have, not the nominal window size",
                ],
              },
              {
                type: "summary",
                points: [
                  "Functions package reusable behaviour; type hints and docstrings are for the next reader",
                  "Classes bundle state with behaviour — the right tool whenever something must remember",
                  "PID controllers, filters and sensor drivers all need state, so they are all classes",
                  "A ROS 2 node is exactly this pattern: state in __init__, behaviour in methods",
                ],
              },
            ],
            quiz: {
              title: "Functions and classes",
              questions: [
                {
                  prompt: "Why is a PID controller written as a class rather than a function?",
                  explanation:
                    "It must retain the accumulated integral and the previous error between calls. A function forgets everything on return.",
                  answers: [
                    { text: "It has to remember integral and previous error between calls", correct: true },
                    { text: "Classes run faster than functions" },
                    { text: "Functions cannot take more than three arguments" },
                    { text: "Only classes can do arithmetic" },
                  ],
                },
                {
                  prompt: "What does `self` refer to inside a method?",
                  explanation:
                    "The particular object the method was called on, which is how two controllers keep separate gains and separate state.",
                  answers: [
                    { text: "The specific object instance the method was called on", correct: true },
                    { text: "The class itself, shared by all instances" },
                    { text: "The Python interpreter" },
                    { text: "The calling function" },
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
    slug: "electronics-foundations",
    track: "electronics",
    title: "Electronics Foundations",
    subtitle: "Ohm's law to motor drivers, with nothing hand-waved",
    description:
      "Electronics for people who need to make motors turn without releasing the magic smoke. Voltage, current and resistance built from intuition to calculation, then digital and analog signals, PWM, and the driver circuits that stand between a microcontroller pin and a real motor.",
    difficulty: "BEGINNER",
    tags: ["electronics", "hardware", "beginner"],
    prerequisites: ["intro-to-robotics"],
    skills: ["electronics"],
    modules: [
      {
        slug: "the-basics",
        title: "Voltage, current, resistance",
        description: "The three quantities everything else is built from.",
        lessons: [
          {
            slug: "ohms-law",
            title: "Ohm's law",
            summary:
              "Three quantities, one equation, and the calculation that decides whether your LED lives or dies.",
            estimatedMinutes: 12,
            keyTerms: ["motor-driver"],
            objectives: [
              "Define voltage, current and resistance with a working physical intuition",
              "Apply Ohm's law to size a resistor correctly",
              "Explain why current is drawn by the load rather than pushed by the supply",
            ],
            blocks: [
              {
                type: "prose",
                text: "Three quantities underpin every circuit you will ever build. The water analogy is imperfect but it gets you a long way, and every experienced engineer still reaches for it.",
              },
              {
                type: "table",
                title: "The three quantities",
                columns: ["Quantity", "Symbol", "Unit", "Water analogy", "What it means"],
                rows: [
                  ["Voltage", "V", "volts (V)", "Water pressure", "The push available to move charge"],
                  ["Current", "I", "amps (A)", "Flow rate", "How much charge is actually moving"],
                  ["Resistance", "R", "ohms (Ω)", "Pipe narrowness", "How much the path opposes flow"],
                ],
              },
              {
                type: "math",
                title: "Ohm's law",
                latex: "V = I \\times R \\qquad\\Longleftrightarrow\\qquad I = \\frac{V}{R} \\qquad\\Longleftrightarrow\\qquad R = \\frac{V}{I}",
                where: [
                  { symbol: "V", meaning: "voltage across the component", unit: "V" },
                  { symbol: "I", meaning: "current through it", unit: "A" },
                  { symbol: "R", meaning: "its resistance", unit: "Ω" },
                ],
                note: "Know any two and the third follows. Nearly every basic circuit problem is an application of this.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "The idea that fixes most beginner confusion",
                text: "**A supply does not push current into a load. The load draws current from the supply.** A 5 V, 3 A supply connected to something that only wants 0.1 A delivers 0.1 A, not 3 A. The 3 A is a *limit*, not a *quantity delivered*. This one sentence resolves most of the confusion around power supply sizing.",
              },
              {
                type: "heading",
                level: 2,
                text: "The calculation you will do a hundred times",
              },
              {
                type: "example",
                title: "Sizing an LED resistor",
                scenario:
                  "A red LED on a 5 V supply. The datasheet says forward voltage 2.0 V, forward current 20 mA.",
                steps: [
                  "The LED drops 2.0 V, so the resistor must drop the rest: 5.0 − 2.0 = 3.0 V",
                  "The same current flows through both, since they are in series: 20 mA = 0.020 A",
                  "R = V / I = 3.0 / 0.020 = 150 Ω",
                  "Check the power: P = V × I = 3.0 × 0.020 = 0.06 W, so a standard 0.25 W resistor is fine",
                  "150 Ω is a standard value, so use it directly",
                ],
                result:
                  "A 150 Ω resistor. Without it, the LED sees the full 5 V, current is limited only by its own tiny internal resistance, and it fails within seconds.",
              },
              {
                type: "interactive",
                widget: "ohms-law",
                title: "Ohm's law calculator",
                instructions:
                  "Enter any two values to solve for the third. The LED preset shows the resistor calculation above; try changing the supply to 12 V and watch the required resistance rise.",
              },
              {
                type: "heading",
                level: 2,
                text: "Power — the quantity that decides what melts",
              },
              {
                type: "math",
                title: "Electrical power",
                latex: "P = V \\times I = I^{2}R = \\frac{V^{2}}{R}",
                where: [
                  { symbol: "P", meaning: "power dissipated, mostly as heat", unit: "W" },
                ],
                note: "The I²R form is the important one: doubling the current quadruples the heat. This is why undersized wire to a motor gets hot so suddenly rather than gradually.",
              },
              {
                type: "callout",
                tone: "warning",
                title: "Stall current is the number that matters",
                text: "A motor's running current is not what sizes your driver. When a robot drives into a wall, the motor **stalls**: it stops turning, generates no back-EMF, and draws its maximum current — often 5 to 10 times the running figure. A driver sized for running current dies in that moment. **Always size for stall.**",
              },
              {
                type: "check",
                question:
                  "A motor runs at 0.8 A and stalls at 6 A. You have a 2 A driver. Will it work?",
                hint: "What happens the first time the robot hits something?",
                answer:
                  "It will work perfectly until the first stall, and then fail. Normal running at 0.8 A is comfortably within 2 A. The moment the wheel jams, the motor demands 6 A and the driver is destroyed. You need a driver rated above 6 A, or current limiting that intervenes before damage.",
              },
              {
                type: "summary",
                points: [
                  "Voltage pushes, current flows, resistance opposes — V = I × R links all three",
                  "Loads draw current; supplies impose a limit, they do not force a quantity",
                  "Series components share current; the voltage divides between them",
                  "Power goes as I², so heat rises much faster than current",
                  "Size motor drivers for stall current, never for running current",
                ],
              },
            ],
            quiz: {
              title: "Ohm's law",
              questions: [
                {
                  prompt: "A 2.0 V LED at 20 mA runs from 5 V. What series resistor is needed?",
                  explanation: "The resistor drops 5 − 2 = 3 V at 0.02 A, so R = 3 / 0.02 = 150 Ω.",
                  answers: [
                    { text: "150 Ω", correct: true },
                    { text: "250 Ω" },
                    { text: "100 Ω" },
                    { text: "350 Ω" },
                  ],
                },
                {
                  prompt: "A 5 V 3 A supply feeds a circuit that draws 0.2 A. How much current flows?",
                  explanation:
                    "0.2 A. The 3 A figure is the supply's limit, not the amount it forces into the load.",
                  answers: [
                    { text: "0.2 A", correct: true },
                    { text: "3 A" },
                    { text: "1.5 A" },
                    { text: "The circuit is damaged by excess current" },
                  ],
                },
                {
                  prompt: "Why must a motor driver be sized for stall current?",
                  explanation:
                    "A stalled motor produces no back-EMF, so current is limited only by winding resistance — commonly 5–10× running current.",
                  answers: [
                    { text: "A stalled motor draws far more current than a running one", correct: true },
                    { text: "Motors always draw stall current at startup and never afterwards" },
                    { text: "Stall current is lower, so it is the safe design point" },
                    { text: "Drivers are rated in volts, not amps" },
                  ],
                },
              ],
            },
          },
          {
            slug: "pwm",
            title: "PWM — controlling power by switching",
            summary:
              "How a microcontroller that can only output on or off manages to run a motor at 37% speed.",
            estimatedMinutes: 12,
            keyTerms: ["pwm", "gpio", "motor-driver"],
            objectives: [
              "Explain duty cycle and compute average voltage from it",
              "Justify switching over linear control on efficiency grounds",
              "Choose a PWM frequency and state what each extreme costs",
            ],
            blocks: [
              {
                type: "prose",
                text: "A GPIO pin has exactly two states: on and off. Yet robots run motors at any speed you like. The trick is **switching fast** — so fast that the motor's own inertia averages it out.",
              },
              {
                type: "math",
                title: "Duty cycle sets the average",
                latex: "D = \\frac{t_{\\text{on}}}{t_{\\text{on}} + t_{\\text{off}}}, \\qquad V_{\\text{avg}} = D \\times V_{\\text{supply}}",
                where: [
                  { symbol: "D", meaning: "duty cycle, 0 to 1 (or 0–100%)" },
                  { symbol: "t_{\\text{on}}", meaning: "time the signal is high each cycle", unit: "s" },
                  { symbol: "V_{\\text{avg}}", meaning: "effective average voltage seen by the load", unit: "V" },
                ],
                note: "At 12 V supply and 37% duty, the motor behaves as though driven at 4.44 V.",
              },
              {
                type: "interactive",
                widget: "pwm-visualiser",
                title: "See the waveform and its average",
                instructions:
                  "Drag the duty cycle and watch the square wave and the average line. Then lower the frequency until the motor speed trace starts rippling — that is the point where inertia can no longer smooth it.",
              },
              {
                type: "heading",
                level: 2,
                text: "Why not just use a lower voltage?",
              },
              {
                type: "compare",
                title: "Linear regulation vs switching",
                columns: [
                  {
                    heading: "Linear — drop the extra voltage",
                    tone: "negative",
                    points: [
                      "A pass transistor absorbs the difference",
                      "12 V supply, 4 V motor, 2 A → 16 W burned as heat",
                      "Needs a large heatsink",
                      "Efficiency roughly 33% in this case",
                    ],
                  },
                  {
                    heading: "Switching (PWM)",
                    tone: "positive",
                    points: [
                      "The transistor is either fully on or fully off",
                      "Fully on: near-zero voltage across it, so near-zero loss",
                      "Fully off: no current, so no loss",
                      "Efficiency typically above 90%",
                    ],
                  },
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "Why switching wins",
                text: "Power dissipated in the switch is V × I *across the switch*. Fully on, V is nearly zero. Fully off, I is zero. Either way the product is tiny. A linear regulator sits deliberately in the middle, where both are large — which is precisely where heat is generated. This principle runs everything from motor drivers to laptop chargers.",
              },
              {
                type: "heading",
                level: 2,
                text: "Choosing the frequency",
              },
              {
                type: "table",
                title: "The frequency trade-off",
                columns: ["Frequency", "Behaviour", "Verdict"],
                rows: [
                  ["50–500 Hz", "Audible whine; visible torque ripple", "Fine for servos, poor for DC motors"],
                  ["1–5 kHz", "Still audible; efficient switching", "Common on cheap drivers"],
                  ["16–25 kHz", "Above most people's hearing; smooth", "The usual sweet spot for DC motors"],
                  ["Above 50 kHz", "Silent, but switching losses climb", "Needs fast MOSFETs and careful layout"],
                ],
              },
              {
                type: "callout",
                tone: "mistake",
                title: "PWM is not a servo signal",
                text: "Hobby servos take a pulse that looks like PWM but is not. The information is in the **pulse width** — 1.0 ms to 2.0 ms — repeated every 20 ms, and the duty cycle is irrelevant. Feeding a servo a 50% duty cycle at 1 kHz does not produce a mid position; it produces confused twitching or nothing at all.",
              },
              {
                type: "code",
                language: "python",
                title: "PWM on a Raspberry Pi",
                code: `import RPi.GPIO as GPIO
import time

MOTOR_PIN = 18
FREQUENCY_HZ = 20000        # 20 kHz — above hearing

GPIO.setmode(GPIO.BCM)
GPIO.setup(MOTOR_PIN, GPIO.OUT)

pwm = GPIO.PWM(MOTOR_PIN, FREQUENCY_HZ)
pwm.start(0)

try:
    for duty in range(0, 101, 10):
        pwm.ChangeDutyCycle(duty)
        print(f"duty {duty}%  ->  {duty / 100 * 12:.2f} V average at 12 V supply")
        time.sleep(0.5)
finally:
    pwm.stop()
    GPIO.cleanup()`,
                annotations: [
                  { line: 10, text: "The hardware timer generates the waveform; the CPU is not involved per-cycle." },
                  { line: 15, text: "Duty cycle here is 0–100 as a percentage." },
                  { line: 18, text: "finally guarantees cleanup even if the program crashes — otherwise the pin keeps driving the motor after your code has stopped." },
                ],
              },
              {
                type: "check",
                question:
                  "A robot's motors whine audibly at low speed. What would you change, and what does it cost?",
                hint: "What frequency range can people hear?",
                answer:
                  "Raise the PWM frequency above about 20 kHz, past the top of human hearing. The cost is higher switching losses — the transistor spends more of its time transitioning between states, where dissipation is highest — so the driver runs slightly warmer and may need better MOSFETs.",
              },
              {
                type: "summary",
                points: [
                  "PWM sets average power by varying the fraction of time a switch is on",
                  "V_avg = duty cycle × supply voltage",
                  "Switching beats linear regulation because a fully-on or fully-off switch dissipates almost nothing",
                  "16–25 kHz is the usual choice: silent, without excessive switching loss",
                  "Servo control signals encode information in pulse width, not duty cycle — different thing entirely",
                ],
              },
            ],
            quiz: {
              title: "PWM",
              questions: [
                {
                  prompt: "A 12 V supply with 25% duty cycle gives what average voltage?",
                  explanation: "V_avg = D × V_supply = 0.25 × 12 = 3 V.",
                  answers: [
                    { text: "3 V", correct: true },
                    { text: "4 V" },
                    { text: "9 V" },
                    { text: "12 V" },
                  ],
                },
                {
                  prompt: "Why is PWM far more efficient than a linear regulator?",
                  explanation:
                    "Dissipation is voltage across the switch times current through it. Fully on, voltage is near zero; fully off, current is zero. Either way the product is tiny.",
                  answers: [
                    { text: "A fully-on or fully-off switch has near-zero voltage or near-zero current", correct: true },
                    { text: "PWM uses less current overall" },
                    { text: "PWM raises the supply voltage" },
                    { text: "Linear regulators cannot drive motors" },
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
