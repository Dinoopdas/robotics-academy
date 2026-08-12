import type {
  ChallengeSource,
  SimulationSource,
  TroubleshootingSource,
} from "./schema";

export const challenges: ChallengeSource[] = [
  {
    slug: "moving-average-filter",
    title: "Smooth a noisy sensor",
    difficulty: "BEGINNER",
    category: "programming",
    language: "python",
    prompt:
      "Write a `MovingAverage` class that smooths a noisy sensor stream. The constructor takes a window size. `update(reading)` adds a reading and returns the average of the readings currently held. Before the window is full, average over however many readings have actually arrived — never pad with zeros, which would drag the early output toward zero and make the robot react to a value it never measured.",
    inputSpec: "A sequence of float readings, passed one at a time to update().",
    outputSpec: "The float mean of the most recent min(window, count) readings.",
    starterCode: `class MovingAverage:
    def __init__(self, window: int):
        # Store the window size and prepare somewhere to keep readings.
        ...

    def update(self, reading: float) -> float:
        # Append, drop the oldest if over the window, return the mean.
        ...
`,
    solution: `class MovingAverage:
    def __init__(self, window: int):
        if window < 1:
            raise ValueError("window must be at least 1")
        self.window = window
        self._readings: list[float] = []

    def update(self, reading: float) -> float:
        self._readings.append(reading)
        if len(self._readings) > self.window:
            self._readings.pop(0)
        return sum(self._readings) / len(self._readings)
`,
    explanation:
      "Dividing by len(self._readings) rather than by self.window is the whole exercise. With a window of 5 and one reading of 10.0, dividing by the window gives 2.0 — a value the sensor never reported and a number a controller would act on. Dividing by the actual count gives 10.0, which is the only honest answer available from one sample. Note also that list.pop(0) is O(n); collections.deque(maxlen=window) does the same thing in O(1) and is what production code uses.",
    hints: [
      "Keep the readings in a list on the instance so they persist between calls",
      "After appending, drop index 0 if the list has grown past the window",
      "Divide by len(readings), not by the window size",
    ],
    testCases: [
      { input: "window=3, readings=[10.0]", expected: "10.0", explanation: "One reading averages to itself" },
      { input: "window=3, readings=[10.0, 20.0]", expected: "15.0", explanation: "Two readings, divide by two" },
      { input: "window=3, readings=[10.0, 20.0, 30.0]", expected: "20.0", explanation: "Window now full" },
      { input: "window=3, readings=[10.0, 20.0, 30.0, 40.0]", expected: "30.0", explanation: "Oldest dropped: mean of 20, 30, 40" },
    ],
  },
  {
    slug: "differential-drive-kinematics",
    title: "Wheel speeds from a velocity command",
    difficulty: "BEGINNER",
    category: "kinematics",
    language: "python",
    prompt:
      "Implement the inverse kinematics of a differential-drive robot. Given a desired forward speed v (m/s), turn rate omega (rad/s) and track width L (m), return the left and right wheel ground speeds in m/s.",
    inputSpec: "v: float, omega: float, track_width: float",
    outputSpec: "A tuple (v_left, v_right) of wheel ground speeds in m/s.",
    starterCode: `def wheel_speeds(v: float, omega: float, track_width: float) -> tuple[float, float]:
    ...
`,
    solution: `def wheel_speeds(v: float, omega: float, track_width: float) -> tuple[float, float]:
    half = omega * track_width / 2.0
    return v - half, v + half
`,
    explanation:
      "The forward speed is shared by both wheels; the turn rate is produced by their difference. Adding half the differential to the right and subtracting it from the left gives a mean of exactly v — so the commanded forward speed is preserved regardless of turn rate. Positive omega is counter-clockwise by the right-hand rule, which means the right wheel goes faster. Getting that sign backwards makes a robot that steers the wrong way, and it is the most common error here.",
    hints: [
      "The mean of the two wheel speeds must equal v",
      "Their difference divided by track width must equal omega",
      "Positive omega is counter-clockwise, so the right wheel speeds up",
    ],
    testCases: [
      { input: "v=1.0, omega=0.0, L=0.5", expected: "(1.0, 1.0)", explanation: "Straight ahead — both wheels equal" },
      { input: "v=0.0, omega=2.0, L=0.5", expected: "(-0.5, 0.5)", explanation: "Spin in place — equal and opposite" },
      { input: "v=1.0, omega=2.0, L=0.5", expected: "(0.5, 1.5)", explanation: "Forward while turning left" },
    ],
  },
  {
    slug: "two-link-inverse-kinematics",
    title: "Inverse kinematics of a 2-link arm",
    difficulty: "INTERMEDIATE",
    category: "kinematics",
    language: "python",
    prompt:
      "Given a target (x, y) and link lengths L1 and L2, return the joint angles (theta1, theta2) in radians that place the tip on the target. Return None if the target is unreachable. Handle both boundaries — too far AND too close, since an arm with unequal links cannot fold tighter than |L1 − L2|. A target sitting exactly at maximum reach must not crash.",
    inputSpec: "x: float, y: float, L1: float, L2: float, elbow_up: bool",
    outputSpec: "(theta1, theta2) in radians, or None when unreachable.",
    starterCode: `import math

def inverse_kinematics(x: float, y: float, L1: float, L2: float,
                       elbow_up: bool = True) -> tuple[float, float] | None:
    ...
`,
    solution: `import math

def inverse_kinematics(x: float, y: float, L1: float, L2: float,
                       elbow_up: bool = True) -> tuple[float, float] | None:
    r_squared = x * x + y * y
    r = math.sqrt(r_squared)

    # Outer and inner workspace boundaries, with a tolerance so a target
    # exactly on the boundary is accepted rather than rejected by float error.
    eps = 1e-9
    if r > L1 + L2 + eps or r < abs(L1 - L2) - eps:
        return None

    cos_theta2 = (r_squared - L1 * L1 - L2 * L2) / (2 * L1 * L2)
    cos_theta2 = max(-1.0, min(1.0, cos_theta2))

    theta2 = math.acos(cos_theta2)
    if not elbow_up:
        theta2 = -theta2

    theta1 = math.atan2(y, x) - math.atan2(L2 * math.sin(theta2),
                                           L1 + L2 * math.cos(theta2))
    return theta1, theta2
`,
    explanation:
      "Three things separate a working solver from one that crashes in production. First, the inner boundary is |L1 − L2|, not zero — an arm with a long upper and short forearm has a dead zone it cannot fold into. Second, clamping the cosine into [−1, 1] is essential: a target exactly at maximum reach computes to 1.0000000002 through floating-point error, and acos raises a domain error on a target that is genuinely reachable. Third, atan2 rather than atan preserves the quadrant, so targets behind the shoulder are solved correctly.",
    hints: [
      "Compute r² once and reuse it — you need both r and r²",
      "Two boundaries: r > L1 + L2 and r < |L1 − L2|",
      "Clamp cos θ₂ into [−1, 1] before calling acos",
      "Verify by feeding the result back through forward kinematics",
    ],
    testCases: [
      { input: "x=0.55, y=0.0, L1=0.3, L2=0.25", expected: "(0.0, 0.0)", explanation: "Exactly at full reach — must not crash" },
      { input: "x=0.4, y=0.2, L1=0.3, L2=0.25", expected: "≈(-0.099, 1.139)", explanation: "Interior target, elbow-up solution" },
      { input: "x=0.9, y=0.0, L1=0.3, L2=0.25", expected: "None", explanation: "Beyond maximum reach" },
      { input: "x=0.01, y=0.0, L1=0.3, L2=0.25", expected: "None", explanation: "Inside the dead zone |L1 − L2| = 0.05" },
    ],
  },
  {
    slug: "pid-controller",
    title: "Implement a PID controller",
    difficulty: "INTERMEDIATE",
    category: "control",
    language: "python",
    prompt:
      "Implement a PID controller class with anti-windup. `update(setpoint, measurement, dt)` returns the control output, clamped to ±output_limit. The integral must not keep accumulating while the output is saturated — that is the bug that produces enormous overshoot on real hardware.",
    inputSpec: "kp, ki, kd, output_limit; then repeated calls to update(setpoint, measurement, dt).",
    outputSpec: "A float control output within ±output_limit.",
    starterCode: `class PID:
    def __init__(self, kp: float, ki: float, kd: float, output_limit: float = 1.0):
        ...

    def update(self, setpoint: float, measurement: float, dt: float) -> float:
        ...
`,
    solution: `class PID:
    def __init__(self, kp: float, ki: float, kd: float, output_limit: float = 1.0):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.output_limit = output_limit
        self._integral = 0.0
        self._previous_error = 0.0

    def reset(self) -> None:
        self._integral = 0.0
        self._previous_error = 0.0

    def update(self, setpoint: float, measurement: float, dt: float) -> float:
        if dt <= 0.0:
            return 0.0

        error = setpoint - measurement
        self._integral += error * dt
        derivative = (error - self._previous_error) / dt
        self._previous_error = error

        output = (self.kp * error
                  + self.ki * self._integral
                  + self.kd * derivative)

        clamped = max(-self.output_limit, min(self.output_limit, output))
        if clamped != output:
            # Saturated: undo this step's accumulation so the integral
            # cannot grow while the actuator has no headroom left.
            self._integral -= error * dt

        return clamped
`,
    explanation:
      "The anti-windup block is the point of the exercise. Without it, a controller commanding an already-saturated motor keeps accumulating integral. When the system finally reaches the setpoint, that stored value drives a large overshoot that takes a long time to unwind — and on a robot arm, that overshoot is a collision. The guard on dt <= 0 matters too: a zero or negative timestep produces a division by zero that crashes the control loop, and clock jitter makes it happen more often than you would expect.",
    hints: [
      "Integral and previous error must persist on the instance",
      "Guard against dt <= 0 before dividing",
      "Compute the unclamped output, clamp it, and compare — a difference means saturation",
      "On saturation, subtract exactly the accumulation you just added",
    ],
    testCases: [
      { input: "kp=1, ki=0, kd=0, setpoint=1, measurement=0, dt=0.1", expected: "1.0 (clamped from 1.0)", explanation: "Pure proportional" },
      { input: "kp=0, ki=1, kd=0, error=1 for 10 steps of dt=0.1", expected: "Rises to 1.0, then clamps", explanation: "Integral accumulates then saturates" },
      { input: "Saturated for 100 steps, then setpoint reached", expected: "No large overshoot", explanation: "Anti-windup prevents the stored integral discharging" },
    ],
  },
  {
    slug: "astar-path-planning",
    title: "A* on an occupancy grid",
    difficulty: "ADVANCED",
    category: "planning",
    language: "python",
    prompt:
      "Implement A* path planning on a 2D occupancy grid. The grid is a list of lists where 0 is free and 1 is blocked. Return the shortest path from start to goal as a list of (row, col) tuples including both endpoints, or None if no path exists. Use 4-connected movement and Manhattan distance as the heuristic.",
    inputSpec: "grid: list[list[int]], start: tuple[int,int], goal: tuple[int,int]",
    outputSpec: "A list of (row, col) tuples from start to goal, or None.",
    starterCode: `import heapq

def astar(grid: list[list[int]], start: tuple[int, int],
          goal: tuple[int, int]) -> list[tuple[int, int]] | None:
    ...
`,
    solution: `import heapq

def astar(grid: list[list[int]], start: tuple[int, int],
          goal: tuple[int, int]) -> list[tuple[int, int]] | None:
    rows, cols = len(grid), len(grid[0])

    def in_bounds(cell):
        r, c = cell
        return 0 <= r < rows and 0 <= c < cols

    def passable(cell):
        return grid[cell[0]][cell[1]] == 0

    if not (in_bounds(start) and in_bounds(goal)):
        return None
    if not (passable(start) and passable(goal)):
        return None

    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    open_heap = [(heuristic(start, goal), 0, start)]
    came_from: dict = {start: None}
    cost_so_far = {start: 0}

    while open_heap:
        _, cost, current = heapq.heappop(open_heap)

        if current == goal:
            path = []
            while current is not None:
                path.append(current)
                current = came_from[current]
            return path[::-1]

        # A stale heap entry for an already-improved node: skip it.
        if cost > cost_so_far.get(current, float('inf')):
            continue

        r, c = current
        for neighbour in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
            if not in_bounds(neighbour) or not passable(neighbour):
                continue

            new_cost = cost_so_far[current] + 1
            if new_cost < cost_so_far.get(neighbour, float('inf')):
                cost_so_far[neighbour] = new_cost
                came_from[neighbour] = current
                heapq.heappush(open_heap,
                               (new_cost + heuristic(neighbour, goal), new_cost, neighbour))

    return None
`,
    explanation:
      "A* is Dijkstra plus a heuristic that biases expansion toward the goal. The priority is f = g + h, where g is the cost already paid and h is the estimated remaining cost. Manhattan distance is admissible for 4-connected grids — it never overestimates — which is what guarantees the result is optimal. Two implementation details matter: Python's heapq has no decrease-key operation, so improved nodes are pushed again and the stale entries are skipped on pop by comparing against cost_so_far. And came_from[start] = None gives the path reconstruction a clean termination.",
    hints: [
      "Priority is f = g + h, with g the cost so far and h the heuristic",
      "heapq has no decrease-key — push duplicates and skip stale pops",
      "Reconstruct backwards through came_from, then reverse",
      "Check that start and goal are in bounds and not blocked before searching",
    ],
    testCases: [
      { input: "3x3 grid, all free, start=(0,0), goal=(2,2)", expected: "A 5-cell path", explanation: "Manhattan distance 4 means 5 cells including both ends" },
      { input: "Grid with a full wall between start and goal", expected: "None", explanation: "No path exists" },
      { input: "start == goal", expected: "[start]", explanation: "A single-cell path" },
      { input: "goal on a blocked cell", expected: "None", explanation: "Rejected before searching" },
    ],
  },
];

