import type { GlossarySource } from "./schema";

/**
 * Every term carries two definitions on purpose. The `simple` one is what a
 * beginner needs on first contact; the `technical` one is what the same person
 * needs six months later. Showing both, always, is what lets one glossary serve
 * the whole difficulty range instead of splitting into a beginner and an
 * advanced version that drift apart.
 */
export const glossary: GlossarySource[] = [
  {
    slug: "actuator",
    term: "Actuator",
    category: "mechanics",
    simple: "The part of a robot that makes something move.",
    technical:
      "A device that converts stored or supplied energy — electrical, hydraulic or pneumatic — into controlled mechanical motion. In robotics the actuator, its transmission and its feedback device are usually specified together, because the achievable torque, speed and resolution at the joint depend on all three.",
    example:
      "A servo motor with a 100:1 gearbox driving the elbow joint of a robot arm is one actuator.",
    related: ["motor", "end-effector", "encoder"],
    lessons: [
      { courseSlug: "robot-anatomy", lessonSlug: "actuators-and-end-effectors", title: "Actuators and end effectors" },
    ],
  },
  {
    slug: "dof",
    term: "Degrees of Freedom",
    abbreviation: "DOF",
    category: "mechanics",
    simple: "The number of independent ways a robot can move.",
    technical:
      "The number of independent parameters required to fully specify the configuration of a mechanism. A rigid body in free space has six degrees of freedom: three translations and three rotations. A serial robot's DOF equals its number of independently actuated joints; six is the minimum needed to reach an arbitrary position and orientation in 3D space.",
    formula: "\\text{DOF}_{\\text{spatial body}} = 3\\ \\text{translations} + 3\\ \\text{rotations} = 6",
    example:
      "A SCARA robot has four degrees of freedom, so it can position a tool anywhere in its volume but can only rotate it about the vertical axis.",
    related: ["revolute-joint", "prismatic-joint", "workspace", "singularity"],
    lessons: [
      { courseSlug: "robot-anatomy", lessonSlug: "degrees-of-freedom", title: "Degrees of freedom" },
    ],
  },
  {
    slug: "encoder",
    term: "Encoder",
    category: "sensors",
    simple: "A sensor that tells the controller how far a motor has turned.",
    technical:
      "A position transducer that converts shaft angle into an electrical signal. Incremental encoders emit quadrature pulse trains, giving relative motion and direction but requiring a homing sequence after power-up. Absolute encoders report a unique code per shaft position and retain it through a power cycle. Resolution is quoted in counts per revolution; quadrature decoding yields four counts per line pair.",
    example:
      "A 1000-line incremental encoder decoded in quadrature resolves 4000 counts per revolution, or 0.09° per count.",
    related: ["actuator", "closed-loop-control", "odometry"],
    lessons: [
      { courseSlug: "sensors-deep-dive", lessonSlug: "encoders", title: "Encoders" },
    ],
  },
  {
    slug: "end-effector",
    term: "End Effector",
    category: "mechanics",
    simple: "The tool at the end of a robot arm — the gripper, welder or suction cup.",
    technical:
      "The device mounted at the terminal link of a manipulator that performs the task. It defines the tool frame and therefore the tool centre point used by all Cartesian motion commands. Its mass and centre of gravity must be declared to the controller so that dynamic torque compensation and payload limits are computed correctly.",
    example: "A two-finger parallel gripper is the end effector on a pick-and-place robot.",
    related: ["tcp", "payload", "tool-frame"],
    lessons: [
      { courseSlug: "robot-anatomy", lessonSlug: "actuators-and-end-effectors", title: "Actuators and end effectors" },
    ],
  },
  {
    slug: "forward-kinematics",
    term: "Forward Kinematics",
    abbreviation: "FK",
    category: "kinematics",
    simple: "Working out where the robot's hand is, given the angle of every joint.",
    technical:
      "The mapping from joint space to Cartesian task space. For a serial chain it is computed by composing the homogeneous transformations of each link in order, so the pose of the end effector in the base frame is the product of the per-joint transforms. Forward kinematics always has exactly one solution.",
    formula: "{}^{0}T_{n} = {}^{0}T_{1}(q_1)\\,{}^{1}T_{2}(q_2)\\cdots{}^{n-1}T_{n}(q_n)",
    example:
      "Given shoulder = 30° and elbow = 45° on a two-link arm, forward kinematics returns the exact (x, y) of the fingertip.",
    related: ["inverse-kinematics", "dh-parameters", "transformation-matrix"],
    lessons: [
      { courseSlug: "forward-kinematics", lessonSlug: "two-link-forward-kinematics", title: "Forward kinematics of a 2-link arm" },
    ],
  },
  {
    slug: "inverse-kinematics",
    term: "Inverse Kinematics",
    abbreviation: "IK",
    category: "kinematics",
    simple: "Working out what joint angles you need to put the robot's hand in a chosen spot.",
    technical:
      "The mapping from a desired end-effector pose back to joint coordinates. Unlike forward kinematics it may have no solution (the target is outside the workspace), exactly one, several discrete solutions (elbow-up and elbow-down), or infinitely many for a redundant manipulator. Solutions are found analytically where the geometry permits, otherwise numerically by iterating on the Jacobian.",
    formula: "q = f^{-1}(T_{\\text{desired}})",
    example:
      "Telling a robot to move its gripper to (0.4 m, 0.2 m, 0.3 m) requires inverse kinematics to produce the six joint angles.",
    related: ["forward-kinematics", "jacobian", "singularity", "workspace"],
    lessons: [
      { courseSlug: "inverse-kinematics", lessonSlug: "geometric-inverse-kinematics", title: "Geometric inverse kinematics" },
    ],
  },
  {
    slug: "imu",
    term: "Inertial Measurement Unit",
    abbreviation: "IMU",
    category: "sensors",
    simple: "A chip that senses tilting, turning and acceleration.",
    technical:
      "A sensor package combining a three-axis accelerometer and a three-axis gyroscope, often with a three-axis magnetometer. Accelerometers measure specific force including gravity, giving absolute tilt but poor dynamic accuracy; gyroscopes measure angular rate with good short-term accuracy but drift when integrated. Fusing them — complementary or Kalman filtering — yields an orientation estimate better than either alone.",
    example:
      "A quadcopter reads its IMU at 500 Hz to hold level flight; the accelerometer corrects the gyroscope's slow drift.",
    related: ["sensor-fusion", "kalman-filter", "odometry"],
    lessons: [
      { courseSlug: "sensors-deep-dive", lessonSlug: "imu", title: "The IMU" },
    ],
  },
  {
    slug: "lidar",
    term: "LiDAR",
    category: "sensors",
    simple: "A spinning laser that measures distance in every direction to build a map.",
    technical:
      "Light Detection and Ranging: a sensor that measures range by timing reflected laser pulses or by phase-shift of a modulated beam. A 2D LiDAR sweeps a single plane and returns a range array per revolution; 3D units add vertical channels or a nodding axis. Range accuracy is typically a few centimetres, largely independent of ambient light, but performance degrades on dark, specular or transparent surfaces.",
    example:
      "A warehouse AMR uses a 2D LiDAR at 10 Hz for both obstacle detection and SLAM.",
    related: ["slam", "point-cloud", "occupancy-grid"],
    lessons: [
      { courseSlug: "sensors-deep-dive", lessonSlug: "lidar", title: "LiDAR" },
    ],
  },
  {
    slug: "pid",
    term: "PID Controller",
    abbreviation: "PID",
    category: "control",
    simple:
      "A control recipe that uses how wrong you are now, how long you've been wrong, and how fast the error is changing.",
    technical:
      "A feedback controller whose output is the weighted sum of three terms computed from the error signal: proportional to present error, integral of accumulated past error, and derivative of the error's rate of change. The proportional term provides the bulk of the response, the integral term eliminates steady-state offset at the cost of phase lag and wind-up risk, and the derivative term adds damping but amplifies measurement noise.",
    formula: "u(t) = K_p e(t) + K_i \\int_0^t e(\\tau)\\,d\\tau + K_d \\frac{de(t)}{dt}",
    example:
      "A robot joint holding position against gravity needs the integral term; without it the arm settles slightly below the commanded angle forever.",
    related: ["closed-loop-control", "overshoot", "steady-state-error"],
    lessons: [
      { courseSlug: "control-systems", lessonSlug: "pid-control", title: "PID control" },
    ],
  },
  {
    slug: "ros",
    term: "Robot Operating System",
    abbreviation: "ROS",
    category: "software",
    simple: "Not an operating system — a toolkit that lets robot programs talk to each other.",
    technical:
      "A middleware framework and ecosystem for robot software. It provides an anonymous publish–subscribe transport, request–response services, long-running actions with feedback, a parameter system, a package and build system, and a large library of reusable drivers and algorithms. ROS 2 replaced ROS 1's custom master-based transport with DDS, adding configurable quality-of-service, native multi-robot support and real-time-capable execution.",
    example:
      "A camera driver node publishes to /image_raw; a detector node subscribes to it without either knowing the other exists.",
    related: ["ros-node", "ros-topic", "tf", "dds"],
    lessons: [
      { courseSlug: "ros2-foundations", lessonSlug: "what-is-ros2", title: "What is ROS 2?" },
    ],
  },
  {
    slug: "ros-node",
    term: "Node",
    category: "software",
    simple: "One program in a ROS system that does one job.",
    technical:
      "The unit of computation in ROS. A node is a process (or a component loaded into a shared process) that participates in the ROS graph, owning its own publishers, subscriptions, services, actions and parameters. The design intent is one responsibility per node, so that a system is composed of small, independently testable and independently restartable processes.",
    example: "/lidar_driver, /slam_toolbox and /nav2_controller are three nodes in one navigation stack.",
    related: ["ros", "ros-topic", "ros-service"],
    lessons: [
      { courseSlug: "ros2-foundations", lessonSlug: "nodes", title: "Nodes" },
    ],
  },
  {
    slug: "ros-topic",
    term: "Topic",
    category: "software",
    simple: "A named channel that nodes send messages on.",
    technical:
      "A named, strongly typed, many-to-many asynchronous transport in the ROS graph. Publishers and subscribers are decoupled — neither blocks on the other and neither needs to exist for the other to start. Delivery semantics are governed by quality-of-service settings; a mismatch in reliability, durability or history between a publisher and subscriber silently prevents connection, which is the single most common cause of a ROS 2 topic that appears dead.",
    example: "A velocity command topic /cmd_vel carries geometry_msgs/msg/Twist to the base controller.",
    related: ["ros-node", "ros-service", "qos"],
    lessons: [
      { courseSlug: "ros2-foundations", lessonSlug: "topics-and-messages", title: "Topics and messages" },
    ],
  },
  {
    slug: "ros-service",
    term: "Service",
    category: "software",
    simple: "A way for one node to ask another node a question and wait for the answer.",
    technical:
      "A synchronous request–response interaction between exactly one client and one server, defined by a .srv file with request and response sections. Services suit short, infrequent, side-effecting calls where the caller needs confirmation. Anything that takes appreciable time should be an action instead, so that it can report progress and be cancelled.",
    example: "Calling /reset_odometry to zero a robot's pose estimate.",
    related: ["ros-topic", "ros-action", "ros-node"],
  },
  {
    slug: "ros-action",
    term: "Action",
    category: "software",
    simple: "A long-running request you can watch and cancel — like 'drive to the kitchen'.",
    technical:
      "A goal-oriented interaction built from topics and services, providing goal submission, periodic feedback, a final result, and cancellation. Actions are the correct interface for any task with meaningful duration, because the client can monitor progress and abort without the server being blocked.",
    example: "Nav2's NavigateToPose action reports remaining distance while driving and can be cancelled mid-route.",
    related: ["ros-service", "ros-topic"],
  },
  {
    slug: "tf",
    term: "Transform Library",
    abbreviation: "TF / TF2",
    category: "software",
    simple: "The bookkeeping that tracks where every part of the robot is relative to every other part.",
    technical:
      "A distributed, time-stamped transform system. Nodes broadcast parent-to-child transforms; TF2 assembles them into a tree and answers queries for the transform between any two frames at any buffered time, interpolating as needed. Every frame must have exactly one parent — two publishers on the same child frame produce a corrupted tree and intermittent, hard-to-diagnose lookup failures.",
    example: "Converting a point seen in the camera_link frame into base_link so the arm can reach for it.",
    related: ["coordinate-frame", "ros", "urdf"],
    lessons: [
      { courseSlug: "coordinate-frames", lessonSlug: "frames-and-transforms", title: "Frames and transforms" },
    ],
  },
  {
    slug: "urdf",
    term: "Unified Robot Description Format",
    abbreviation: "URDF",
    category: "software",
    simple: "An XML file that describes a robot's shape, joints and how they connect.",
    technical:
      "An XML schema describing a robot's kinematic and dynamic structure: links with visual, collision and inertial properties, and joints with type, axis, origin and limits. It is the source of truth from which the transform tree, the RViz visualisation, the physics model and the motion planner's collision geometry are all derived. URDF describes trees only; closed kinematic chains require SDF or a URDF plus explicit loop constraints.",
    example: "A URDF declares base_link, then a revolute joint to shoulder_link with limits of ±170°.",
    related: ["tf", "ros", "gazebo"],
  },
  {
    slug: "slam",
    term: "Simultaneous Localisation and Mapping",
    abbreviation: "SLAM",
    category: "navigation",
    simple: "Building a map of somewhere new while working out where you are on that same map.",
    technical:
      "The problem of jointly estimating a robot's trajectory and a map of its environment from sensor data, without a prior map. It is a chicken-and-egg problem: localisation needs a map and mapping needs a pose. Modern solutions are formulated as a factor graph in which poses and landmarks are nodes and sensor constraints are edges, optimised in the background, with loop closure detection correcting accumulated drift when a previously visited place is recognised.",
    related: ["odometry", "occupancy-grid", "particle-filter", "lidar"],
  },
  {
    slug: "odometry",
    term: "Odometry",
    category: "navigation",
    simple: "Estimating how far you've travelled by counting wheel turns.",
    technical:
      "Dead-reckoned pose estimation from proprioceptive sensors, most commonly wheel encoders integrated through the robot's kinematic model. Because it integrates rate measurements, error accumulates without bound: wheel slip, tyre wear and an inaccurate wheelbase all bias the estimate permanently. Odometry is therefore excellent over short intervals and worthless over long ones, which is exactly why it is fused with absolute references such as LiDAR scan matching.",
    formula: "\\Delta s = \\frac{\\Delta s_R + \\Delta s_L}{2}, \\qquad \\Delta\\theta = \\frac{\\Delta s_R - \\Delta s_L}{L}",
    related: ["encoder", "slam", "sensor-fusion", "differential-drive"],
  },
  {
    slug: "tcp",
    term: "Tool Centre Point",
    abbreviation: "TCP",
    category: "manipulators",
    simple: "The exact spot on the tool that the robot actually cares about positioning.",
    technical:
      "The reference point of the tool frame, defined as an offset and rotation from the robot's mounting flange. All Cartesian motion commands, speeds and path interpolation are expressed at the TCP, so an incorrect TCP definition produces correct-looking joint motion with the tool in the wrong place — and produces path errors that grow with tool reorientation while pure translations still look fine.",
    example:
      "For a welding torch the TCP is the wire tip; for a suction gripper it is the centre of the suction cup face.",
    related: ["tool-frame", "end-effector", "user-frame"],
    lessons: [
      { courseSlug: "industrial-manipulators", lessonSlug: "tcp-and-frames", title: "TCP, tool frames and user frames" },
    ],
  },
  {
    slug: "tool-frame",
    term: "Tool Frame",
    category: "manipulators",
    simple: "The coordinate system attached to whatever the robot is holding.",
    technical:
      "A coordinate frame fixed to the end effector, defined relative to the flange frame. Its origin is the TCP and its axes set the directions used by tool-relative jogging and by any motion commanded in tool coordinates.",
    related: ["tcp", "user-frame", "coordinate-frame"],
  },
  {
    slug: "user-frame",
    term: "User Frame",
    category: "manipulators",
    simple: "A coordinate system you attach to the workpiece or table, so positions make sense there.",
    technical:
      "An application-defined frame, typically located on a fixture, conveyor or workpiece. Teaching positions relative to a user frame means that when the fixture moves, only the frame definition needs re-teaching rather than every point in the program — the single largest saver of re-teaching time in production programming.",
    related: ["tool-frame", "tcp", "coordinate-frame"],
  },
  {
    slug: "coordinate-frame",
    term: "Coordinate Frame",
    category: "kinematics",
    simple: "A set of X, Y, Z axes pinned to something, so you can describe positions relative to it.",
    technical:
      "An origin and an orthonormal basis defining a local coordinate system. Robotics uses right-handed frames throughout. Every meaningful position statement is relative to some frame; a coordinate triple without a named frame is not a position, and treating it as one is the root cause of a large fraction of integration bugs.",
    related: ["transformation-matrix", "tf", "tool-frame"],
    lessons: [
      { courseSlug: "coordinate-frames", lessonSlug: "why-frames-exist", title: "Why coordinate frames exist" },
    ],
  },
  {
    slug: "transformation-matrix",
    term: "Homogeneous Transformation Matrix",
    category: "kinematics",
    simple: "A 4×4 grid of numbers that stores a rotation and a movement in one object.",
    technical:
      "A 4×4 matrix combining a 3×3 rotation matrix and a 3×1 translation vector, with a bottom row of [0 0 0 1]. Representing both operations in one object means composing them is matrix multiplication and inverting a frame relationship is matrix inversion, so an entire kinematic chain reduces to a single product.",
    formula: "T = \\begin{bmatrix} R_{3\\times3} & p_{3\\times1} \\\\ 0\\ 0\\ 0 & 1 \\end{bmatrix}",
    related: ["rotation-matrix", "coordinate-frame", "forward-kinematics"],
    lessons: [
      { courseSlug: "coordinate-frames", lessonSlug: "homogeneous-transformations", title: "Homogeneous transformations" },
    ],
  },
  {
    slug: "rotation-matrix",
    term: "Rotation Matrix",
    category: "kinematics",
    simple: "A 3×3 grid of numbers describing how one set of axes is turned relative to another.",
    technical:
      "A 3×3 orthonormal matrix with determinant +1, an element of the group SO(3). Its columns are the unit vectors of the rotated frame expressed in the reference frame. Because it is orthonormal, its inverse is simply its transpose — which is why frame relationships can be reversed at no computational cost.",
    formula: "R^{-1} = R^{T}, \\qquad \\det(R) = +1",
    related: ["transformation-matrix", "euler-angles", "quaternion"],
  },
  {
    slug: "euler-angles",
    term: "Roll, Pitch, Yaw",
    category: "kinematics",
    simple: "Three angles describing tilt side-to-side, nose up-down, and turning left-right.",
    technical:
      "A three-parameter orientation representation as successive rotations about coordinate axes. Compact and human-readable, but subject to gimbal lock — at certain orientations two axes align and one degree of freedom is lost — and ambiguous unless the axis order and whether the rotations are intrinsic or extrinsic are stated. Controllers therefore store orientation as quaternions and convert to roll-pitch-yaw only for display.",
    related: ["rotation-matrix", "quaternion"],
  },
  {
    slug: "quaternion",
    term: "Quaternion",
    category: "kinematics",
    simple: "A four-number way of storing orientation that never gets stuck like angles do.",
    technical:
      "A four-component representation of rotation, (x, y, z, w) with unit norm. Quaternions avoid gimbal lock, compose by multiplication more cheaply than matrices, interpolate smoothly along the shortest arc, and need only four numbers instead of nine. The cost is that they are not directly readable, and that q and −q represent the same rotation.",
    related: ["rotation-matrix", "euler-angles", "tf"],
  },
  {
    slug: "dh-parameters",
    term: "Denavit–Hartenberg Parameters",
    abbreviation: "DH",
    category: "kinematics",
    simple: "A standard four-number recipe for describing each joint of an arm.",
    technical:
      "A convention that describes the relationship between consecutive link frames with exactly four parameters — link length a, link twist α, link offset d and joint angle θ — by constraining how frames are assigned. The saving is real: four numbers instead of six, and a uniform transform expression per joint. The cost is that frames land in non-obvious places and the convention is undefined for parallel consecutive axes.",
    related: ["forward-kinematics", "transformation-matrix"],
  },
  {
    slug: "jacobian",
    term: "Jacobian",
    category: "kinematics",
    simple: "The matrix that converts joint speeds into tool speed.",
    technical:
      "The matrix of partial derivatives mapping joint velocities to end-effector linear and angular velocity. It is the linearisation of the forward kinematics at the current configuration, so it changes with pose. Its transpose maps end-effector forces to joint torques, making it central to force control; where it loses rank the robot is at a singularity.",
    formula: "\\dot{x} = J(q)\\,\\dot{q}, \\qquad \\tau = J(q)^{T} F",
    related: ["singularity", "inverse-kinematics", "force-control"],
  },
  {
    slug: "singularity",
    term: "Singularity",
    category: "kinematics",
    simple:
      "A pose where the robot loses the ability to move in some direction, and joints may spin wildly.",
    technical:
      "A configuration at which the Jacobian loses rank, so end-effector motion in at least one direction becomes unattainable. Approaching a singularity, the joint velocities required for a constant Cartesian velocity tend to infinity, which controllers report as a speed-limit fault. Common cases are the wrist singularity (two wrist axes align), the shoulder singularity (wrist centre over the base axis) and the elbow singularity (arm fully extended).",
    related: ["jacobian", "workspace", "inverse-kinematics"],
  },
  {
    slug: "workspace",
    term: "Workspace",
    category: "mechanics",
    simple: "All the places a robot's tool can actually reach.",
    technical:
      "The set of poses attainable by the end effector. The reachable workspace is the set of positions attainable in at least one orientation; the dexterous workspace is the smaller set attainable in every orientation. Published reach figures describe the reachable workspace of the wrist centre, so adding a tool changes the usable volume in ways the datasheet does not show.",
    related: ["dof", "singularity", "reach"],
  },
  {
    slug: "reach",
    term: "Reach",
    category: "mechanics",
    simple: "How far the robot can stretch from its base.",
    technical:
      "The maximum distance from the axis-1 centreline to the wrist centre point, quoted with the arm fully extended. It excludes the end effector, and it is a single radius that says nothing about whether a given pose is attainable with a usable orientation.",
    related: ["workspace", "payload"],
  },
  {
    slug: "payload",
    term: "Payload",
    category: "mechanics",
    simple: "The heaviest thing the robot can carry.",
    technical:
      "The maximum mass the manipulator can handle at its rated speed and acceleration, including the end effector and everything it holds. The rating is valid only at a specified centre-of-gravity offset from the flange; moving the load further out raises the wrist torque and can exceed limits well below the nominal mass.",
    related: ["end-effector", "reach", "torque"],
  },
  {
    slug: "accuracy",
    term: "Accuracy",
    category: "mechanics",
    simple: "How close the robot gets to where you told it to go.",
    technical:
      "The deviation between a commanded pose and the achieved pose, measured against an external reference. It is limited by manufacturing tolerance, thermal growth, deflection under load and the fidelity of the controller's kinematic model. Industrial arms typically have accuracy an order of magnitude worse than their repeatability, which is why calibration is a distinct step and why offline-generated programs need touch-up.",
    related: ["repeatability", "calibration"],
  },
  {
    slug: "repeatability",
    term: "Repeatability",
    category: "mechanics",
    simple: "How consistently the robot returns to the same spot, even if that spot is slightly off.",
    technical:
      "The spread of achieved poses when the same taught pose is commanded repeatedly under identical conditions, usually quoted as a radius containing a stated percentage of returns. It is the figure on the datasheet — commonly ±0.02 to ±0.1 mm — and it is what makes taught programs viable even when absolute accuracy is far worse.",
    related: ["accuracy", "calibration"],
  },
  {
    slug: "revolute-joint",
    term: "Revolute Joint",
    category: "mechanics",
    simple: "A joint that rotates, like an elbow.",
    technical:
      "A one-degree-of-freedom joint permitting rotation about a single axis, parameterised by joint angle θ. It is the dominant joint type in industrial manipulators because rotary actuators and rotary position feedback are compact, sealed and cheap relative to linear equivalents.",
    related: ["prismatic-joint", "dof"],
  },
  {
    slug: "prismatic-joint",
    term: "Prismatic Joint",
    category: "mechanics",
    simple: "A joint that slides in a straight line, like a drawer.",
    technical:
      "A one-degree-of-freedom joint permitting translation along a single axis, parameterised by displacement d. Prismatic joints give a simple rectangular workspace and constant resolution throughout travel, at the cost of bulk — the mechanism must be at least as long as its stroke — and exposed ways that need sealing.",
    related: ["revolute-joint", "dof"],
  },
  {
    slug: "closed-loop-control",
    term: "Closed-Loop Control",
    category: "control",
    simple: "The robot measures what actually happened and corrects itself.",
    technical:
      "A control architecture in which the controlled variable is measured and fed back to compute error, which drives the control action. Feedback makes the system reject disturbances and tolerate model error, at the cost of requiring a sensor and introducing the possibility of instability if loop gain and phase lag are badly chosen.",
    related: ["open-loop-control", "pid", "encoder"],
  },
  {
    slug: "open-loop-control",
    term: "Open-Loop Control",
    category: "control",
    simple: "The robot does what it was told and never checks the result.",
    technical:
      "A control architecture with no feedback path: the command is computed from the reference and a model of the plant alone. It is simple, cheap and unconditionally stable, and it is entirely at the mercy of load changes and model error. Stepper-driven axes are the classic example — precise until the moment a step is missed, which nothing detects.",
    related: ["closed-loop-control", "pid"],
  },
  {
    slug: "overshoot",
    term: "Overshoot",
    category: "control",
    simple: "When the robot goes past its target before coming back.",
    technical:
      "The amount by which a response exceeds its final steady-state value, quoted as a percentage of the step size. It reflects insufficient damping relative to loop gain: raising proportional gain speeds the response and increases overshoot, while derivative action opposes the approach velocity and reduces it. In a manipulator, overshoot is not merely inelegant — it is a collision with whatever sits just beyond the target.",
    related: ["pid", "settling-time", "steady-state-error"],
  },
  {
    slug: "settling-time",
    term: "Settling Time",
    category: "control",
    simple: "How long the robot takes to stop wobbling and stay put.",
    technical:
      "The time from a step command until the response enters and remains within a tolerance band (commonly ±2%) around its final value. In production it is the figure that sets cycle time, because a move is not finished when the tool first arrives — it is finished when the tool has stopped moving enough to work.",
    related: ["overshoot", "pid"],
  },
  {
    slug: "steady-state-error",
    term: "Steady-State Error",
    category: "control",
    simple: "The gap that never closes — the robot settles slightly off target and stays there.",
    technical:
      "The residual difference between reference and output once transients have decayed. Under proportional-only control a constant disturbance such as gravity requires a non-zero error to generate the holding output, so offset is structural rather than a tuning mistake. Integral action removes it by accumulating the error until the output is sufficient at zero error.",
    related: ["pid", "overshoot"],
  },
  {
    slug: "pwm",
    term: "Pulse Width Modulation",
    abbreviation: "PWM",
    category: "electronics",
    simple: "Switching power on and off very fast to control how much a motor gets on average.",
    technical:
      "A technique for delivering a controllable average power using a fixed-frequency square wave whose duty cycle is varied. Because the switching element is either fully on or fully off, dissipation is far lower than in linear regulation. Carrier frequency is a real design choice: too low is audible and causes torque ripple, too high increases switching losses and electromagnetic emissions.",
    formula: "V_{\\text{avg}} = D \\times V_{\\text{supply}}, \\qquad D = \\frac{t_{\\text{on}}}{T}",
    related: ["gpio", "motor", "motor-driver"],
    lessons: [
      { courseSlug: "electronics-foundations", lessonSlug: "pwm", title: "PWM" },
    ],
  },
  {
    slug: "gpio",
    term: "General Purpose Input/Output",
    abbreviation: "GPIO",
    category: "electronics",
    simple: "A pin on a microcontroller you can use to read a switch or turn something on.",
    technical:
      "A microcontroller pin whose direction and function are set in software. As an output it sources or sinks a strictly limited current — typically 20–40 mA, with a lower total across the whole port — which is why anything beyond an indicator LED needs a driver stage. As an input it is high-impedance and will float unless pulled up or down.",
    related: ["pwm", "microcontroller", "motor-driver"],
  },
  {
    slug: "motor-driver",
    term: "Motor Driver",
    category: "electronics",
    simple: "The power stage between the controller's tiny signals and the motor's big current.",
    technical:
      "A circuit that switches motor supply current under logic-level control, commonly an H-bridge for bidirectional DC motors. It provides current capacity far beyond a GPIO pin, direction control, and protection against the inductive kickback generated when motor current is interrupted. Selection is driven by stall current rather than running current, since stall is what actually occurs when a robot drives into a wall.",
    related: ["pwm", "gpio", "motor"],
  },
  {
    slug: "motor",
    term: "Motor",
    category: "electronics",
    simple: "The thing that spins and makes the robot move.",
    technical:
      "An electromechanical transducer converting electrical energy to rotational mechanical energy. In a brushed DC motor, torque is proportional to current and back-EMF is proportional to speed, so a stalled motor draws its maximum current with zero back-EMF — the condition that destroys undersized drivers. Steppers trade efficiency for open-loop position; BLDC motors trade controller complexity for power density and life.",
    formula: "\\tau = K_t I, \\qquad V = IR + K_e \\omega",
    related: ["actuator", "torque", "motor-driver", "encoder"],
  },
  {
    slug: "torque",
    term: "Torque",
    category: "mechanics",
    simple: "Turning force — how hard a motor twists.",
    technical:
      "The moment of a force about an axis, the rotational analogue of force, measured in newton-metres. At a robot joint the required torque is the sum of gravitational load, inertial acceleration terms, friction and any external contact force. Gearing multiplies torque and divides speed by the same ratio, less efficiency losses, which is why joint actuators are almost always geared.",
    formula: "\\tau = r \\times F, \\qquad \\tau_{\\text{out}} = \\eta \\, N \\, \\tau_{\\text{in}}",
    related: ["motor", "payload", "gear-ratio"],
  },
  {
    slug: "gear-ratio",
    term: "Gear Ratio",
    category: "mechanics",
    simple: "How much a gearbox trades speed for strength.",
    technical:
      "The ratio of input to output shaft speed in a transmission. A ratio of N divides output speed by N and multiplies torque by N times the efficiency. It also multiplies the reflected inertia seen by the motor by N², which is what actually determines how quickly the joint can be accelerated and why very high ratios make a joint feel sluggish despite ample torque.",
    formula: "N = \\frac{\\omega_{\\text{in}}}{\\omega_{\\text{out}}}, \\qquad J_{\\text{reflected}} = \\frac{J_{\\text{load}}}{N^{2}}",
    related: ["torque", "motor", "actuator"],
  },
  {
    slug: "differential-drive",
    term: "Differential Drive",
    category: "navigation",
    simple: "Two powered wheels — steer by spinning one faster than the other.",
    technical:
      "A wheeled configuration with two independently driven coaxial wheels and one or more passive supports. Forward speed is the mean of the wheel speeds and turn rate is their difference divided by the track width. It can rotate in place but cannot translate sideways, making it non-holonomic: reachable in the long run, constrained instant to instant, which is exactly why parallel parking is hard.",
    formula: "v = \\frac{v_R + v_L}{2}, \\qquad \\omega = \\frac{v_R - v_L}{L}",
    related: ["odometry", "holonomic", "ackermann-steering"],
  },
  {
    slug: "holonomic",
    term: "Holonomic",
    category: "navigation",
    simple: "A robot that can move any direction instantly, including sideways.",
    technical:
      "A system whose controllable degrees of freedom equal its total degrees of freedom, so any velocity in configuration space can be commanded directly. Mecanum and omni-wheel bases are holonomic in the plane; differential-drive and Ackermann bases are not, and their planners must respect that constraint rather than planning arbitrary paths and hoping.",
    related: ["differential-drive", "ackermann-steering"],
  },
  {
    slug: "ackermann-steering",
    term: "Ackermann Steering",
    category: "navigation",
    simple: "Car-style steering, where the front wheels turn to point around the corner.",
    technical:
      "A steering geometry in which the inner and outer steered wheels are given different angles so that all wheels' axes intersect at a common instantaneous centre of rotation, avoiding tyre scrub. It imposes a minimum turning radius and forbids rotation in place, so planners for Ackermann platforms must generate curvature-continuous paths.",
    related: ["differential-drive", "holonomic"],
  },
  {
    slug: "occupancy-grid",
    term: "Occupancy Grid",
    category: "navigation",
    simple: "A map made of squares, each marked free, blocked or unknown.",
    technical:
      "A discretised map representation storing per-cell probability of occupancy, typically updated in log-odds so that repeated observations combine by addition. Cell size trades memory and planning speed against the smallest obstacle that can be represented; the explicit unknown state is what lets a planner distinguish unexplored space from known-free space.",
    related: ["slam", "lidar", "path-planning"],
  },
  {
    slug: "path-planning",
    term: "Path Planning",
    category: "navigation",
    simple: "Working out a route from where the robot is to where it needs to be.",
    technical:
      "Computing a collision-free path through configuration space from start to goal. Graph search methods such as Dijkstra and A* are complete and optimal on a discretisation, and scale poorly with dimension. Sampling-based methods such as RRT and RRT* handle high-dimensional spaces such as a 6-DOF arm by probabilistic exploration, trading guaranteed optimality for tractability.",
    related: ["occupancy-grid", "trajectory", "slam"],
  },
  {
    slug: "trajectory",
    term: "Trajectory",
    category: "control",
    simple: "A path plus a schedule — not just where to go but when to be there.",
    technical:
      "A time-parameterised path, specifying position and usually velocity and acceleration at each instant. The distinction from a path is operational: a path can be geometrically valid yet dynamically impossible, and it is trajectory generation that enforces velocity, acceleration and jerk limits so the motion is actually executable.",
    related: ["path-planning", "jacobian"],
  },
  {
    slug: "kalman-filter",
    term: "Kalman Filter",
    category: "estimation",
    simple: "A way to combine a noisy sensor with a prediction to get a better answer than either.",
    technical:
      "A recursive optimal estimator for linear systems with Gaussian noise. It alternates a predict step, propagating state and covariance through the motion model, with an update step that blends the prediction and measurement in inverse proportion to their covariances. The Extended and Unscented variants handle non-linear models by local linearisation and by deterministic sampling respectively.",
    related: ["sensor-fusion", "imu", "particle-filter"],
  },
  {
    slug: "particle-filter",
    term: "Particle Filter",
    category: "estimation",
    simple: "Guessing where you are with hundreds of guesses, then keeping the ones that fit.",
    technical:
      "A recursive Bayesian estimator representing the posterior with a weighted sample set. Particles propagate through the motion model, are reweighted by measurement likelihood, and are resampled to concentrate on high-probability regions. It handles arbitrary non-linear, non-Gaussian and multi-modal distributions — which is exactly what global localisation needs, since the robot may plausibly be in several corridors at once.",
    related: ["kalman-filter", "slam", "odometry"],
  },
  {
    slug: "sensor-fusion",
    term: "Sensor Fusion",
    category: "estimation",
    simple: "Combining several sensors so their strengths cover each other's weaknesses.",
    technical:
      "Combining measurements from multiple sensors into a single estimate with lower uncertainty than any one alone. It works when the sensors' error characteristics are complementary — a gyroscope is accurate over short intervals but drifts, an accelerometer is noisy but drift-free — and it requires each sensor's uncertainty to be characterised honestly, since a filter that trusts a bad sensor is worse than no filter.",
    related: ["kalman-filter", "imu", "odometry"],
  },
  {
    slug: "plc",
    term: "Programmable Logic Controller",
    abbreviation: "PLC",
    category: "industrial",
    simple: "The industrial computer that runs the machinery around the robot.",
    technical:
      "A ruggedised industrial controller executing a cyclic scan of inputs, program logic and outputs with deterministic timing. In a robot cell the PLC is usually the sequence master: it owns the safety interlocks, conveyors and fixtures, and hands the robot discrete start and completion signals over digital I/O or a fieldbus.",
    related: ["fieldbus", "digital-io", "safety-plc"],
  },
  {
    slug: "fieldbus",
    term: "Fieldbus",
    category: "industrial",
    simple: "The industrial network that lets factory machines talk to each other.",
    technical:
      "An industrial communication network connecting controllers to distributed devices. EtherNet/IP, PROFINET and EtherCAT run over Ethernet hardware with real-time scheduling layered on top; Modbus RTU and older buses use serial links. The distinguishing property is bounded, predictable cycle time, which ordinary Ethernet does not provide.",
    related: ["plc", "digital-io"],
  },
  {
    slug: "digital-io",
    term: "Digital I/O",
    category: "industrial",
    simple: "Simple on/off wires between machines — the industrial equivalent of a light switch.",
    technical:
      "Discrete binary signals exchanged between controllers, typically 24 V DC in industrial equipment, in sourcing (PNP) or sinking (NPN) configurations that must match on both ends. Despite the availability of fieldbuses, hard-wired digital I/O remains the standard for simple handshakes precisely because it is trivially diagnosable with a meter.",
    related: ["plc", "fieldbus"],
  },
  {
    slug: "safety-plc",
    term: "Safety Controller",
    category: "industrial",
    simple: "A separate, certified controller whose only job is stopping things safely.",
    technical:
      "A controller certified to a functional safety standard (ISO 13849 performance level or IEC 62061 SIL) that handles emergency stops, guard interlocks, light curtains and safe-speed monitoring. It is physically and logically separate from the process controller and uses redundant, cross-checked channels, so no single fault — including a fault in the standard control system — can defeat the safety function.",
    related: ["plc", "estop", "collaborative-robot"],
  },
  {
    slug: "estop",
    term: "Emergency Stop",
    abbreviation: "E-stop",
    category: "industrial",
    simple: "The big red button that cuts power and stops everything immediately.",
    technical:
      "A manually actuated, mechanically latching safety device that removes power from the actuators via the safety circuit. Category 0 removes power immediately; Category 1 performs a controlled deceleration and then removes power, which is preferred where an abrupt stop would itself be hazardous. An e-stop is a complement to safeguarding, never a substitute for it.",
    related: ["safety-plc", "collaborative-robot"],
  },
  {
    slug: "collaborative-robot",
    term: "Collaborative Robot",
    abbreviation: "Cobot",
    category: "industrial",
    simple: "A robot designed to work next to people without a safety fence.",
    technical:
      "A manipulator designed for operation in a shared workspace, using power and force limiting, speed and separation monitoring, hand guiding, or safety-rated monitored stop. The critical and widely misunderstood point is that the safety rating belongs to the application, not the robot: a force-limited arm holding a knife or a hot workpiece still requires guarding, and every collaborative installation needs its own risk assessment.",
    related: ["safety-plc", "estop", "payload"],
  },
  {
    slug: "point-cloud",
    term: "Point Cloud",
    category: "perception",
    simple: "A 3D scan stored as thousands of individual points in space.",
    technical:
      "An unordered set of 3D points, optionally carrying colour, intensity or surface normals, produced by LiDAR, stereo or structured-light sensors. Being unordered and variable in size, point clouds resist direct use by convolutional networks, so pipelines typically voxelise, project to range images, or use architectures designed for unordered sets.",
    related: ["lidar", "depth-camera", "slam"],
  },
  {
    slug: "depth-camera",
    term: "Depth Camera",
    category: "perception",
    simple: "A camera that also measures how far away each pixel is.",
    technical:
      "A sensor producing per-pixel range alongside colour, by stereo disparity, projected structured light, or time-of-flight. Stereo needs scene texture and fails on blank walls; structured light is precise indoors but washed out by sunlight; time-of-flight is robust to texture but suffers multi-path error in corners. Depth quality is never uniform across the frame, and treating it as such is a common source of grasp failures.",
    related: ["point-cloud", "camera-calibration", "lidar"],
  },
  {
    slug: "camera-calibration",
    term: "Camera Calibration",
    category: "perception",
    simple: "Measuring a camera's exact lens properties so pixels can be turned into real distances.",
    technical:
      "Estimating the intrinsic parameters — focal lengths, principal point and lens distortion coefficients — and, for a robot, the extrinsic hand–eye transform between camera and robot frames. Without intrinsics a pixel cannot be converted to a ray; without extrinsics that ray cannot be expressed in robot coordinates. Calibration error propagates directly into placement error at the tool.",
    related: ["depth-camera", "point-cloud", "visual-servoing"],
  },
  {
    slug: "visual-servoing",
    term: "Visual Servoing",
    category: "perception",
    simple: "Using a live camera feed to steer the robot continuously toward a target.",
    technical:
      "Closed-loop control in which the feedback signal is derived from camera images. Position-based visual servoing reconstructs target pose and controls in Cartesian space, requiring good calibration; image-based visual servoing regulates image features directly and is largely immune to calibration error, at the cost of trajectories that can leave the workspace or the field of view.",
    related: ["camera-calibration", "jacobian", "closed-loop-control"],
  },
  {
    slug: "force-control",
    term: "Force Control",
    category: "control",
    simple: "Controlling how hard the robot pushes, instead of exactly where it goes.",
    technical:
      "Control strategies that regulate interaction force rather than position, used where a position-controlled robot contacting a rigid environment would generate destructive forces from millimetre errors. Impedance and admittance control shape the dynamic relationship between motion and force; hybrid control partitions directions into position-controlled and force-controlled subspaces.",
    related: ["jacobian", "closed-loop-control", "force-torque-sensor"],
  },
  {
    slug: "force-torque-sensor",
    term: "Force/Torque Sensor",
    category: "sensors",
    simple: "A sensor at the robot's wrist that feels pushes and twists in all directions.",
    technical:
      "A six-axis transducer measuring three force and three torque components, usually via strain gauges on a compliant structure. Raw readings include the tool's own weight and inertial loading, so gravity and dynamic compensation are prerequisites for meaningful contact measurement. Assembly, polishing and deburring applications depend on it.",
    related: ["force-control", "end-effector"],
  },
  {
    slug: "gazebo",
    term: "Gazebo",
    category: "software",
    simple: "A simulator where you can test a robot without owning one.",
    technical:
      "A physics-based robot simulator providing rigid-body dynamics, sensor models and a plugin interface matching real driver APIs, so the same control code runs against simulation and hardware. It is invaluable for logic and integration testing and unreliable for anything dominated by contact dynamics or unmodelled friction — a grasp that works in simulation is a hypothesis, not a result.",
    related: ["ros", "urdf", "digital-twin"],
  },
  {
    slug: "digital-twin",
    term: "Digital Twin",
    category: "industrial",
    simple: "A live virtual copy of a real machine, kept in sync with it.",
    technical:
      "A simulation model of a physical system continuously updated with data from that system, used for monitoring, offline programming, what-if analysis and predictive maintenance. It differs from an ordinary simulation in the live data link: the model tracks the specific machine's current state rather than a generic nominal one.",
    related: ["gazebo", "calibration"],
  },
  {
    slug: "calibration",
    term: "Robot Calibration",
    category: "industrial",
    simple: "Measuring a specific robot's real dimensions so its maths matches its body.",
    technical:
      "The process of identifying a specific robot's actual kinematic parameters — link lengths, joint offsets and axis misalignments — and loading them into the controller so the nominal model matches the physical machine. It converts good repeatability into good absolute accuracy, which is what makes offline programming and robot-to-robot program portability viable.",
    related: ["accuracy", "repeatability", "dh-parameters"],
  },
  {
    slug: "qos",
    term: "Quality of Service",
    abbreviation: "QoS",
    category: "software",
    simple: "Settings that decide whether ROS 2 messages are guaranteed to arrive or sent fast.",
    technical:
      "The DDS policy set governing ROS 2 communication: reliability (reliable versus best-effort), durability (whether late joiners receive past messages), history depth, and deadline or liveliness contracts. Publisher and subscriber policies must be compatible or no connection is established — and ROS 2 reports this by silence, not by error, making QoS mismatch the classic cause of a topic that lists correctly but never delivers.",
    related: ["ros-topic", "dds", "ros"],
  },
  {
    slug: "dds",
    term: "Data Distribution Service",
    abbreviation: "DDS",
    category: "software",
    simple: "The messaging technology underneath ROS 2 that finds nodes and moves data.",
    technical:
      "An OMG standard for real-time publish–subscribe middleware, providing decentralised automatic discovery, typed topics and configurable quality of service. Adopting it removed ROS 1's single point of failure in the master, and introduced the operational reality that discovery traffic is multicast — which is why ROS 2 nodes on the same subnet find each other unexpectedly unless domain IDs are managed.",
    related: ["ros", "qos", "ros-topic"],
  },
  {
    slug: "microcontroller",
    term: "Microcontroller",
    abbreviation: "MCU",
    category: "electronics",
    simple: "A small computer on one chip that runs a single program controlling hardware.",
    technical:
      "An integrated circuit combining a processor core, memory and peripherals — timers, ADCs, PWM generators and communication controllers — designed for deterministic real-time control. In robot architectures the MCU handles hard real-time work such as motor commutation and encoder counting, while a general-purpose computer above it runs perception and planning.",
    related: ["gpio", "pwm", "motor-driver"],
  },
];
