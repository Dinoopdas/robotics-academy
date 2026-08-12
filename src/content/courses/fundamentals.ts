import type { CourseSource } from "../schema";

export const fundamentalsCourses: CourseSource[] = [
  {
    slug: "robot-anatomy",
    track: "fundamentals",
    title: "Robot Anatomy & Specifications",
    subtitle: "Links, joints, degrees of freedom, workspace — the shared vocabulary",
    description:
      "The mechanical language of robotics. After this course you can read a robot datasheet critically, explain why a spec sheet's reach number is misleading, and tell accuracy from repeatability — which is the distinction that separates people who have used robots from people who have read about them.",
    difficulty: "BEGINNER",
    tags: ["fundamentals", "mechanics", "specifications"],
    prerequisites: ["intro-to-robotics"],
    skills: ["robotics-literacy"],
    modules: [
      {
        slug: "structure",
        title: "How a robot is built",
        description: "Links, joints and the chains they form.",
        lessons: [
          {
            slug: "links-and-joints",
            title: "Links and joints",
            summary:
              "Every robot arm is rigid bodies connected by joints. Two joint types cover almost everything, and the choice between them shapes the whole machine.",
            estimatedMinutes: 11,
            keyTerms: ["revolute-joint", "prismatic-joint", "end-effector"],
            objectives: [
              "Distinguish links from joints and identify both on a real robot",
              "Compare revolute and prismatic joints on cost, workspace and resolution",
              "Explain why serial chains dominate and what parallel chains buy instead",
            ],
            blocks: [
              {
                type: "prose",
                text: "Strip away the covers and every robot arm is the same two things: **links** — rigid pieces that do not bend — and **joints** — the connections that allow controlled relative motion. That is the entire mechanical vocabulary.",
              },
              {
                type: "ladder",
                title: "What a joint is, at three levels",
                rungs: [
                  { label: "Plain", text: "A joint is the bit that moves — like your elbow." },
                  {
                    label: "Engineering",
                    text: "A joint is a connection between two links that permits motion in exactly one direction and blocks it in all others.",
                  },
                  {
                    label: "Formal",
                    text: "A joint is a kinematic constraint removing five of the six relative degrees of freedom between adjacent rigid bodies, leaving one actuated coordinate.",
                    math: "q_i \\in \\mathbb{R}, \\quad {}^{i-1}T_i = f(q_i)",
                  },
                ],
              },
              {
                type: "heading",
                level: 2,
                text: "Two joint types run the world",
              },
              {
                type: "compare",
                title: "Revolute vs prismatic",
                columns: [
                  {
                    heading: "Revolute — rotates",
                    tone: "neutral",
                    points: [
                      "Parameterised by an angle θ",
                      "Compact: the mechanism is not sized by its range",
                      "Rotary motors and encoders are cheap and sealed",
                      "Reachable volume grows with the square of link length",
                      "Resolution at the tool worsens as the arm extends",
                    ],
                  },
                  {
                    heading: "Prismatic — slides",
                    tone: "neutral",
                    points: [
                      "Parameterised by a distance d",
                      "Bulky: the mechanism must be as long as its stroke",
                      "Needs a screw, belt or rail — plus sealing",
                      "Simple rectangular workspace, easy to reason about",
                      "Constant resolution over the whole travel",
                    ],
                  },
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "Why arms are almost all revolute",
                text: "A revolute joint with a 300 mm link sweeps a large arc while occupying almost no space itself. A prismatic joint with 300 mm of travel needs at least 300 mm of hardware, plus rails to keep clean. In a machine that must fold into a small footprint and survive a decade in a factory, rotation wins nearly every time. Gantries flip that trade because their workspace **is** a box.",
              },
              {
                type: "diagram",
                name: "joint-types",
                title: "Revolute and prismatic joints",
                caption:
                  "The joint variable is θ for a revolute joint and d for a prismatic joint — one number each.",
              },
              {
                type: "heading",
                level: 2,
                text: "Serial chains and parallel chains",
              },
              {
                type: "prose",
                text: "Connect links end to end — base, joint, link, joint, link, tool — and you have a **serial chain**. This is the classic robot arm. Its advantages are a large workspace and simple, one-solution forward kinematics. Its costs are structural: every joint carries the weight of everything beyond it, so errors accumulate down the chain and the base joint must be enormous.",
              },
              {
                type: "prose",
                text: "A **parallel chain** connects the tool to the base through several independent legs at once. A delta robot is the standard example. Now the load is shared, the motors can all sit at the fixed base, and the moving mass is tiny — which is why deltas accelerate at 10 g and serial arms do not. The price is a much smaller workspace and forward kinematics that is genuinely hard.",
              },
              {
                type: "table",
                title: "The trade in one table",
                columns: ["Property", "Serial chain", "Parallel chain"],
                rows: [
                  ["Workspace", "Large", "Small relative to footprint"],
                  ["Stiffness", "Lower — cantilevered", "Much higher — triangulated"],
                  ["Moving mass", "High — carries its own motors", "Low — motors stay at the base"],
                  ["Forward kinematics", "Easy, one solution", "Hard, often numerical"],
                  ["Inverse kinematics", "Hard, multiple solutions", "Easy, closed form"],
                  ["Typical use", "General-purpose arms", "High-speed picking, motion platforms"],
                ],
              },
              {
                type: "callout",
                tone: "note",
                title: "The kinematics inversion is not a coincidence",
                text: "Serial robots have easy forward and hard inverse kinematics. Parallel robots have exactly the opposite. It falls out of the geometry: in a parallel machine each leg's length is an independent function of the platform pose, so going from pose to leg lengths is direct — which is the inverse problem. Level 6 makes this concrete.",
              },
              {
                type: "check",
                question:
                  "A machine must place components on circuit boards: fast, light payload, over a flat tray. Serial or parallel?",
                hint: "What is the workspace shape, and what dominates the cycle time?",
                answer:
                  "Parallel — or the SCARA compromise. The workspace is a shallow flat region, so the parallel machine's small volume costs nothing, and the payload is grams, so its low moving mass buys enormous acceleration. Cycle time is dominated by acceleration, not top speed, which is precisely where parallel geometry wins.",
              },
              {
                type: "summary",
                points: [
                  "Robots are rigid links joined by joints that each permit exactly one motion",
                  "Revolute joints dominate because they are compact and use cheap sealed rotary hardware",
                  "Serial chains give large workspaces; parallel chains give stiffness and acceleration",
                  "Serial and parallel machines have opposite kinematic difficulty, and for a structural reason",
                ],
              },
            ],
            quiz: {
              title: "Links and joints",
              questions: [
                {
                  prompt: "Why are revolute joints far more common than prismatic joints in robot arms?",
                  explanation:
                    "A prismatic mechanism must physically be as long as its stroke; a revolute joint sweeps a large arc from a compact housing, using cheap sealed rotary parts.",
                  answers: [
                    { text: "They are compact — the mechanism is not sized by its range of motion", correct: true },
                    { text: "They are more accurate in every case" },
                    { text: "They can carry more weight in every case" },
                    { text: "Prismatic joints cannot be motorised" },
                  ],
                },
                {
                  prompt: "A delta robot has motors mounted at the fixed base. What is the main benefit?",
                  explanation:
                    "Keeping motor mass off the moving structure makes the moving mass very low, which is what allows extreme acceleration.",
                  answers: [
                    { text: "Very low moving mass, so very high acceleration", correct: true },
                    { text: "A larger workspace" },
                    { text: "Simpler forward kinematics" },
                    { text: "It removes the need for encoders" },
                  ],
                },
              ],
            },
          },
          {
            slug: "degrees-of-freedom",
            title: "Degrees of freedom",
            summary:
              "Why six is the magic number, what four-axis robots give up, and what redundancy buys you when you go past six.",
            estimatedMinutes: 13,
            keyTerms: ["dof", "workspace", "singularity"],
            objectives: [
              "Explain why a rigid body in space has exactly six degrees of freedom",
              "Determine the DOF of a serial mechanism by inspection",
              "Describe what four-axis robots trade away and what a seventh axis buys",
            ],
            blocks: [
              {
                type: "prose",
                text: "Degrees of freedom is the most load-bearing concept in mechanical robotics. Get it right and robot specifications suddenly make sense.",
              },
              {
                type: "heading",
                level: 2,
                text: "Six, and why exactly six",
              },
              {
                type: "prose",
                text: "Hold a mug. To tell someone exactly where it is and how it is oriented, you must specify **six** numbers and no fewer:",
              },
              {
                type: "list",
                title: "The six numbers",
                style: "number",
                items: [
                  "x — how far left or right",
                  "y — how far forward or back",
                  "z — how far up or down",
                  "roll — rotation about the x axis",
                  "pitch — rotation about the y axis",
                  "yaw — rotation about the z axis",
                ],
              },
              {
                type: "math",
                title: "The pose of a rigid body",
                latex: "\\text{pose} = (x,\\; y,\\; z,\\; \\phi,\\; \\theta,\\; \\psi) \\in \\mathbb{R}^{3} \\times SO(3)",
                where: [
                  { symbol: "x, y, z", meaning: "position of the body origin", unit: "m" },
                  { symbol: "\\phi, \\theta, \\psi", meaning: "roll, pitch, yaw", unit: "rad" },
                  { symbol: "SO(3)", meaning: "the group of 3D rotations — three independent parameters" },
                ],
                note: "Three for position, three for orientation. There is no seventh independent quantity to specify.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "The consequence",
                text: "A robot needs **at least six independently actuated joints** to place a tool at an arbitrary position in an arbitrary orientation. Fewer joints means some poses are unreachable — not far away, but geometrically impossible.",
              },
              {
                type: "interactive",
                widget: "dof-explorer",
                title: "Feel the constraint",
                instructions:
                  "Toggle joints on and off, then try to drag the tool to the marked target with a specific orientation. With fewer than the required joints the target simply cannot be met — which is the point.",
              },
              {
                type: "heading",
                level: 2,
                text: "Counting DOF on a real robot",
              },
              {
                type: "prose",
                text: "For a serial chain the rule is refreshingly simple: **count the independently actuated joints**. A gripper opening and closing is usually not counted, because it does not change the tool's pose — it is tooling, not an axis.",
              },
              {
                type: "table",
                title: "DOF by architecture",
                columns: ["Robot", "DOF", "What it can do", "What it cannot do"],
                rows: [
                  ["SCARA", "4", "x, y, z and rotation about vertical", "Tilt the tool off vertical"],
                  ["Delta (3-arm)", "3", "x, y, z — orientation fixed", "Rotate the tool at all"],
                  ["Delta + wrist", "4", "x, y, z and one rotation", "Full orientation control"],
                  ["Standard industrial arm", "6", "Any reachable pose, any orientation", "Choose among multiple elbow solutions freely"],
                  ["Collaborative arm (7-axis)", "7", "Any pose, plus reconfigure the elbow", "—"],
                  ["Mobile manipulator", "6 + 3", "Arm poses anywhere the base can drive", "—"],
                ],
              },
              {
                type: "prose",
                text: "A SCARA robot has four axes, and that is a deliberate choice, not a limitation to apologise for. Electronics assembly means picking a part off a tray and placing it flat on a board. The tool never needs to tilt. Removing two axes makes the machine cheaper, stiffer against vertical insertion forces, and considerably faster.",
              },
              {
                type: "heading",
                level: 2,
                text: "The seventh axis",
              },
              {
                type: "prose",
                text: "If six is enough for any pose, why do collaborative arms have seven? Because with exactly six, each reachable pose has a small finite set of joint solutions — you take what the geometry gives you. Add a seventh and the arm becomes **redundant**: infinitely many joint configurations reach the same tool pose.",
              },
              {
                type: "list",
                title: "What redundancy buys",
                style: "check",
                items: [
                  "Reach around an obstacle while keeping the tool exactly where it needs to be",
                  "Move the elbow away from a person without disturbing the task",
                  "Steer the arm away from singularities during a move",
                  "Keep joints away from their travel limits mid-path",
                ],
              },
              {
                type: "callout",
                tone: "warning",
                title: "Redundancy is not free",
                text: "With seven axes the inverse kinematics has infinitely many solutions, so the planner needs a secondary objective — minimise joint motion, maximise distance from limits, avoid obstacles — to pick one. That extra machinery is exactly why seven-axis arms need more capable software, and why their motion can look unpredictable to an operator watching the elbow drift.",
              },
              {
                type: "example",
                title: "Why a 4-axis robot cannot do this job",
                scenario:
                  "A SCARA is asked to insert a screw into a hole drilled at 20° from vertical on a sloped bracket.",
                steps: [
                  "The screw axis must align with the hole axis, which is tilted 20°",
                  "A SCARA's tool axis is mechanically fixed vertical",
                  "No combination of its four joint values produces a tilted tool",
                ],
                result:
                  "The task is geometrically impossible for that machine — not slow, not imprecise, impossible. Either fixture the bracket so the hole points up, or use a 6-axis robot. Recognising this before buying is worth a lot of money.",
              },
              {
                type: "check",
                question:
                  "A robot has 6 joints plus a two-finger gripper. What is its DOF?",
                hint: "Does opening the gripper change where the tool is?",
                answer:
                  "Six. The gripper changes its own state but not the pose of the tool frame, so it is counted as tooling rather than as an axis. Manufacturers sell that robot as 6-axis.",
              },
              {
                type: "summary",
                points: [
                  "A rigid body in space has exactly six degrees of freedom: three translations, three rotations",
                  "Six independently actuated joints are the minimum for arbitrary pose",
                  "Fewer axes is a deliberate trade — SCARA gives up tilt to gain speed, stiffness and cost",
                  "A seventh axis creates redundancy: same pose, infinite configurations, at the cost of planner complexity",
                ],
              },
            ],
            quiz: {
              title: "Degrees of freedom",
              questions: [
                {
                  prompt: "How many degrees of freedom does a rigid body have in 3D space?",
                  explanation: "Three translations along the axes plus three rotations about them.",
                  answers: [
                    { text: "6", correct: true },
                    { text: "3" },
                    { text: "4" },
                    { text: "12" },
                  ],
                },
                {
                  prompt: "A SCARA robot cannot perform a task requiring the tool tilted 20° from vertical. Why?",
                  explanation:
                    "Its four axes provide x, y, z and rotation about the vertical only. No joint combination tilts the tool axis.",
                  answers: [
                    { text: "Its axes cannot produce a tilted tool orientation at all", correct: true },
                    { text: "It is not accurate enough" },
                    { text: "Its payload is too low" },
                    { text: "Its controller does not support angled moves" },
                  ],
                },
                {
                  prompt: "What does a seventh axis give a robot arm?",
                  explanation:
                    "Redundancy: infinitely many joint configurations achieve the same tool pose, so the elbow can be repositioned around obstacles without moving the tool.",
                  answers: [
                    { text: "Redundancy — the same tool pose from many joint configurations", correct: true },
                    { text: "The ability to reach poses that six axes cannot reach at all" },
                    { text: "Higher payload" },
                    { text: "Elimination of singularities" },
                  ],
                },
              ],
            },
          },
          {
            slug: "actuators-and-end-effectors",
            title: "Actuators and end effectors",
            summary:
              "What drives the joints, what goes on the end, and why the tool you bolt on changes the robot's specifications.",
            estimatedMinutes: 11,
            keyTerms: ["actuator", "end-effector", "payload", "tcp"],
            objectives: [
              "Compare electric, hydraulic and pneumatic actuation honestly",
              "Select an appropriate gripper type for a given part",
              "Explain how end-effector mass and offset consume rated payload",
            ],
            blocks: [
              {
                type: "prose",
                text: "The actuator makes a joint move; the end effector does the actual job. Both are chosen, not given, and both constrain everything else.",
              },
              {
                type: "table",
                title: "Actuation technologies",
                columns: ["Type", "Strength", "Weakness", "Where it wins"],
                rows: [
                  ["Electric (DC/BLDC + gearbox)", "Precise, clean, easily controlled", "Power density lower than hydraulics", "Almost all modern robots"],
                  ["Stepper", "Open-loop positioning, cheap", "Loses steps silently under overload", "3D printers, low-cost axes"],
                  ["Hydraulic", "Enormous force in a small actuator", "Leaks, noise, a whole power unit", "Heavy construction, large legged robots"],
                  ["Pneumatic", "Fast, cheap, naturally compliant", "Compressible — position control is poor", "Grippers, two-position actuators"],
                  ["Series elastic", "Measures and controls force well", "Reduced bandwidth by design", "Robots that touch people"],
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "Why pneumatics grip but do not position",
                text: "Air compresses. Push on a pneumatic cylinder and it moves, then springs back — that is exactly the wrong property for holding a position and exactly the right one for closing gently on a part. So pneumatics ended up owning grippers and clamps, and electric actuation owns the axes.",
              },
              {
                type: "heading",
                level: 2,
                text: "Choosing a gripper",
              },
              {
                type: "table",
                title: "Gripper families",
                columns: ["Type", "Good for", "Fails on"],
                rows: [
                  ["Two-finger parallel", "Rigid parts with parallel faces", "Fragile, irregular or slippery parts"],
                  ["Three-finger centring", "Round parts, self-centring", "Flat sheet"],
                  ["Vacuum / suction", "Flat, smooth, non-porous surfaces", "Porous, textured or oily surfaces"],
                  ["Magnetic", "Ferrous parts, very fast", "Non-ferrous; residual magnetism"],
                  ["Soft / compliant", "Delicate, variable-shape produce", "Precision placement, high force"],
                  ["Needle", "Fabric, foam, textiles", "Anything that must not be punctured"],
                ],
              },
              {
                type: "callout",
                tone: "mistake",
                title: "The classic payload mistake",
                text: "A 10 kg robot does **not** carry a 10 kg part. The rating includes the gripper. A 3 kg gripper leaves 7 kg — and that 7 kg only holds if the load sits at the rated centre-of-gravity offset from the flange. Move the mass further out and wrist torque rises proportionally; a long tool can exceed wrist limits at a fraction of the nominal payload.",
              },
              {
                type: "math",
                title: "Why the offset matters as much as the mass",
                latex: "\\tau_{\\text{wrist}} = m \\cdot g \\cdot d",
                where: [
                  { symbol: "\\tau_{\\text{wrist}}", meaning: "torque the wrist must hold", unit: "N·m" },
                  { symbol: "m", meaning: "mass of tool plus part", unit: "kg" },
                  { symbol: "g", meaning: "gravitational acceleration, 9.81", unit: "m/s²" },
                  { symbol: "d", meaning: "distance from flange to combined centre of gravity", unit: "m" },
                ],
                note: "2 kg at 100 mm is 1.96 N·m. The same 2 kg at 400 mm is 7.85 N·m — four times the wrist load, with no change in mass.",
              },
              {
                type: "example",
                title: "Sizing a real pick-and-place",
                scenario:
                  "Picking 1.5 kg castings from a bin and placing them in a machine. The vacuum gripper weighs 2.2 kg and its centre of gravity sits 180 mm from the flange.",
                steps: [
                  "Total moving mass = 2.2 + 1.5 = 3.7 kg",
                  "That already exceeds a 3 kg robot's rating",
                  "Combined centre of gravity is roughly 210 mm out once the casting is held",
                  "Wrist torque ≈ 3.7 × 9.81 × 0.21 ≈ 7.6 N·m",
                  "Add acceleration: at 2 g the effective load roughly triples",
                ],
                result:
                  "A 3 kg robot is not merely marginal, it is wrong. A 10 kg-class arm is the honest answer, and it is cheaper than discovering this after installation.",
              },
              {
                type: "check",
                question:
                  "Why must you tell the controller your tool's mass and centre of gravity, not just bolt it on?",
                hint: "The controller is computing something in advance about how much torque each joint needs.",
                answer:
                  "Because the controller uses that data for gravity compensation, dynamic torque calculation and collision detection. If it believes the tool is lighter than it is, it commands too little torque — the arm sags, paths deviate under acceleration, and collision detection either nuisance-trips or fails to trigger on a real impact.",
              },
              {
                type: "summary",
                points: [
                  "Electric actuation dominates; hydraulics survive on power density; pneumatics own grippers because air is compliant",
                  "Gripper choice is dictated by the part's surface, rigidity and material",
                  "Rated payload includes the gripper, and is only valid at the rated centre-of-gravity offset",
                  "Tool mass and CoG must be declared to the controller or gravity compensation and collision detection are both wrong",
                ],
              },
            ],
            quiz: {
              title: "Actuators and tooling",
              questions: [
                {
                  prompt: "A robot is rated for 10 kg payload. You fit a 3 kg gripper. What can it pick?",
                  explanation:
                    "The rating includes the end effector, so at most 7 kg — and only if the centre of gravity stays within the rated offset.",
                  answers: [
                    { text: "At most 7 kg, and only near the rated CoG offset", correct: true },
                    { text: "10 kg — the gripper does not count" },
                    { text: "13 kg" },
                    { text: "It depends only on speed" },
                  ],
                },
                {
                  prompt: "Why are pneumatic actuators poor for position control but good for grippers?",
                  explanation:
                    "Air is compressible, so position under load is springy — bad for holding a pose, good for closing gently on a part.",
                  answers: [
                    { text: "Air compresses, giving springy positioning but natural compliance", correct: true },
                    { text: "They are too slow for axes" },
                    { text: "They cannot generate enough force" },
                    { text: "They require hydraulic fluid" },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        slug: "specifications",
        title: "Reading the datasheet",
        description: "The numbers manufacturers publish, and what they actually mean.",
        lessons: [
          {
            slug: "accuracy-vs-repeatability",
            title: "Accuracy vs repeatability",
            summary:
              "The distinction that separates people who have used robots from people who have read about them — and the reason taught programs work at all.",
            estimatedMinutes: 12,
            keyTerms: ["accuracy", "repeatability", "calibration"],
            objectives: [
              "Define accuracy and repeatability precisely and distinguish them",
              "Explain why datasheets quote repeatability and not accuracy",
              "Describe when calibration is necessary and when it is a waste of money",
            ],
            blocks: [
              {
                type: "prose",
                text: "A robot datasheet says *repeatability ±0.02 mm*. Beginners read that as *this robot is accurate to 0.02 mm*. It does not say that, and the difference costs projects real money.",
              },
              {
                type: "compare",
                title: "Two different questions",
                columns: [
                  {
                    heading: "Repeatability",
                    tone: "positive",
                    points: [
                      "“If I send it to the same taught point 100 times, how tightly do the returns cluster?”",
                      "Typically ±0.02 to ±0.1 mm on an industrial arm",
                      "This is the number on the datasheet",
                      "Depends on mechanical backlash, encoder resolution, thermal stability",
                    ],
                  },
                  {
                    heading: "Accuracy",
                    tone: "negative",
                    points: [
                      "“If I command x = 500.000 mm, where does the tool actually go?”",
                      "Often several millimetres out, uncalibrated",
                      "Rarely published",
                      "Depends on how well the controller's model matches this physical robot",
                    ],
                  },
                ],
              },
              {
                type: "diagram",
                name: "accuracy-repeatability",
                title: "The dartboard picture",
                caption:
                  "Industrial robots are the bottom-left case: tight cluster, wrong place. Calibration moves the cluster onto the target.",
              },
              {
                type: "heading",
                level: 2,
                text: "Why the gap exists",
              },
              {
                type: "prose",
                text: "The controller computes joint angles from a **model** of the robot: nominal link lengths, nominal joint axes, perfect right angles. The physical robot in front of you was manufactured to a tolerance. Its upper arm might be 500.3 mm where the model says 500.0 mm. Its axis-2 might be 0.05° off perpendicular.",
              },
              {
                type: "prose",
                text: "Those errors are **systematic and repeatable**. The robot goes to precisely the wrong place, every single time — which is exactly why repeatability stays excellent while accuracy suffers.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "This is why teaching works",
                text: "Jog the robot to where you want it, press record, and it stores **joint angles**. Play it back and the same joint angles reproduce the same physical pose — no model needed. Teaching sidesteps the accuracy problem entirely, which is why it remained the dominant programming method for decades.",
              },
              {
                type: "heading",
                level: 2,
                text: "When accuracy suddenly matters",
              },
              {
                type: "list",
                title: "Cases where teaching is not enough",
                style: "bullet",
                items: [
                  "**Offline programming** — a path generated from CAD is in Cartesian coordinates, so the model must match reality",
                  "**Vision guidance** — the camera reports a position in millimetres, and the robot must actually go there",
                  "**Robot replacement** — swapping in a new arm should not mean re-teaching a thousand points",
                  "**Multi-robot cells** — programs shared between arms need each arm's model to be true",
                ],
              },
              {
                type: "prose",
                text: "The fix is **calibration**: measure the real robot with a laser tracker or a calibration artefact, solve for its actual kinematic parameters, and load those into the controller. A well-calibrated arm can reach 0.2 mm absolute accuracy — a ten-fold improvement, at the cost of a measurement session.",
              },
              {
                type: "example",
                title: "The failure this predicts",
                scenario:
                  "A cell is programmed offline from CAD. In simulation the gripper closes perfectly around the part. On the real robot it misses by 3 mm and crushes the part's edge.",
                steps: [
                  "The CAD model describes an ideal robot",
                  "The physical robot's links differ by fractions of a millimetre, and its axes by fractions of a degree",
                  "Those small errors compound over six joints into a few millimetres at the tool",
                  "Repeatability is fine — it misses by the same 3 mm every cycle",
                ],
                result:
                  "Two honest fixes: calibrate the robot so the model matches it, or touch up each taught point on the real machine. Production cells routinely do both.",
              },
              {
                type: "callout",
                tone: "warning",
                title: "Repeatability is quoted under ideal conditions",
                text: "Datasheet figures assume constant temperature, rated payload and a specific test pose. A robot that has just warmed up from cold can drift several times its quoted repeatability over the first hour, as the links thermally expand. High-precision cells warm the robot up before the first good part.",
              },
              {
                type: "check",
                question:
                  "A robot places parts perfectly from a taught program. A vision system is added and placement becomes erratic. What changed?",
                hint: "What coordinate system does each method work in?",
                answer:
                  "The task moved from joint space to Cartesian space. Taught points replay joint angles and never invoke the kinematic model, so accuracy is irrelevant. Vision reports a Cartesian target, forcing the controller to use inverse kinematics — and now the model's error shows up directly as placement error. The robot did not change; the demand on it did.",
              },
              {
                type: "summary",
                points: [
                  "Repeatability is return-to-the-same-place; accuracy is go-to-the-commanded-place",
                  "Datasheets quote repeatability because it is excellent; accuracy is often ten times worse",
                  "The gap is systematic model error, which is exactly why taught programs work",
                  "Accuracy starts to matter the moment coordinates come from outside the robot: CAD, vision, or another arm",
                ],
              },
            ],
            quiz: {
              title: "Accuracy vs repeatability",
              questions: [
                {
                  prompt: "A datasheet says repeatability ±0.02 mm. What does that tell you about absolute accuracy?",
                  explanation:
                    "Essentially nothing. Repeatability measures clustering on return; accuracy measures agreement with the commanded coordinate, and is typically far worse.",
                  answers: [
                    { text: "Very little — accuracy is often millimetres, and is measured differently", correct: true },
                    { text: "Accuracy is also ±0.02 mm" },
                    { text: "Accuracy is better than ±0.02 mm" },
                    { text: "Accuracy is exactly double the repeatability" },
                  ],
                },
                {
                  prompt: "Why do taught programs work well despite poor absolute accuracy?",
                  explanation:
                    "Teaching records joint angles. Replaying the same joint angles reproduces the same physical pose without ever consulting the kinematic model.",
                  answers: [
                    { text: "Teaching stores joint angles, so the kinematic model is never used", correct: true },
                    { text: "Teaching automatically calibrates the robot" },
                    { text: "Taught points are stored in Cartesian coordinates" },
                    { text: "Accuracy only matters at high speed" },
                  ],
                },
                {
                  prompt: "Which situation most requires a calibrated robot?",
                  explanation:
                    "Offline programming supplies Cartesian coordinates from CAD, so the controller's model must match the physical robot.",
                  answers: [
                    { text: "Running a path generated offline from a CAD model", correct: true },
                    { text: "Replaying a program taught on that same robot" },
                    { text: "Jogging the robot by hand" },
                    { text: "Running the same taught program at lower speed" },
                  ],
                },
              ],
            },
          },
          {
            slug: "workspace-and-reach",
            title: "Workspace, reach and singularities",
            summary:
              "Why the reach number on a datasheet describes a volume the robot cannot fully use, and why arms slow to a crawl in certain poses.",
            estimatedMinutes: 12,
            keyTerms: ["workspace", "reach", "singularity", "dof"],
            objectives: [
              "Distinguish reachable from dexterous workspace",
              "Explain why a fully extended arm is a bad place to work",
              "Recognise the three classic singularities and their operational symptoms",
            ],
            blocks: [
              {
                type: "prose",
                text: "A datasheet says *reach: 1300 mm*. That number describes a sphere the robot's wrist centre can touch. It does not describe where the robot can actually do useful work — and the gap between the two is large.",
              },
              {
                type: "heading",
                level: 2,
                text: "Two workspaces, not one",
              },
              {
                type: "compare",
                title: "Reachable vs dexterous",
                columns: [
                  {
                    heading: "Reachable workspace",
                    tone: "neutral",
                    points: [
                      "Every position the tool can reach in at least one orientation",
                      "Roughly the sphere implied by the reach figure",
                      "What the marketing diagram shows",
                    ],
                  },
                  {
                    heading: "Dexterous workspace",
                    tone: "positive",
                    points: [
                      "Every position reachable in any orientation",
                      "Substantially smaller — a shell well inside the outer limit",
                      "Where you should actually place the work",
                    ],
                  },
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "The extremes are useless in both directions",
                text: "At full extension the arm can only point one way — it is out of joint travel to reorient. Close to the base, links collide with each other and with the robot's own body. The usable band is a shell somewhere between roughly 30% and 85% of full reach, and cell layouts should be designed around that shell rather than the datasheet sphere.",
              },
              {
                type: "diagram",
                name: "workspace-shell",
                title: "Reachable vs dexterous workspace",
                caption:
                  "The outer sphere is what the datasheet sells. The shaded shell is where work should be placed.",
              },
              {
                type: "heading",
                level: 2,
                text: "Singularities",
              },
              {
                type: "prose",
                text: "A **singularity** is a configuration where the robot loses the ability to move in some direction. It is not a software bug and it is not a limitation of a particular manufacturer — it is a property of the geometry, and every serial arm has them.",
              },
              {
                type: "prose",
                text: "The operational symptom is dramatic and confusing the first time you meet it: you command a slow straight-line move, and the robot either stops with a speed-limit fault or one joint suddenly spins at maximum rate.",
              },
              {
                type: "table",
                title: "The three classic singularities",
                columns: ["Name", "Configuration", "What you observe"],
                rows: [
                  ["Wrist", "Axes 4 and 6 become collinear", "Axis 4 and 6 counter-rotate at huge speed; the most common in practice"],
                  ["Shoulder", "Wrist centre passes over the axis-1 centreline", "Axis 1 must flip 180° almost instantly"],
                  ["Elbow", "Arm fully extended, elbow straight", "Motion toward the target becomes impossible; controller faults"],
                ],
              },
              {
                type: "math",
                title: "Why the speed goes to infinity",
                latex: "\\dot{q} = J(q)^{-1}\\,\\dot{x}",
                where: [
                  { symbol: "\\dot{q}", meaning: "joint velocities the controller must command", unit: "rad/s" },
                  { symbol: "J(q)", meaning: "the Jacobian at the current configuration" },
                  { symbol: "\\dot{x}", meaning: "the commanded tool velocity", unit: "m/s" },
                ],
                note: "At a singularity J loses rank, so its inverse blows up. A perfectly modest commanded tool speed demands unbounded joint speed. The controller cannot deliver it, so it faults — which is the correct behaviour.",
              },
              {
                type: "interactive",
                widget: "arm-fk",
                title: "Drive an arm into a singularity",
                instructions:
                  "Extend the arm until the elbow is nearly straight, then try to move the tool further outward. Watch how much joint motion a small tool motion demands as the elbow approaches 0°.",
                config: { showSingularityWarning: true },
              },
              {
                type: "list",
                title: "Working around singularities",
                style: "check",
                items: [
                  "Place the work in the dexterous shell, not near full extension",
                  "Use joint-space moves through awkward regions — they never invoke the Jacobian",
                  "Rotate the fixture or the robot base so the path avoids the wrist alignment",
                  "On a 7-axis arm, use the redundancy to steer the elbow around the singular configuration",
                ],
              },
              {
                type: "check",
                question:
                  "A robot runs a taught program fine, but faults with a speed error when the same path is commanded as a linear move. Why?",
                hint: "Which motion type has to solve for Cartesian velocity?",
                answer:
                  "A joint move interpolates between joint angles and never asks what the tool's Cartesian velocity is, so it passes through singular configurations untroubled. A linear move must hold constant tool velocity, which requires inverting the Jacobian — and near a singularity that demands joint speeds the robot cannot produce. Same path, different motion type, different mathematics.",
              },
              {
                type: "summary",
                points: [
                  "The reach figure describes the wrist centre's sphere, not the usable working volume",
                  "The dexterous workspace — reachable in any orientation — is a shell well inside that sphere",
                  "Singularities are geometric, unavoidable, and present on every serial arm",
                  "At a singularity the Jacobian loses rank, so bounded tool speed demands unbounded joint speed",
                  "Joint moves pass through singularities; linear moves cannot",
                ],
              },
            ],
            quiz: {
              title: "Workspace and singularities",
              questions: [
                {
                  prompt: "What is the dexterous workspace?",
                  explanation:
                    "The set of positions the tool can reach in any orientation — a shell substantially smaller than the reachable workspace.",
                  answers: [
                    { text: "The positions reachable in any orientation", correct: true },
                    { text: "The full sphere implied by the reach specification" },
                    { text: "The area the robot can reach at maximum speed" },
                    { text: "The region where repeatability is best" },
                  ],
                },
                {
                  prompt: "Why does a robot fault near a singularity?",
                  explanation:
                    "The Jacobian loses rank there, so a modest commanded tool velocity requires joint velocities that exceed the robot's limits.",
                  answers: [
                    { text: "Bounded tool velocity demands unbounded joint velocity", correct: true },
                    { text: "The motors overheat" },
                    { text: "The encoders lose count" },
                    { text: "The controller runs out of memory" },
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
