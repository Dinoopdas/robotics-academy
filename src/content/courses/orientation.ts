import type { CourseSource } from "../schema";

export const orientationCourses: CourseSource[] = [
  {
    slug: "intro-to-robotics",
    track: "orientation",
    title: "Introduction to Robotics",
    subtitle: "What a robot is, what it is not, and how the field is organised",
    description:
      "The starting point if you have never studied robotics. No maths, no code, no prior knowledge — just a clear, honest picture of what robots are, the families they fall into, and the sense–think–act loop that every one of them runs.",
    difficulty: "BEGINNER",
    tags: ["beginner", "concepts", "orientation"],
    skills: ["robotics-literacy"],
    modules: [
      {
        slug: "what-is-robotics",
        title: "What robotics actually is",
        description:
          "Definitions first — but definitions that survive contact with real machines, including the awkward edge cases.",
        lessons: [
          {
            slug: "what-is-a-robot",
            title: "What is a robot?",
            summary:
              "A washing machine follows a program. A thermostat senses and reacts. Neither is a robot. This lesson finds the line that actually separates robots from everything else.",
            estimatedMinutes: 12,
            keyTerms: ["actuator", "dof"],
            objectives: [
              "State the three capabilities a machine needs before it counts as a robot",
              "Apply the sense–think–act test to real machines and defend the verdict",
              "Explain why the boundary is genuinely fuzzy and why that is fine",
            ],
            blocks: [
              {
                type: "prose",
                text: "Ask ten robotics engineers to define *robot* and you will get ten definitions. That is not a failure of the field — it is a sign that the boundary is genuinely blurry. But there is a working definition that survives most of the awkward cases, and it is the one worth carrying with you.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "The working definition",
                text: "A **robot** is a machine that **senses** its environment, **decides** what to do based on what it sensed, and **acts** physically on the world — and can change its behaviour when the world changes.",
              },
              {
                type: "prose",
                text: "That last clause is the one doing the real work. Plenty of machines sense and act. What makes something feel like a robot is that the *connection between the two is not fixed in advance*.",
              },
              {
                type: "heading",
                level: 2,
                text: "The sense–think–act loop",
                kicker: "Every robot you will ever meet runs this loop, thousands of times a second",
              },
              {
                type: "flow",
                title: "The loop that defines the field",
                nodes: [
                  { label: "SENSE", detail: "Cameras, encoders, LiDAR, force sensors" },
                  { label: "THINK", detail: "Interpret the data, decide what to do", accent: true },
                  { label: "ACT", detail: "Motors, grippers, wheels" },
                  { label: "The world changes", detail: "…which the sensors then measure again" },
                ],
              },
              {
                type: "prose",
                text: "This loop is not a metaphor. When you get to ROS 2 in Level 10, you will literally write one program that publishes sensor data, another that decides, and a third that drives motors. The architecture of the software mirrors the architecture of the idea.",
              },
              {
                type: "heading",
                level: 2,
                text: "Applying the test",
              },
              {
                type: "table",
                title: "Is it a robot?",
                caption:
                  "The interesting cases are the borderline ones — they show where the definition strains.",
                columns: ["Machine", "Senses?", "Decides?", "Acts?", "Verdict"],
                rows: [
                  ["Washing machine", "Water level, temperature", "Follows a fixed program", "Motor, valves", "No — the program never adapts"],
                  ["Thermostat", "Temperature", "One rule, one threshold", "Switches a relay", "No — senses and acts, but does not decide"],
                  ["Robot vacuum", "Bump, cliff, optical flow", "Plans coverage, avoids obstacles", "Drives wheels, spins brushes", "Yes"],
                  ["Factory welding arm", "Joint encoders, seam tracker", "Follows a taught path, corrects for the seam", "Six motors, welding torch", "Yes"],
                  ["CNC milling machine", "Position feedback", "Executes fixed G-code", "Precise multi-axis motion", "Borderline — the industry usually says no"],
                  ["Self-driving car", "LiDAR, cameras, radar, GPS", "Continuous replanning", "Steering, throttle, brakes", "Yes — arguably the most demanding one"],
                ],
              },
              {
                type: "callout",
                tone: "note",
                title: "Why the CNC case matters",
                text: "A CNC machine is more precise than most robots and has more axes than many. It is excluded not because it is simple but because its behaviour is **fully determined before it starts**. Add a probe that measures the workpiece and adjusts the toolpath, and most engineers would start calling it a robot. The capability, not the hardware, is what moves it across the line.",
              },
              {
                type: "heading",
                level: 2,
                text: "Where the word came from",
              },
              {
                type: "prose",
                text: "The word entered English in 1921, from the Czech playwright Karel Čapek's play *R.U.R.* His brother Josef suggested it, from **robota** — forced labour. It described artificial workers, and it described them as a warning.",
              },
              {
                type: "prose",
                text: "That origin still shapes public expectations. People imagine humanoids because that is what the word was coined to mean. Actual robotics went a different way: the overwhelming majority of robots in the world are arms bolted to factory floors, and they look nothing like people. Being aware of that gap will make the rest of this curriculum easier to absorb.",
              },
              {
                type: "check",
                question:
                  "A greenhouse system measures soil moisture and opens a valve when it drops below a threshold. Robot or not?",
                hint: "Run it through sense, think, act — and ask whether the middle step ever changes.",
                answer:
                  "Not a robot. It senses and it acts, but the decision is a single fixed rule with no capacity to adapt. It is the thermostat case with different plumbing. Give it a camera, let it identify which plants are wilting and route water differently in response, and the answer changes.",
              },
              {
                type: "summary",
                points: [
                  "A robot senses, decides and acts — and the link between sensing and acting is not fixed in advance",
                  "The sense–think–act loop is the architecture of the whole field, not just a teaching device",
                  "Borderline cases like CNC machines are excluded on adaptability, not on complexity or precision",
                  "The word comes from a 1921 play about forced labour, which is why public expectations skew humanoid",
                ],
              },
            ],
            quiz: {
              title: "What is a robot?",
              questions: [
                {
                  prompt: "Which capability most clearly separates a robot from an ordinary automatic machine?",
                  explanation:
                    "Precision, motor count and programmability are all common to non-robots. The distinguishing property is that the response to sensor input is not fixed in advance.",
                  answers: [
                    { text: "It changes its behaviour in response to what it senses", correct: true },
                    { text: "It is more precise than a human" },
                    { text: "It has more than three motors" },
                    { text: "It can be reprogrammed" },
                  ],
                },
                {
                  prompt: "What are the three stages of the loop every robot runs?",
                  explanation:
                    "Sense, think, act. The whole curriculum is organised around these three: sensors, control and computation, then actuators.",
                  answers: [
                    { text: "Sense, think, act", correct: true },
                    { text: "Input, process, output" },
                    { text: "Plan, build, test" },
                    { text: "Measure, store, report" },
                  ],
                },
                {
                  prompt: "Why is a standard CNC milling machine usually not counted as a robot?",
                  explanation:
                    "It executes a toolpath decided entirely before the cut begins. Nothing it measures during operation changes what it does.",
                  answers: [
                    { text: "Its behaviour is fully determined before it starts running", correct: true },
                    { text: "It is not precise enough" },
                    { text: "It has too few axes" },
                    { text: "It has no motors" },
                  ],
                },
              ],
            },
          },
          {
            slug: "types-of-robots",
            title: "The families of robots",
            summary:
              "Industrial arms, collaborative robots, mobile robots, humanoids, drones, medical and agricultural machines — what each family is optimised for and why they look the way they do.",
            estimatedMinutes: 14,
            keyTerms: ["collaborative-robot", "payload", "reach"],
            objectives: [
              "Name the major robot families and the task each is optimised for",
              "Explain why industrial arms dominate by installed count",
              "Predict a robot's likely architecture from a description of its job",
            ],
            blocks: [
              {
                type: "prose",
                text: "Robots are not a spectrum from simple to advanced. They are a set of **families**, each shaped by the job it does. A surgical robot is not a better factory arm, and a factory arm is not a worse humanoid — they are answers to different questions.",
              },
              {
                type: "heading",
                level: 2,
                text: "Industrial arms — the ones that actually pay for the field",
              },
              {
                type: "prose",
                text: "Around four million industrial robots are installed worldwide, and they are the economic engine of robotics. A six-axis arm bolted to a floor, moving the same path a few million times, is the archetype. Optimised for **repeatability, speed and uptime**, not intelligence.",
              },
              {
                type: "callout",
                tone: "insight",
                title: "The number that explains industrial robotics",
                text: "A typical industrial arm repeats a taught position to within **±0.05 mm** — about half the width of a human hair — but its *absolute* accuracy may be several millimetres off. It hits the same spot every time; that spot just is not exactly where the maths says it should be. Level 9 explains why, and Level 13 explains what calibration does about it.",
              },
              {
                type: "table",
                title: "Robot families at a glance",
                columns: ["Family", "Optimised for", "Typical form", "Where you meet it"],
                rows: [
                  ["Industrial arm", "Repeatability, speed, payload", "6-axis serial arm, caged", "Welding, painting, machine tending"],
                  ["Collaborative arm", "Safe proximity to people", "Lightweight arm, force-limited", "Small-batch assembly, lab work"],
                  ["SCARA", "Fast planar pick-and-place", "4-axis, rigid vertically", "Electronics assembly"],
                  ["Delta", "Extremely fast light picking", "Parallel arms from above", "Food and packaging lines"],
                  ["Mobile robot (AMR)", "Navigating changing spaces", "Wheeled base, LiDAR", "Warehouses, hospitals"],
                  ["Drone / UAV", "Aerial coverage", "Multirotor or fixed wing", "Inspection, mapping, agriculture"],
                  ["Humanoid", "Human environments and tools", "Legs, arms, head", "Research, early logistics pilots"],
                  ["Surgical robot", "Precision, tremor filtering, scale", "Multi-arm teleoperated", "Operating theatres"],
                  ["Agricultural robot", "Outdoor autonomy, crop handling", "Rugged wheeled base", "Weeding, harvesting"],
                ],
              },
              {
                type: "heading",
                level: 2,
                text: "Why arms have six axes",
              },
              {
                type: "prose",
                text: "This is not a convention — it is geometry. A rigid object in space has exactly **six degrees of freedom**: it can translate along three axes and rotate about three axes. To place a tool at *any* position in *any* orientation, you need six independently controllable joints. Fewer, and some poses become unreachable. This is the single most load-bearing fact in the whole of mechanical robotics, and the next lesson unpacks it properly.",
              },
              {
                type: "compare",
                title: "Industrial arm vs collaborative arm",
                columns: [
                  {
                    heading: "Traditional industrial arm",
                    tone: "neutral",
                    points: [
                      "Fast — several metres per second at the tool",
                      "High payload, commonly 5–500 kg",
                      "Requires physical guarding and interlocks",
                      "Rigid, heavy, high stiffness",
                      "Cheapest per unit of throughput",
                    ],
                  },
                  {
                    heading: "Collaborative arm (cobot)",
                    tone: "neutral",
                    points: [
                      "Slower — speed is limited by the safety function",
                      "Lower payload, typically 3–20 kg",
                      "May operate near people after a risk assessment",
                      "Lightweight, force- and torque-sensing joints",
                      "Cheapest to deploy and redeploy",
                    ],
                  },
                ],
              },
              {
                type: "callout",
                tone: "mistake",
                title: "The most expensive misconception in the industry",
                text: "“It is a cobot, so it is safe without a fence.” **The safety rating belongs to the application, not the robot.** A force-limited arm holding a scalpel, a hot part or a sharp-edged sheet is still dangerous. Every collaborative installation needs its own risk assessment. Level 13 covers how those are actually done.",
              },
              {
                type: "heading",
                level: 2,
                text: "Why humanoids are hard and rare",
              },
              {
                type: "prose",
                text: "The humanoid form has one genuine advantage: the world is already built for it. Stairs, door handles, hand tools and workbenches all assume a human body. But legs are a control nightmare — a walking robot is a controlled fall, corrected continuously — and every kilogram of upper body must be carried by an actively balancing lower body. The field spent decades avoiding legs for good reason. Recent progress comes from cheaper actuators and learned controllers, both covered in Level 12.",
              },
              {
                type: "check",
                question:
                  "A company needs to move 20 kg boxes from a conveyor to a pallet, in a fenced area, all day, every day. Which family fits, and why not a cobot?",
                hint: "Think about payload, cycle time and whether people need to be nearby.",
                answer:
                  "A traditional industrial arm — specifically a palletising robot. The payload is above most cobot ratings, the task is fenced so collaborative operation buys nothing, and throughput matters, which is exactly what a cobot's safety-limited speed sacrifices. Paying the cobot premium here would buy a slower robot.",
              },
              {
                type: "summary",
                points: [
                  "Robot families are answers to different problems, not points on a quality scale",
                  "Industrial arms dominate by installed count because repeatability and uptime pay for themselves",
                  "Six axes is geometry: a rigid body has six degrees of freedom in space",
                  "Collaborative safety is a property of the whole application, never of the robot alone",
                ],
              },
            ],
            quiz: {
              title: "Robot families",
              questions: [
                {
                  prompt: "Why do general-purpose industrial arms have six axes?",
                  explanation:
                    "A rigid body in space has six degrees of freedom — three translations and three rotations — so six independent joints are the minimum for arbitrary pose.",
                  answers: [
                    { text: "Six degrees of freedom are needed to reach any position in any orientation", correct: true },
                    { text: "Six motors is the most a controller can drive" },
                    { text: "It matches the number of joints in a human arm" },
                    { text: "It is a safety standard requirement" },
                  ],
                },
                {
                  prompt: "A cobot is rated for collaborative operation. What follows?",
                  explanation:
                    "Nothing follows automatically. The safety rating applies to a specific application after a risk assessment — the tool and workpiece are part of the hazard.",
                  answers: [
                    { text: "Nothing yet — the application still needs its own risk assessment", correct: true },
                    { text: "It can be used fenceless with any tool" },
                    { text: "It cannot injure a person under any circumstances" },
                    { text: "It no longer needs an emergency stop" },
                  ],
                },
                {
                  prompt: "Which family would you expect on a high-speed food packaging line?",
                  explanation:
                    "Delta robots use lightweight parallel arms driven from above, giving very high acceleration for low payloads — exactly the packaging profile.",
                  answers: [
                    { text: "A delta robot", correct: true },
                    { text: "A humanoid" },
                    { text: "A 500 kg payload industrial arm" },
                    { text: "An autonomous mobile robot" },
                  ],
                },
              ],
            },
          },
          {
            slug: "sense-think-act",
            title: "Inside the loop: sensors, controllers, actuators",
            summary:
              "Open up the three stages. What each part actually is, what it costs, how fast it runs, and why the timing between them decides whether a robot works at all.",
            estimatedMinutes: 13,
            keyTerms: ["actuator", "encoder", "microcontroller", "closed-loop-control"],
            objectives: [
              "Name the physical components that implement each stage of the loop",
              "Explain why loop rate matters more than raw processing power",
              "Describe the layered architecture used by nearly every real robot",
            ],
            blocks: [
              {
                type: "prose",
                text: "You now know robots run a sense–think–act loop. This lesson opens each stage and shows the actual hardware — because the constraints of that hardware shape every design decision that follows.",
              },
              {
                type: "heading",
                level: 2,
                text: "Sense: turning the world into numbers",
              },
              {
                type: "prose",
                text: "A sensor converts a physical quantity into an electrical signal a computer can read. That is all. Every sensor answers exactly one narrow question, and a robot's perception is assembled from many narrow answers.",
              },
              {
                type: "table",
                title: "Sensors you will meet in Level 4",
                columns: ["Sensor", "Question it answers", "Typical rate", "Main weakness"],
                rows: [
                  ["Encoder", "How far has this joint turned?", "1–10 kHz", "Relative only, until homed"],
                  ["Ultrasonic", "How far is the nearest surface?", "10–40 Hz", "Wide beam, fooled by soft or angled surfaces"],
                  ["IMU", "Which way am I tilted, how fast am I turning?", "100–1000 Hz", "Gyro drifts, accelerometer is noisy"],
                  ["2D LiDAR", "What is the distance all around me?", "5–40 Hz", "One plane only; struggles with glass"],
                  ["Camera", "What does the scene look like?", "30–60 Hz", "No depth on its own; needs light"],
                  ["Force/torque", "How hard am I pushing?", "500–1000 Hz", "Reads the tool's own weight too"],
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "There is no sensor that measures 'where the robot is'",
                text: "Beginners look for a position sensor and find that nothing sells one. Position is **computed**, not measured: from wheel rotations, from matching a laser scan to a map, from a camera seeing a known landmark. Every one of those is an estimate with error. This single fact is why Levels 8 and 14 exist.",
              },
              {
                type: "heading",
                level: 2,
                text: "Think: usually three computers, not one",
              },
              {
                type: "prose",
                text: "Almost every serious robot has a **layered** control architecture, because the three layers have incompatible requirements. The bottom must be fast and utterly predictable; the top must be flexible and can afford to be slow.",
              },
              {
                type: "flow",
                title: "The layered architecture",
                direction: "vertical",
                nodes: [
                  { label: "High level — planning", detail: "Where should I go? What should I pick up? · 1–10 Hz · Linux PC" },
                  { label: "Mid level — control", detail: "What trajectory gets me there? · 100–1000 Hz · Real-time controller", accent: true },
                  { label: "Low level — drive", detail: "What current goes to this motor right now? · 10–40 kHz · Motor driver MCU" },
                ],
              },
              {
                type: "prose",
                text: "The rates matter. A vision system deciding where to grasp can take 200 ms and nobody notices. A current loop that misses its 25 µs deadline destroys a motor. Mixing those two responsibilities into one program on one machine is a classic beginner architecture, and it fails in ways that are very hard to debug.",
              },
              {
                type: "callout",
                tone: "warning",
                title: "Loop rate beats raw speed",
                text: "A control loop that runs at a **steady** 100 Hz outperforms one that averages 500 Hz but occasionally stalls for 50 ms. Controllers are designed around a fixed sample interval; when that interval jitters, the derivative term sees a spike that is not real and the robot twitches. **Predictability is worth more than throughput.**",
              },
              {
                type: "heading",
                level: 2,
                text: "Act: from a number back to motion",
              },
              {
                type: "prose",
                text: "An actuator turns electrical energy into motion. But a microcontroller pin can supply perhaps 20 mA, and a motor may want 5 A. Something has to bridge that gap, and that something is the **motor driver** — a power stage the controller switches on and off very fast to set an average voltage. Level 3 builds one.",
              },
              {
                type: "flow",
                title: "The full chain, one joint",
                nodes: [
                  { label: "Controller computes 'go 30% forward'" },
                  { label: "PWM signal — a fast on/off square wave", accent: true },
                  { label: "Motor driver switches battery current" },
                  { label: "Motor produces torque" },
                  { label: "Gearbox multiplies torque, divides speed" },
                  { label: "Joint moves — encoder measures how far" },
                  { label: "…back to the controller" },
                ],
              },
              {
                type: "example",
                title: "One iteration of a line-following robot",
                scenario:
                  "A small robot with two infrared sensors pointed at the floor and two driven wheels, trying to follow a black line.",
                steps: [
                  "SENSE — left IR reads 0.2 (dark, over the line), right reads 0.8 (bright, off the line)",
                  "THINK — the line is drifting left, so error = right − left = +0.6",
                  "THINK — apply a proportional gain: turn command = 0.6 × 0.5 = 0.3",
                  "ACT — left wheel gets 0.5 − 0.3 = 0.2, right wheel gets 0.5 + 0.3 = 0.8",
                  "The robot curves left, back toward the line",
                  "20 ms later the whole thing repeats with fresh readings",
                ],
                result:
                  "Fifty times a second, forever. That is the entire program — and it is a proportional controller, the P in PID. You will build exactly this in Level 7.",
              },
              {
                type: "check",
                question:
                  "Why would you put motor current control on a dedicated microcontroller instead of the main Linux computer?",
                hint: "Think about what happens when the operating system decides to do something else for 30 milliseconds.",
                answer:
                  "Because a general-purpose OS gives no timing guarantee. Linux may pause your program to service a network interrupt or swap memory, and a current loop that needs to run every 25 µs cannot tolerate a 30 ms pause — the motor sees uncontrolled current. A dedicated microcontroller runs one thing with hardware timers and hits its deadline every time.",
              },
              {
                type: "summary",
                points: [
                  "Each sensor answers one narrow question; perception is assembled from many of them",
                  "No sensor measures position — position is always computed, always an estimate with error",
                  "Robots layer control: planning at ~1 Hz, motion at ~1 kHz, current at ~10 kHz+",
                  "A steady loop rate matters more than a high average rate",
                  "A motor driver bridges the gap between logic-level signals and motor-level current",
                ],
              },
            ],
            quiz: {
              title: "Inside the loop",
              questions: [
                {
                  prompt: "Which of these does a robot NOT directly measure with a sensor?",
                  explanation:
                    "There is no position sensor. Position is computed from wheel rotations, scan matching or landmarks — always an estimate carrying error.",
                  answers: [
                    { text: "Its position in a room", correct: true },
                    { text: "How far a joint has rotated" },
                    { text: "Its angular rate about an axis" },
                    { text: "Distance to the nearest surface ahead" },
                  ],
                },
                {
                  prompt: "Why is a steady 100 Hz control loop better than one averaging 500 Hz with occasional stalls?",
                  explanation:
                    "Controllers assume a fixed sample interval. Jitter makes the derivative term see rate spikes that never happened, producing real motion errors.",
                  answers: [
                    { text: "Controllers assume a fixed sample interval; jitter corrupts their maths", correct: true },
                    { text: "100 Hz uses less electrical power" },
                    { text: "Higher rates always damage motors" },
                    { text: "Sensors cannot be read faster than 100 Hz" },
                  ],
                },
                {
                  prompt: "What sits between a microcontroller's output pin and a DC motor, and why?",
                  explanation:
                    "A motor driver. A GPIO pin supplies tens of milliamps; a motor needs amps. The driver switches the high current under logic control.",
                  answers: [
                    { text: "A motor driver, because a GPIO pin cannot supply motor-level current", correct: true },
                    { text: "Nothing — the pin drives the motor directly" },
                    { text: "An encoder, to measure the motor" },
                    { text: "A resistor, to limit motor speed" },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        slug: "reading-a-robot",
        title: "Reading a real robot",
        description:
          "Practical analysis skills: take a machine you have never seen and work out how it is built.",
        lessons: [
          {
            slug: "anatomy-of-a-mobile-robot",
            title: "Take apart a delivery robot",
            summary:
              "A guided teardown, on paper, of a sidewalk delivery robot — identifying every subsystem and explaining why each component was chosen.",
            estimatedMinutes: 12,
            keyTerms: ["differential-drive", "lidar", "imu", "odometry"],
            objectives: [
              "Identify the subsystems of an unfamiliar robot from its behaviour and appearance",
              "Justify component choices from the robot's operating requirements",
              "Trace one full sense–think–act cycle through a real machine",
            ],
            blocks: [
              {
                type: "prose",
                text: "Reading an unfamiliar robot is a skill, and it is mostly systematic. Work through the same five questions every time and the design reveals itself.",
              },
              {
                type: "list",
                title: "The five questions",
                style: "number",
                items: [
                  "How does it move? (drive type, degrees of freedom)",
                  "How does it know where it is? (localisation sensors)",
                  "How does it avoid hitting things? (obstacle sensors)",
                  "What does it do that is not moving? (payload, tooling)",
                  "How does it stay powered and safe? (battery, e-stop, failure behaviour)",
                ],
              },
              {
                type: "heading",
                level: 2,
                text: "The subject: a sidewalk delivery robot",
              },
              {
                type: "prose",
                text: "Knee-high, six wheels, an insulated cargo box with a locking lid, a mast with sensors, driving at walking pace on pavements. Let us work through it.",
              },
              {
                type: "diagram",
                name: "mobile-robot-anatomy",
                title: "Subsystems of a sidewalk delivery robot",
                caption:
                  "Every sensor is placed where its weakness is covered by another sensor's strength.",
              },
              {
                type: "table",
                title: "Question 1 — How does it move?",
                columns: ["Observation", "What it implies"],
                rows: [
                  ["Six wheels, no visible steering linkage", "Skid steer — turns by driving one side faster, like a tank"],
                  ["Wheels are small and hard", "Designed for smooth pavement, not rough terrain"],
                  ["No suspension travel visible", "Kerbs are handled by the six-wheel geometry, not by springs"],
                  ["Walking pace only", "Speed is limited by safety regulation, not by motor capability"],
                ],
              },
              {
                type: "callout",
                tone: "insight",
                title: "Why six wheels rather than four",
                text: "With four wheels, climbing a kerb means two wheels lift and the robot pivots on the rear pair — it may tip. With six, the middle pair stays planted while the front pair climbs, so the robot always has at least four contact points. The extra motors and cost buy **kerb capability**, which is the single hardest requirement in sidewalk delivery.",
              },
              {
                type: "table",
                title: "Questions 2 and 3 — Where am I, and what is in the way?",
                columns: ["Sensor", "Job", "Why it alone is not enough"],
                rows: [
                  ["Wheel encoders", "Measure distance travelled", "Drift accumulates; wheel slip is invisible to them"],
                  ["IMU", "Measure turn rate and tilt", "Gyroscope drifts over minutes"],
                  ["GPS", "Absolute position outdoors", "±3 m at best, far worse beside tall buildings"],
                  ["Cameras (several)", "Detect kerbs, people, crossings, signals", "Need light; no direct depth from one camera"],
                  ["Ultrasonic ring", "Close-range obstacle backstop", "Coarse, but works on glass where LiDAR fails"],
                ],
              },
              {
                type: "prose",
                text: "Notice the pattern: **no sensor is trusted alone**. Encoders are precise short-term and drift long-term; GPS is the reverse. Fuse them and you get an estimate better than either. That is sensor fusion, and Level 14 shows the maths.",
              },
              {
                type: "flow",
                title: "One cycle: a pedestrian steps in front",
                nodes: [
                  { label: "Cameras detect a person 3 m ahead, moving across the path" },
                  { label: "Perception estimates their position and velocity" },
                  { label: "Planner predicts a collision in ~2 s", accent: true },
                  { label: "Planner chooses: decelerate and hold" },
                  { label: "Controller ramps wheel velocity down smoothly" },
                  { label: "Motor drivers reduce current; robot stops" },
                  { label: "Person passes; planner resumes the route" },
                ],
              },
              {
                type: "callout",
                tone: "warning",
                title: "Question 5 is the one beginners skip",
                text: "What happens when the battery dies mid-crossing? When a wheel motor fails? When the network drops? Real products answer these explicitly: brakes that engage without power, a watchdog that stops the robot if the main computer stops responding, a physical e-stop on the shell. **Designing the failure behaviour is part of designing the robot**, not an afterthought.",
              },
              {
                type: "challenge",
                title: "Read a robot in the wild",
                text: "Find any robot — a vacuum at home, a video of a warehouse AMR, a coffee-making arm. Work through all five questions and write down your answers. Then look up its specifications and check yourself. Getting question 5 right on the first try is genuinely difficult.",
                hints: [
                  "Count the wheels and look for steering linkages before anything else",
                  "Sensors cluster where the robot needs to look — a sensor mast tells you what it is worried about",
                  "Search the manufacturer's safety documentation for the failure behaviour",
                ],
              },
              {
                type: "summary",
                points: [
                  "Five questions decode almost any robot: move, localise, avoid, do, survive",
                  "Component choices are readable — six wheels means kerbs, hard small wheels mean pavement",
                  "Real robots never trust one sensor; they pair sensors with complementary weaknesses",
                  "Failure behaviour is a design output, not something to be discovered in the field",
                ],
              },
            ],
            quiz: {
              title: "Reading a robot",
              questions: [
                {
                  prompt: "A delivery robot has both wheel encoders and GPS. Why both?",
                  explanation:
                    "Encoders are precise over short intervals but drift without bound; GPS is coarse but has no drift. Their errors are complementary, so fusing them beats either.",
                  answers: [
                    { text: "Their errors are complementary — encoders drift, GPS does not; GPS is coarse, encoders are not", correct: true },
                    { text: "GPS is a backup for when encoders fail" },
                    { text: "Encoders are for indoors, GPS for outdoors, and it never uses both at once" },
                    { text: "Regulations require two position sources" },
                  ],
                },
                {
                  prompt: "Why does a sidewalk robot use six wheels rather than four?",
                  explanation:
                    "Six wheels keep at least four contact points during a kerb climb, so the robot cannot pivot and tip on the rear axle.",
                  answers: [
                    { text: "To keep enough wheels planted while climbing kerbs", correct: true },
                    { text: "To go faster" },
                    { text: "To carry more weight" },
                    { text: "To make turning easier" },
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
