import type { TrackSource } from "./schema";

/**
 * The sixteen levels of the roadmap. Order is fixed: each level's outcome is a
 * prerequisite for the next, which is what lets the recommendation engine say
 * "you are ready for X" without a hand-maintained dependency table.
 */
export const tracks: TrackSource[] = [
  {
    slug: "orientation",
    level: 0,
    title: "Robotics Orientation",
    subtitle: "What robotics actually is, before any theory",
    description:
      "Start here if you have never studied robotics. You will learn what separates a robot from a machine, meet the major families of robots, and take apart a real one on paper to see how sensing, thinking and acting fit together.",
    outcome: "Look at any robot and name its sensors, actuators, controller and degrees of freedom.",
    accent: "cyan",
    icon: "compass",
  },
  {
    slug: "fundamentals",
    level: 1,
    title: "Robotics Fundamentals",
    subtitle: "Links, joints, workspace and the vocabulary of the field",
    description:
      "The mechanical language every robotics engineer shares. Degrees of freedom, revolute and prismatic joints, end effectors, payload, reach, accuracy versus repeatability, and how a robot's architecture determines what it can and cannot reach.",
    outcome: "Specify a robot for a task and justify the choice from its workspace and payload.",
    accent: "cyan",
    icon: "arm",
  },
  {
    slug: "programming",
    level: 2,
    title: "Programming Fundamentals",
    subtitle: "Python and C++ from the first line of code",
    description:
      "No prior programming assumed. Variables through object-oriented design in Python, then the parts of C++ that robotics actually uses, plus the Linux shell skills you need before ROS makes any sense.",
    outcome: "Write, structure and debug Python programs that control simulated robot hardware.",
    accent: "emerald",
    icon: "code",
  },
  {
    slug: "electronics",
    level: 3,
    title: "Electronics & Embedded Systems",
    subtitle: "From Ohm's law to driving real motors",
    description:
      "Voltage, current and resistance built up from water-pipe intuition to circuit analysis. Digital and analog signals, PWM, GPIO, transistors, motor drivers, power budgeting and the microcontroller that ties it together.",
    outcome: "Design and wire a safe motor-driver circuit and drive it from a microcontroller.",
    accent: "amber",
    icon: "circuit",
  },
  {
    slug: "sensors-actuators",
    level: 4,
    title: "Sensors & Actuators",
    subtitle: "How robots measure the world and act on it",
    description:
      "Every major sensing modality — ultrasonic, infrared, encoders, IMU, LiDAR, cameras, force/torque — and every actuator family, each covered with the same nine questions so you can compare them honestly.",
    outcome: "Choose the right sensor and actuator for a task and know their failure modes.",
    accent: "amber",
    icon: "wave",
  },
  {
    slug: "mathematics",
    level: 5,
    title: "Robot Mathematics",
    subtitle: "Maths taught entirely through robots",
    description:
      "Trigonometry, vectors, matrices, linear algebra, calculus and probability — every concept introduced by the robotics problem that needs it, never as abstract theory first.",
    outcome: "Read and write the vector and matrix maths used in robotics papers and libraries.",
    accent: "violet",
    icon: "sigma",
  },
  {
    slug: "kinematics",
    level: 6,
    title: "Kinematics",
    subtitle: "Turning joint angles into positions, and back",
    description:
      "Coordinate frames, rotation and homogeneous transformation matrices, DH parameters, forward kinematics for 2-link through 6-DOF arms, and the several honest ways to solve inverse kinematics.",
    outcome: "Compute where a robot's tool is, and what joint angles put it where you want.",
    accent: "violet",
    icon: "axes",
  },
  {
    slug: "control",
    level: 7,
    title: "Robot Control",
    subtitle: "Feedback, PID and making motion behave",
    description:
      "Open versus closed loop, what feedback really buys you, each PID term derived from the problem it solves, practical tuning procedures, and the difference between position, velocity and torque control.",
    outcome: "Tune a PID controller and diagnose overshoot, oscillation and steady-state error.",
    accent: "cyan",
    icon: "gauge",
  },
  {
    slug: "mobile-robotics",
    level: 8,
    title: "Mobile Robotics",
    subtitle: "Robots that drive, and know where they are",
    description:
      "Differential drive, Ackermann steering and omnidirectional bases; wheel odometry and why it drifts; localisation, mapping, path planning and obstacle avoidance.",
    outcome: "Build a robot that maps a space, localises in it and navigates to a goal.",
    accent: "emerald",
    icon: "rover",
  },
  {
    slug: "manipulators",
    level: 9,
    title: "Robot Manipulators",
    subtitle: "Industrial arms, tooling and motion types",
    description:
      "Six-axis, SCARA, delta and collaborative architectures; grippers and end-of-arm tooling; TCP, tool frames and user frames; joint, linear and circular motion, and when each is the right choice.",
    outcome: "Program an industrial arm's motion and set up its tool and user frames correctly.",
    accent: "violet",
    icon: "gripper",
  },
  {
    slug: "ros2",
    level: 10,
    title: "ROS 2",
    subtitle: "The framework the industry actually runs on",
    description:
      "From zero: nodes, topics, messages, services, actions and parameters; then DDS and QoS, TF2, URDF, RViz, Gazebo, ros2_control, MoveIt 2 and Nav2 — with every line of the first programs explained.",
    outcome: "Build, launch and debug a multi-node ROS 2 system with your own message flow.",
    accent: "cyan",
    icon: "nodes",
  },
  {
    slug: "computer-vision",
    level: 11,
    title: "Computer Vision",
    subtitle: "From pixels to pick-and-place",
    description:
      "Images as numbers, colour spaces, filtering and thresholding, feature detection, camera calibration, depth cameras and the geometry that turns a pixel into a position the robot can reach for.",
    outcome: "Detect and locate an object in a camera image and convert it to robot coordinates.",
    accent: "emerald",
    icon: "camera",
  },
  {
    slug: "ai-ml",
    level: 12,
    title: "AI & Machine Learning",
    subtitle: "Learned perception and learned behaviour",
    description:
      "Supervised and unsupervised learning, neural networks and CNNs, object detection and classification, and reinforcement learning — always framed by what a robot does with the output.",
    outcome: "Integrate a trained model into a robot's perception-decision-action loop.",
    accent: "violet",
    icon: "brain",
  },
  {
    slug: "industrial",
    level: 13,
    title: "Industrial Robotics",
    subtitle: "Robot cells, safety and factory integration",
    description:
      "How a real production cell is built: safety circuits, e-stops, scanners and safety planes; PLC communication over Ethernet/IP, PROFINET and Modbus; conveyors, vision systems, machine tending, palletising and welding.",
    outcome: "Read a cell layout, understand its safety design and speak the integrator's language.",
    accent: "amber",
    icon: "factory",
  },
  {
    slug: "advanced",
    level: 14,
    title: "Advanced Robotics",
    subtitle: "SLAM, estimation and motion planning done properly",
    description:
      "Kalman and particle filters, sensor fusion, SLAM, graph and sampling-based planners from Dijkstra to RRT*, trajectory generation, force control, visual servoing and multi-robot coordination.",
    outcome: "Implement and reason about the estimation and planning stack of an autonomous robot.",
    accent: "rose",
    icon: "graph",
  },
  {
    slug: "capstones",
    level: 15,
    title: "Capstone Projects",
    subtitle: "Complete systems, end to end",
    description:
      "Multi-discipline builds that combine perception, planning, control and integration into a system you could defend in an interview: autonomous warehouse robots, vision-guided manipulation, and digital twins of real cells.",
    outcome: "Design, build and document a complete robotic system on your own.",
    accent: "rose",
    icon: "trophy",
  },
];