export const simulations: SimulationSource[] = [
  {
    slug: "pid-tuning-lab",
    title: "PID tuning lab",
    description:
      "A second-order plant with a step input. Adjust Kp, Ki and Kd and watch overshoot, settling time and steady-state error respond in real time. Includes a noise control so you can see exactly why the derivative term causes trouble on real hardware.",
    category: "control",
    widget: "pid-simulator",
    learnMore: [
      { label: "PID control lesson", href: "/learn/control-systems/pid-control" },
      { label: "Open vs closed loop", href: "/learn/control-systems/open-vs-closed-loop" },
    ],
  },
  {
    slug: "forward-kinematics-lab",
    title: "Forward kinematics playground",
    description:
      "Drive the joints of a planar arm and watch the tool trace out the workspace. Shows the joint frames, the accumulated angles, and warns as the elbow approaches a singular configuration.",
    category: "kinematics",
    widget: "arm-fk",
    config: { showSingularityWarning: true },
    learnMore: [
      { label: "Forward kinematics of a 2-link arm", href: "/learn/forward-kinematics/two-link-forward-kinematics" },
    ],
  },
  {
    slug: "inverse-kinematics-lab",
    title: "Inverse kinematics solver",
    description:
      "Drag a target and watch the joint angles solve live. Toggle between elbow-up and elbow-down, and drag outside the workspace to see how the solver reports an unreachable target.",
    category: "kinematics",
    widget: "arm-ik",
    learnMore: [
      { label: "Geometric inverse kinematics", href: "/learn/inverse-kinematics/geometric-inverse-kinematics" },
    ],
  },
  {
    slug: "differential-drive-lab",
    title: "Differential drive simulator",
    description:
      "Set left and right wheel speeds and watch the resulting path. Demonstrates straight motion, arcs, spinning in place, and why a differential-drive robot cannot move sideways.",
    category: "mobile",
    widget: "diff-drive",
    learnMore: [
      { label: "Differential drive and odometry", href: "/learn/mobile-robot-foundations/differential-drive" },
    ],
  },
  {
    slug: "coordinate-frames-lab",
    title: "Coordinate frame visualiser",
    description:
      "Two frames and one physical point. Move and rotate the child frame and watch the point's coordinates change in each frame while the point itself stays exactly where it is.",
    category: "kinematics",
    widget: "frame-viewer",
    learnMore: [
      { label: "Why coordinate frames exist", href: "/learn/coordinate-frames/why-frames-exist" },
    ],
  },
  {
    slug: "transform-composer",
    title: "Transformation composer",
    description:
      "Build a homogeneous transformation from a rotation and a translation, see the resulting 4×4 matrix, and swap the order of operations to see non-commutativity directly.",
    category: "kinematics",
    widget: "transform-visualiser",
    learnMore: [
      { label: "Homogeneous transformations", href: "/learn/coordinate-frames/homogeneous-transformations" },
    ],
  },
  {
    slug: "pwm-lab",
    title: "PWM and motor response",
    description:
      "Vary duty cycle and carrier frequency and watch both the switching waveform and the resulting motor speed. Drop the frequency low enough and the speed ripple becomes visible.",
    category: "electronics",
    widget: "pwm-visualiser",
    learnMore: [{ label: "PWM lesson", href: "/learn/electronics-foundations/pwm" }],
  },
  {
    slug: "ultrasonic-lab",
    title: "Ultrasonic beam simulator",
    description:
      "Rotate a wall and watch the echo vanish past about 30°. Place a thin obstacle inside the beam and see it disappear behind the larger return. The failure modes, made visible.",
    category: "sensors",
    widget: "sensor-sim",
    config: { sensor: "ultrasonic" },
    learnMore: [
      { label: "Ultrasonic sensors", href: "/learn/sensors-deep-dive/ultrasonic" },
    ],
  },
  {
    slug: "ohms-law-lab",
    title: "Ohm's law calculator",
    description:
      "Enter any two of voltage, current and resistance to solve for the third, with power computed alongside. Presets cover the LED resistor calculation and motor stall current.",
    category: "electronics",
    widget: "ohms-law",
    learnMore: [{ label: "Ohm's law lesson", href: "/learn/electronics-foundations/ohms-law" }],
  },
  {
    slug: "python-playground",
    title: "Python playground",
    description:
      "Write and run Python in the browser. Useful for trying the code from any lesson without installing anything. Runs entirely on your own machine — nothing is uploaded.",
    category: "programming",
    widget: "python-playground",
    learnMore: [
      { label: "Python for Robotics", href: "/learn/python-for-robotics" },
    ],
  },
];

export const troubleshooting: TroubleshootingSource[] = [
  {
    slug: "robot-does-not-move",
    title: "The robot does not move",
    symptom:
      "A motion command is accepted, the program appears to run, but no axis moves and no obvious error is displayed.",
    category: "industrial",
    severity: "common",
    causes: [
      {
        cause: "Safety circuit is open",
        likelihood: "high",
        checks: [
          "Is any emergency stop latched — including ones on remote panels and on the teach pendant?",
          "Are all guard door interlocks closed and made?",
          "Does the safety controller show a fault or a pending reset?",
          "Has a light curtain or scanner been interrupted and not reset?",
        ],
        fix: "Release every latched e-stop, close the guards, then perform the safety reset. The safety circuit must be reset explicitly after any trip — clearing the obstruction alone is not enough.",
      },
      {
        cause: "Servo power is off",
        likelihood: "high",
        checks: [
          "Are the servos actually enabled, not just the controller powered?",
          "Is the mode switch in a position that permits motion?",
          "Is the teach pendant enabling device (deadman) held at its middle position?",
        ],
        fix: "Enable servo power. In teach mode most robots require the deadman held lightly — pressed too hard or released both open the circuit.",
      },
      {
        cause: "A servo alarm is active",
        likelihood: "medium",
        checks: [
          "Check the alarm history, not just the current display — the original fault may have been superseded",
          "Look for overload, overheat, encoder or brake-release alarms",
          "Has the robot been idle in a stressed pose long enough to overheat a joint?",
        ],
        fix: "Read the specific alarm code and address that cause. Resetting without diagnosing usually reproduces the fault within minutes, and repeated resets on an overload alarm damage the motor.",
      },
      {
        cause: "A joint is at a soft limit",
        likelihood: "medium",
        checks: [
          "Compare current joint positions against the configured limits",
          "Does the robot jog away from the limit but not toward it?",
        ],
        fix: "Jog the offending joint back inside its range. If the program routinely approaches the limit, the taught positions or the mounting orientation need revisiting rather than the limits widening.",
      },
      {
        cause: "Speed override is at zero",
        likelihood: "medium",
        checks: [
          "Check the global speed override on the pendant",
          "Check any program-commanded speed override",
        ],
        fix: "Raise the override. This is embarrassing and extremely common — check it early, before opening any panels.",
      },
      {
        cause: "The program is not actually running",
        likelihood: "low",
        checks: [
          "Is the cursor on an executable line, or parked at the end?",
          "Is the program waiting on a digital input from the PLC?",
          "Is the correct program selected?",
        ],
        fix: "Check the execution pointer and any pending I/O wait. A robot blocked on a wait instruction looks identical to one that is faulted.",
      },
    ],
    related: ["robot-drifts-from-taught-position"],
  },
  {
    slug: "ros-node-not-communicating",
    title: "A ROS 2 node publishes but nothing receives",
    symptom:
      "The publisher runs without error and the topic appears in `ros2 topic list`, but the subscriber's callback never fires.",
    category: "ros",
    severity: "very common",
    causes: [
      {
        cause: "Incompatible QoS profiles",
        likelihood: "high",
        checks: [
          "Run `ros2 topic info /your_topic --verbose` and compare the QoS on both endpoints",
          "Is the publisher BEST_EFFORT while the subscriber requests RELIABLE?",
          "Do the durability settings match?",
        ],
        fix: "Make the subscriber's requested QoS compatible — for sensor streams use `qos_profile_sensor_data`. ROS 2 reports incompatibility by silence, never by error, which is why this is the first thing to check.",
      },
      {
        cause: "Different ROS_DOMAIN_ID",
        likelihood: "high",
        checks: [
          "Run `echo $ROS_DOMAIN_ID` in every terminal involved",
          "Was one terminal opened before the variable was exported?",
        ],
        fix: "Export the same domain ID everywhere, and put it in ~/.bashrc. Nodes in different domains cannot see each other at all.",
      },
      {
        cause: "Topic name mismatch",
        likelihood: "high",
        checks: [
          "Compare the exact strings, including any leading slash",
          "Is a namespace or a remapping being applied at launch?",
          "Does `ros2 node info /your_node` list the topic you expect?",
        ],
        fix: "Align the names. A leading slash makes a name absolute; without one it is relative to the node's namespace, so /cmd_vel and cmd_vel resolve differently inside a namespaced node.",
      },
      {
        cause: "Message type mismatch",
        likelihood: "medium",
        checks: [
          "Run `ros2 topic info /your_topic` and check the type",
          "Is one side using Twist and the other TwistStamped?",
        ],
        fix: "Use the same type on both sides. Same name plus different type means no connection, again silently.",
      },
      {
        cause: "spin() is never called",
        likelihood: "medium",
        checks: [
          "Does main() call rclpy.spin(node)?",
          "Is a long-running loop blocking the executor?",
        ],
        fix: "Callbacks only run inside spin. A node that constructs its subscriptions and then blocks in its own loop will never process a single message.",
      },
      {
        cause: "Network or discovery blocked",
        likelihood: "low",
        checks: [
          "Across machines: is multicast permitted on the subnet?",
          "Is a firewall blocking the DDS ports?",
          "Is a VPN capturing the interface?",
        ],
        fix: "Allow multicast and the DDS port range, or configure a discovery server. Docker in bridge mode also breaks discovery — use host networking for ROS 2 containers.",
      },
    ],
    related: ["tf-lookup-fails"],
  },
  {
    slug: "tf-lookup-fails",
    title: "TF2 lookup fails or returns stale data",
    symptom:
      "`lookupTransform` throws an extrapolation or connectivity error, or RViz reports that a frame does not exist.",
    category: "ros",
    severity: "very common",
    causes: [
      {
        cause: "The requested timestamp is not in the buffer yet",
        likelihood: "high",
        checks: [
          "Are you requesting the exact timestamp of an incoming message?",
          "Does the error mention extrapolation into the future?",
        ],
        fix: "Request `rclpy.time.Time()` for the latest available transform, or pass a timeout so the lookup waits briefly. Transform data always arrives slightly after the sensor data it describes.",
      },
      {
        cause: "The tree is disconnected",
        likelihood: "high",
        checks: [
          "Run `ros2 run tf2_tools view_frames` and open the generated PDF",
          "Are the two frames in the same connected component?",
          "Is a static transform publisher missing from the launch file?",
        ],
        fix: "Publish the missing link. TF2 can only connect frames that share a path through the tree — two valid subtrees with no edge between them cannot be related.",
      },
      {
        cause: "Two publishers on the same child frame",
        likelihood: "medium",
        checks: [
          "Search for every node broadcasting that child frame",
          "Does the transform visibly flicker between two values in RViz?",
        ],
        fix: "Remove the duplicate. A frame must have exactly one parent and one publisher; two makes lookups return whichever arrived most recently.",
      },
      {
        cause: "Clock mismatch",
        likelihood: "medium",
        checks: [
          "Is `use_sim_time` set consistently across every node?",
          "Across machines, are the system clocks synchronised?",
        ],
        fix: "Set use_sim_time identically everywhere when running in simulation, and run NTP or chrony on multi-machine systems. Mixed clocks produce timestamps that appear wildly in the past or future.",
      },
      {
        cause: "Transforms are published too slowly",
        likelihood: "low",
        checks: [
          "Run `ros2 topic hz /tf`",
          "Is a dynamic transform being published at 1 Hz when consumers need 30 Hz?",
        ],
        fix: "Raise the broadcast rate, or publish genuinely fixed transforms on /tf_static, where they are latched and need sending only once.",
      },
    ],
    related: ["ros-node-not-communicating"],
  },
  {
    slug: "motor-gets-hot",
    title: "A motor or driver overheats",
    symptom:
      "The motor or its driver becomes too hot to touch, performance fades over minutes, or a thermal shutdown trips.",
    category: "hardware",
    severity: "common",
    causes: [
      {
        cause: "The motor is undersized for the load",
        likelihood: "high",
        checks: [
          "Measure current draw under real operating load, not on the bench",
          "Compare against the continuous — not peak — rating",
          "Does it get hot only when carrying a payload?",
        ],
        fix: "Fit a larger motor or increase the gear ratio. Running near stall generates maximum heat for zero useful output, and no amount of cooling fixes an undersized motor.",
      },
      {
        cause: "Driver sized for running current, not stall",
        likelihood: "high",
        checks: [
          "Measure stall current by holding the shaft briefly",
          "Compare against the driver's continuous rating",
        ],
        fix: "Fit a driver rated above stall current, or enable current limiting. This is the single most common cause of driver failure in first robots.",
      },
      {
        cause: "PWM frequency too low",
        likelihood: "medium",
        checks: [
          "Is the motor audibly whining?",
          "What frequency is configured?",
        ],
        fix: "Raise to 16–25 kHz. Low frequencies cause large current ripple, and ripple dissipates as heat in the windings.",
      },
      {
        cause: "Mechanical binding",
        likelihood: "medium",
        checks: [
          "Does the shaft turn freely by hand with power off?",
          "Is a belt over-tensioned or a bearing failing?",
          "Is the current draw high even with no payload?",
        ],
        fix: "Find and remove the binding. A motor fighting friction converts all of that work into heat.",
      },
      {
        cause: "No heatsink or airflow on the driver",
        likelihood: "medium",
        checks: [
          "Does the driver have its heatsink fitted?",
          "Is it enclosed with no ventilation?",
        ],
        fix: "Fit the heatsink and provide airflow. L298N drivers in particular dissipate a great deal and are frequently run without one.",
      },
    ],
    related: [],
  },
  {
    slug: "pid-oscillates",
    title: "The controller oscillates or overshoots",
    symptom:
      "The axis weaves around the setpoint, rings after a move, or overshoots badly and takes a long time to settle.",
    category: "control",
    severity: "common",
    causes: [
      {
        cause: "Proportional gain too high",
        likelihood: "high",
        checks: [
          "Does reducing Kp by half calm it down?",
          "Does it oscillate at a consistent frequency?",
        ],
        fix: "Reduce Kp to about 60% of the value at which sustained oscillation begins, then reintroduce damping with Kd.",
      },
      {
        cause: "Integral wind-up",
        likelihood: "high",
        checks: [
          "Does the overshoot appear only after the actuator has been saturated?",
          "Is there any clamp on the integral term?",
        ],
        fix: "Clamp the integral, or stop accumulating while the output is saturated. Without this the integral grows unboundedly during saturation and discharges as a large overshoot.",
      },
      {
        cause: "Derivative term amplifying noise",
        likelihood: "medium",
        checks: [
          "Does the motor buzz or run hot while nominally stationary?",
          "Does reducing Kd to zero remove the buzz?",
        ],
        fix: "Low-pass filter the derivative, and compute it from the measurement rather than from the error so setpoint steps do not produce a spike.",
      },
      {
        cause: "Gains tuned at a different operating point",
        likelihood: "medium",
        checks: [
          "Is it stable slow and unstable fast?",
          "Is it stable unloaded and unstable with a payload?",
        ],
        fix: "Retune at the worst-case operating point, or schedule gains against speed or payload. A single fixed gain set rarely covers a wide operating envelope.",
      },
      {
        cause: "Loop rate too low or jittering",
        likelihood: "medium",
        checks: [
          "Measure the actual interval between updates, not the nominal one",
          "Is dt assumed constant in the code rather than measured?",
        ],
        fix: "Measure real elapsed time each cycle and use it. A jittering interval makes the derivative term see rate spikes that never physically occurred.",
      },
      {
        cause: "Mechanical backlash or compliance",
        likelihood: "low",
        checks: [
          "Is there play in the gearbox or coupling?",
          "Does the oscillation frequency match a structural resonance?",
        ],
        fix: "No gain set fixes backlash — the controller cannot see motion that the mechanism absorbs. Fix the mechanics, or accept a slower, more heavily damped response.",
      },
    ],
    related: ["robot-drifts-from-taught-position"],
  },
  {
    slug: "robot-drifts-from-taught-position",
    title: "The robot no longer hits its taught positions",
    symptom:
      "A program that ran correctly for months now misses by a few millimetres, or the error grows through a shift.",
    category: "industrial",
    severity: "common",
    causes: [
      {
        cause: "Thermal drift",
        likelihood: "high",
        checks: [
          "Is the error largest on the first parts after a cold start?",
          "Does it stabilise after 30–60 minutes of running?",
        ],
        fix: "Warm the robot up before production, or apply thermal compensation if the controller supports it. Aluminium links expand measurably over a working temperature range.",
      },
      {
        cause: "The fixture or workpiece has moved",
        likelihood: "high",
        checks: [
          "Measure the fixture against its datum",
          "Has maintenance worked on the cell recently?",
          "Is the error the same for every taught point?",
        ],
        fix: "Re-establish the user frame rather than re-teaching every point. A uniform offset across all positions almost always means the frame moved, not the robot.",
      },
      {
        cause: "The tool has been damaged or replaced",
        likelihood: "high",
        checks: [
          "Has the gripper or torch been changed or collided?",
          "Is the error small in translation and large in rotation?",
        ],
        fix: "Re-measure the TCP. An error that appears only during reorientation is a TCP error almost by definition.",
      },
      {
        cause: "Mechanical wear",
        likelihood: "medium",
        checks: [
          "Is there new play in a joint?",
          "Has repeatability degraded from the datasheet figure?",
          "Any new noise from a gearbox?",
        ],
        fix: "This is a maintenance issue, not a programming one. Backlash in a reducer cannot be compensated in the program, and it will worsen.",
      },
      {
        cause: "A collision reset the mastering",
        likelihood: "medium",
        checks: [
          "Has the robot collided since it last ran correctly?",
          "Are the joint zero positions still correct against the mastering marks?",
        ],
        fix: "Re-master the affected axes. A hard collision can move an encoder relative to the joint, which offsets every position that axis contributes to.",
      },
    ],
    related: ["robot-does-not-move", "pid-oscillates"],
  },
  {
    slug: "vision-detects-wrong-object",
    title: "Vision detects the wrong thing, or nothing",
    symptom:
      "The detector finds shadows, misses the part entirely, or works in the lab and fails on site.",
    category: "vision",
    severity: "common",
    causes: [
      {
        cause: "Lighting changed",
        likelihood: "high",
        checks: [
          "Compare lighting against where thresholds were tuned",
          "Is there daylight that varies through the day?",
          "Are there new shadows from equipment or people?",
        ],
        fix: "Control the lighting — enclose and light the inspection area consistently. This is far more effective than making the algorithm cleverer, and it is what production cells do.",
      },
      {
        cause: "HSV thresholds too permissive",
        likelihood: "high",
        checks: [
          "Display the binary mask, not just the final detection",
          "Are shadows and background passing the threshold?",
        ],
        fix: "Raise the saturation and value floors. Dark pixels have meaningless hue, and low-saturation pixels are grey — both should be excluded before hue is considered at all.",
      },
      {
        cause: "Specular reflections",
        likelihood: "medium",
        checks: [
          "Are there bright highlights on the part?",
          "Do they move as the part moves?",
        ],
        fix: "Use diffuse lighting or a polarising filter. A specular highlight saturates to white, which has no hue at all, punching a hole in the middle of the detection.",
      },
      {
        cause: "Camera moved after calibration",
        likelihood: "medium",
        checks: [
          "Is the mount still tight?",
          "Is the error a constant offset in one direction?",
        ],
        fix: "Redo the hand-eye calibration and mount the camera rigidly. Any movement invalidates the extrinsics completely.",
      },
      {
        cause: "Colour and depth frames not synchronised",
        likelihood: "low",
        checks: [
          "Is the error present only for moving parts?",
          "Are the two streams paired by timestamp?",
        ],
        fix: "Use an approximate time synchroniser so the depth read corresponds to the frame the detection came from.",
      },
    ],
    related: [],
  },
];
