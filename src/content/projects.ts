import type { ProjectSource } from "./schema";

/**
 * Every project renders the same nine sections in the same order, so a learner
 * who has done one knows exactly where to look in the next.
 */
export const projects: ProjectSource[] = [
  {
    slug: "blink-an-led",
    title: "Blink an LED",
    summary:
      "The 'hello world' of hardware. Trivial to complete and genuinely worth doing: it proves your toolchain, wiring and power are all correct before anything harder depends on them.",
    difficulty: "BEGINNER",
    category: "electronics",
    estimatedHours: 1,
    tags: ["arduino", "electronics", "first-project"],
    prerequisites: ["ohms-law"],
    skills: ["electronics"],
    courses: ["electronics-foundations"],
    hardware: [
      { name: "Arduino Uno (or any microcontroller board)", qty: 1 },
      { name: "LED, 5 mm", qty: 1 },
      { name: "Resistor, 220 Ω", qty: 1, note: "150–330 Ω all work; 220 Ω is the common value" },
      { name: "Breadboard", qty: 1 },
      { name: "Jumper wires", qty: 2 },
    ],
    software: [
      { name: "Arduino IDE", url: "https://www.arduino.cc/en/software", note: "Or PlatformIO if you prefer VS Code" },
    ],
    sections: [
      {
        id: "overview",
        blocks: [
          {
            type: "prose",
            text: "You will make an LED turn on and off once per second. It takes fifteen minutes and it is not a waste of them: when a later project does not work, you will want to already know that your board, cable, IDE and wiring habits are sound.",
          },
          {
            type: "callout",
            tone: "insight",
            title: "What this actually proves",
            text: "That the toolchain compiles and uploads, the board runs your code, a GPIO pin drives a load, and you can build a circuit that does not short. Four independent things — and when the obstacle detector fails later, all four are already eliminated.",
          },
        ],
      },
      {
        id: "architecture",
        blocks: [
          {
            type: "flow",
            title: "The signal path",
            nodes: [
              { label: "Arduino pin 13", detail: "GPIO output, 5 V or 0 V" },
              { label: "220 Ω resistor", detail: "Limits current to a safe 13 mA", accent: true },
              { label: "LED", detail: "Drops ~2 V, emits light" },
              { label: "Ground", detail: "Completes the circuit" },
            ],
          },
        ],
      },
      {
        id: "theory",
        blocks: [
          {
            type: "prose",
            text: "An LED is a diode: it conducts in one direction only, and its voltage drop is roughly fixed regardless of current. That second property is the dangerous one. Connect it straight across 5 V and current is limited only by the LED's own tiny internal resistance, which means far too much of it.",
          },
          {
            type: "math",
            title: "Sizing the resistor",
            latex: "R = \\frac{V_{\\text{supply}} - V_{\\text{LED}}}{I_{\\text{LED}}} = \\frac{5.0 - 2.0}{0.02} = 150\\ \\Omega",
            note: "220 Ω gives about 13 mA — dimmer, longer-lived, and comfortably inside the pin's 40 mA limit.",
          },
          {
            type: "callout",
            tone: "mistake",
            title: "Skipping the resistor",
            text: "It appears to work for a few seconds, then the LED dims permanently or fails. Worse, the excess current can damage the microcontroller pin, and that damage is invisible — the pin simply stops working reliably later, in a project where you will not suspect it.",
          },
        ],
      },
      {
        id: "build",
        blocks: [
          {
            type: "steps",
            title: "Wiring",
            steps: [
              {
                title: "Identify the LED's polarity",
                text: "The longer leg is the anode (+). The flat spot on the plastic rim marks the cathode (−). Backwards, it simply will not light — harmless, but confusing.",
              },
              {
                title: "Place the LED on the breadboard",
                text: "Put the two legs in different rows. A breadboard connects each row internally, so both legs in one row is a short across the LED.",
              },
              { title: "Connect the resistor", text: "From the LED's anode row to an empty row. Resistors have no polarity." },
              { title: "Wire pin 13 to the resistor", text: "Jumper from Arduino pin 13 to the resistor's free end." },
              { title: "Wire the cathode to ground", text: "Jumper from the LED's cathode row to any GND pin." },
              { title: "Check before powering", text: "Trace the loop: pin 13 → resistor → LED anode → LED cathode → GND. Any two components sharing a row is a short." },
            ],
          },
        ],
      },
      {
        id: "code",
        blocks: [
          {
            type: "code",
            language: "cpp",
            filename: "blink.ino",
            title: "The program",
            code: `const int LED_PIN = 13;
const int BLINK_INTERVAL_MS = 1000;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Blink started");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("on");
  delay(BLINK_INTERVAL_MS);

  digitalWrite(LED_PIN, LOW);
  Serial.println("off");
  delay(BLINK_INTERVAL_MS);
}`,
            annotations: [
              { line: 5, text: "Declares the pin as an output. Without this it stays a high-impedance input and drives nothing." },
              { line: 6, text: "Opens the serial port so you can see what the board thinks it is doing — invaluable when the LED stays dark." },
              { line: 10, text: "loop() runs forever. There is no operating system here; your code is the only thing running." },
              { line: 11, text: "HIGH puts 5 V on the pin. LOW puts 0 V." },
              { line: 13, text: "delay() blocks completely. Fine here, unusable in a robot — see the challenge below." },
            ],
          },
        ],
      },
      {
        id: "test",
        blocks: [
          {
            type: "list",
            title: "What to check",
            style: "check",
            items: [
              "The LED alternates on and off at roughly one second each",
              "The Serial Monitor at 9600 baud prints 'on' and 'off' in step with the light",
              "Changing BLINK_INTERVAL_MS to 200 visibly speeds it up after re-uploading",
              "Nothing is warm to the touch",
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        blocks: [
          {
            type: "table",
            title: "When it does not work",
            columns: ["Symptom", "Likely cause", "Fix"],
            rows: [
              ["LED never lights, serial prints normally", "LED is backwards", "Swap the legs — the long one goes to the resistor"],
              ["Nothing at all, no serial output", "Upload failed or wrong port", "Check Tools → Port; try a different USB cable — many are charge-only"],
              ["LED is on but never blinks", "Legs share a breadboard row", "Each leg needs its own row"],
              ["Very dim", "Resistor far too large", "Check the colour bands; 220 Ω is red-red-brown"],
              ["Lit briefly then dead", "No resistor fitted", "Replace the LED and fit the resistor"],
              ["Serial shows gibberish", "Baud rate mismatch", "Set the Serial Monitor to 9600"],
            ],
          },
        ],
      },
      {
        id: "challenge",
        blocks: [
          {
            type: "challenge",
            title: "Blink without delay()",
            text: "`delay()` freezes the whole program. A robot cannot afford that — it must read sensors while an LED is blinking. Rewrite this using `millis()` so `loop()` never blocks, then add a second LED blinking at a different rate. Two independent rates in one non-blocking loop is the pattern every real embedded program uses.",
            hints: [
              "Record the last toggle time in a variable that survives between loop() calls",
              "Each pass, check whether millis() minus that time exceeds the interval",
              "Two LEDs need two separate last-toggle variables",
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            type: "prose",
            text: "A steadily blinking LED and matching serial output. More importantly: a verified toolchain, a working board, a habit of checking polarity, and the knowledge that current limiting is not optional.",
          },
        ],
      },
    ],
  },

  {
    slug: "ultrasonic-obstacle-detector",
    title: "Ultrasonic obstacle detector",
    summary:
      "A sensor that measures distance and signals when something is too close. The first project with a real sense–think–act loop, and the first that forces you to handle a sensor that sometimes returns nothing.",
    difficulty: "BEGINNER",
    category: "sensors",
    estimatedHours: 2,
    tags: ["arduino", "sensors", "ultrasonic"],
    prerequisites: ["ohms-law", "ultrasonic"],
    skills: ["sensing", "electronics"],
    courses: ["sensors-deep-dive", "electronics-foundations"],
    hardware: [
      { name: "Arduino Uno", qty: 1 },
      { name: "HC-SR04 ultrasonic sensor", qty: 1 },
      { name: "LED, red", qty: 1 },
      { name: "LED, green", qty: 1 },
      { name: "Resistor, 220 Ω", qty: 2 },
      { name: "Piezo buzzer", qty: 1, optional: true },
      { name: "Breadboard and jumper wires", qty: 1 },
    ],
    software: [{ name: "Arduino IDE", url: "https://www.arduino.cc/en/software" }],
    sections: [
      {
        id: "overview",
        blocks: [
          {
            type: "prose",
            text: "Build a proximity detector: green when the path is clear, red when something is within 20 cm. It is the sense–think–act loop in its smallest honest form, and it introduces the problem that dominates real robotics — what to do when the sensor tells you nothing at all.",
          },
        ],
      },
      {
        id: "architecture",
        blocks: [
          {
            type: "flow",
            title: "The loop",
            nodes: [
              { label: "SENSE", detail: "Trigger a burst, time the echo" },
              { label: "THINK", detail: "Compare against the threshold — and handle 'no echo'", accent: true },
              { label: "ACT", detail: "Set the LEDs and buzzer" },
              { label: "Repeat at 10 Hz" },
            ],
          },
        ],
      },
      {
        id: "theory",
        blocks: [
          {
            type: "prose",
            text: "The HC-SR04 fires eight 40 kHz pulses when TRIG is pulsed high for 10 µs, then holds ECHO high for exactly as long as the round trip takes.",
          },
          {
            type: "math",
            title: "Echo time to distance",
            latex: "d_{\\text{cm}} = \\frac{t_{\\mu s} \\times 0.0343}{2}",
            note: "0.0343 cm per microsecond is the speed of sound at 20 °C. The ÷2 is the round trip.",
          },
          {
            type: "callout",
            tone: "warning",
            title: "The failure this project exists to teach",
            text: "Angled, soft and thin obstacles reflect no echo. The sensor then times out and reports **maximum range** — which is identical to *clear ahead*. Your code must distinguish 'nothing is there' from 'I could not tell', because a robot that confuses them drives into walls.",
          },
        ],
      },
      {
        id: "build",
        blocks: [
          {
            type: "table",
            title: "Connections",
            columns: ["Sensor / component", "Arduino pin"],
            rows: [
              ["HC-SR04 VCC", "5 V"],
              ["HC-SR04 GND", "GND"],
              ["HC-SR04 TRIG", "9"],
              ["HC-SR04 ECHO", "10"],
              ["Green LED (via 220 Ω)", "6"],
              ["Red LED (via 220 Ω)", "7"],
              ["Buzzer (optional)", "8"],
            ],
          },
          {
            type: "callout",
            tone: "tip",
            title: "Mounting matters more than you expect",
            text: "Point the sensor squarely at what you want to detect. Tilted more than about 15° and readings become unreliable; past 30° they stop coming back at all. Keep it clear of the breadboard edge — sound reflecting off nearby surfaces creates phantom close readings.",
          },
        ],
      },
      {
        id: "code",
        blocks: [
          {
            type: "code",
            language: "cpp",
            filename: "obstacle_detector.ino",
            title: "With timeout and filtering",
            code: `const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int GREEN_PIN = 6;
const int RED_PIN = 7;
const int BUZZER_PIN = 8;

const float DANGER_CM = 20.0;
const unsigned long ECHO_TIMEOUT_US = 25000;   // ~4.3 m, past sensor range

const int FILTER_SIZE = 5;
float readings[FILTER_SIZE];
int readIndex = 0;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(RED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);

  for (int i = 0; i < FILTER_SIZE; i++) readings[i] = -1.0;
}

// Returns distance in cm, or -1.0 if no echo returned.
float measureDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, ECHO_TIMEOUT_US);
  if (duration == 0) return -1.0;          // timed out — no information

  return duration * 0.0343 / 2.0;
}

// Median of valid readings only. Median rejects single wild values
// that would drag a mean average far off.
float filteredDistance() {
  float valid[FILTER_SIZE];
  int count = 0;
  for (int i = 0; i < FILTER_SIZE; i++) {
    if (readings[i] > 0) valid[count++] = readings[i];
  }
  if (count == 0) return -1.0;

  for (int i = 0; i < count - 1; i++) {
    for (int j = i + 1; j < count; j++) {
      if (valid[j] < valid[i]) { float t = valid[i]; valid[i] = valid[j]; valid[j] = t; }
    }
  }
  return valid[count / 2];
}

void loop() {
  readings[readIndex] = measureDistanceCm();
  readIndex = (readIndex + 1) % FILTER_SIZE;

  float distance = filteredDistance();

  if (distance < 0) {
    // No information. Fail safe: treat it as a hazard, not as clear.
    digitalWrite(GREEN_PIN, LOW);
    digitalWrite(RED_PIN, (millis() / 200) % 2);   // blink to signal 'unknown'
    noTone(BUZZER_PIN);
    Serial.println("no echo - surface may be angled, soft or out of range");
  } else if (distance < DANGER_CM) {
    digitalWrite(GREEN_PIN, LOW);
    digitalWrite(RED_PIN, HIGH);
    tone(BUZZER_PIN, 1000);
    Serial.print("OBSTACLE at "); Serial.print(distance); Serial.println(" cm");
  } else {
    digitalWrite(GREEN_PIN, HIGH);
    digitalWrite(RED_PIN, LOW);
    noTone(BUZZER_PIN);
    Serial.print("clear: "); Serial.print(distance); Serial.println(" cm");
  }

  delay(100);
}`,
            annotations: [
              { line: 33, text: "pulseIn with a timeout. Without the third argument it can block for a full second waiting for an echo that never arrives." },
              { line: 34, text: "Returning -1.0 rather than a large number forces the caller to handle the no-information case explicitly." },
              { line: 41, text: "Median, not mean. One spurious 400 cm reading barely moves a median but drags a five-sample mean by 80 cm." },
              { line: 63, text: "Fail-safe: unknown is treated as dangerous. A robot that assumes 'clear' when it cannot see is a robot that crashes." },
            ],
          },
        ],
      },
      {
        id: "test",
        blocks: [
          {
            type: "steps",
            title: "Test it properly — including the failures",
            steps: [
              { title: "Flat wall, square on", text: "Move a book toward the sensor. The LED should switch at about 20 cm and the reported distance should match a ruler within a centimetre or two." },
              { title: "Angled surface", text: "Tilt the book past 30°. Readings should stop and the red LED should blink — the unknown state. This is the important test." },
              { title: "Soft surface", text: "Try a cushion or a jumper. Expect unreliable or absent readings." },
              { title: "Thin object", text: "Hold a pencil in the beam. It will almost certainly be invisible." },
              { title: "Nothing in range", text: "Point at open space. Expect the unknown state, not 'clear'." },
            ],
          },
          {
            type: "callout",
            tone: "insight",
            title: "The failures are the lesson",
            text: "Steps 2 to 5 are the point of this project. A sensor that works on a flat wall and fails on everything else is exactly what you have; designing around that, rather than pretending otherwise, is what separates a working robot from a demo.",
          },
        ],
      },
      {
        id: "troubleshooting",
        blocks: [
          {
            type: "table",
            title: "Common problems",
            columns: ["Symptom", "Cause", "Fix"],
            rows: [
              ["Always reports no echo", "TRIG/ECHO swapped, or sensor on 3.3 V", "Check wiring; the HC-SR04 needs 5 V"],
              ["Readings jump wildly", "Echoes off nearby surfaces", "Move the sensor clear of the breadboard edge and any wall"],
              ["Distance consistently ~15% off", "Temperature far from 20 °C", "Adjust the 0.0343 constant, or accept the error"],
              ["Works only very close", "Insufficient supply current", "Power from USB or a proper supply, not a weak battery"],
              ["Blocks for a second at a time", "pulseIn without a timeout", "Pass the third argument, as in the code above"],
              ["Two sensors give nonsense", "Crosstalk — each hears the other", "Trigger them alternately, never simultaneously"],
            ],
          },
        ],
      },
      {
        id: "challenge",
        blocks: [
          {
            type: "challenge",
            title: "Make it proportional, then make it honest",
            text: "Replace the binary red/green with a buzzer whose pitch rises as the obstacle gets closer, and an LED whose brightness varies with distance using PWM. Then add a second sensor at 45° and make the two agree before declaring the path clear — with a rule for what to do when they disagree.",
            hints: [
              "map() converts one range to another; analogWrite() gives PWM brightness",
              "tone() takes a frequency, so map distance to a frequency range",
              "Two sensors must be triggered alternately, with a gap, or they hear each other",
              "Disagreement is information: the safe default is to trust the closer reading",
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            type: "prose",
            text: "A detector that reports clear, obstacle, or *unknown* — and treats unknown as a hazard. That third state is the whole point, and it is the habit that carries directly into every autonomous system you will build afterwards.",
          },
        ],
      },
    ],
  },

  {
    slug: "line-following-robot",
    title: "Line-following robot",
    summary:
      "Your first closed-loop robot. Two sensors, two motors, and a proportional controller — the same structure as an industrial servo loop, at a scale you can hold in your hand.",
    difficulty: "BEGINNER",
    category: "mobile",
    estimatedHours: 4,
    tags: ["arduino", "control", "mobile robot", "PID"],
    prerequisites: ["ohms-law", "pwm", "open-vs-closed-loop"],
    skills: ["electronics", "control-systems"],
    courses: ["control-systems", "electronics-foundations"],
    hardware: [
      { name: "Arduino Uno", qty: 1 },
      { name: "Robot chassis with two DC gearmotors and wheels", qty: 1 },
      { name: "L298N or TB6612FNG motor driver", qty: 1, note: "TB6612 is more efficient and runs cooler" },
      { name: "IR reflectance sensor (TCRT5000 or similar)", qty: 2, note: "Five-sensor arrays make the challenge section much easier" },
      { name: "Battery pack, 7.4–12 V", qty: 1 },
      { name: "Caster wheel", qty: 1 },
      { name: "Black electrical tape and a light-coloured surface", qty: 1 },
    ],
    software: [{ name: "Arduino IDE", url: "https://www.arduino.cc/en/software" }],
    sections: [
      {
        id: "overview",
        blocks: [
          {
            type: "prose",
            text: "A robot that follows a black line on a light floor. It is the classic first robot for a good reason: it is small enough to finish and rich enough to teach feedback control, motor drivers, sensor calibration and tuning — all of which transfer directly to serious work.",
          },
        ],
      },
      {
        id: "architecture",
        blocks: [
          {
            type: "flow",
            title: "System architecture",
            nodes: [
              { label: "Two IR sensors", detail: "Reflectance under the front of the chassis" },
              { label: "Arduino", detail: "error = right − left; command = Kp × error", accent: true },
              { label: "Motor driver", detail: "PWM to each motor, plus direction" },
              { label: "Two motors", detail: "Differential drive" },
              { label: "The robot turns — and the sensors read again" },
            ],
          },
          {
            type: "callout",
            tone: "insight",
            title: "This is a proportional controller",
            text: "Sensor difference is the error. Motor speed difference is the output. `command = Kp × error` is the P of PID, controlling a real robot. Everything in Level 7 is an extension of what you are about to build.",
          },
        ],
      },
      {
        id: "theory",
        blocks: [
          {
            type: "prose",
            text: "An IR reflectance sensor shines infrared at the floor and measures what bounces back. Light surfaces reflect strongly, black tape absorbs. The analogue value is high over light floor and low over the line.",
          },
          {
            type: "math",
            title: "Error and differential steering",
            latex: "e = s_{\\text{right}} - s_{\\text{left}}, \\qquad u = K_p\\,e, \\qquad \\begin{cases} v_L = v_{\\text{base}} - u \\\\ v_R = v_{\\text{base}} + u \\end{cases}",
            where: [
              { symbol: "s_{\\text{left}}, s_{\\text{right}}", meaning: "normalised sensor readings, 0 to 1" },
              { symbol: "K_p", meaning: "proportional gain — the one thing you will tune" },
              { symbol: "v_{\\text{base}}", meaning: "forward speed with no correction" },
            ],
            note: "Line drifting right means the right sensor sees more tape, error goes negative, the left wheel speeds up, and the robot curves right to follow it.",
          },
          {
            type: "callout",
            tone: "warning",
            title: "Calibrate, do not hard-code",
            text: "Raw sensor values depend on ambient light, sensor height, floor colour and battery voltage. A threshold hard-coded in your bedroom fails under fluorescent lighting elsewhere. Calibrate at startup by sweeping across the line and recording the minimum and maximum each sensor sees.",
          },
        ],
      },
      {
        id: "build",
        blocks: [
          {
            type: "steps",
            title: "Assembly",
            steps: [
              { title: "Mount the motors and wheels", text: "Motors at the rear, caster at the front. A caster ahead of the drive axle makes the robot far more stable in turns." },
              { title: "Mount the sensors", text: "3–8 mm above the floor, straddling the line, roughly 2 cm apart. Height matters enormously — too high and contrast collapses." },
              { title: "Wire the motor driver", text: "Battery to the driver's motor supply, not to the Arduino's 5 V rail. Motors draw far more than the board can source." },
              { title: "Common ground", text: "Arduino GND, driver GND and battery negative must all connect. Without a common reference the control signals mean nothing." },
              { title: "Check motor direction", text: "Command both forward. If one runs backwards, swap its two motor wires — do not fix it in software." },
              { title: "Lay the track", text: "Black tape on a light floor. Start with gentle curves; tight corners need the five-sensor upgrade in the challenge." },
            ],
          },
          {
            type: "callout",
            tone: "mistake",
            title: "Powering motors from the Arduino's 5 V pin",
            text: "It seems to work with the wheels off the ground and then browns out the moment there is load. The voltage dips, the Arduino resets mid-line, and the robot behaves erratically in a way that looks like a software bug. **Motors get their own supply.**",
          },
        ],
      },
      {
        id: "code",
        blocks: [
          {
            type: "code",
            language: "cpp",
            filename: "line_follower.ino",
            title: "Calibrated proportional control",
            code: `const int LEFT_SENSOR = A0;
const int RIGHT_SENSOR = A1;

const int LEFT_PWM = 5, LEFT_DIR = 4;
const int RIGHT_PWM = 6, RIGHT_DIR = 7;

const int BASE_SPEED = 120;      // 0-255
const int MAX_SPEED = 200;
float Kp = 60.0;                 // tune this first

int leftMin = 1023, leftMax = 0;
int rightMin = 1023, rightMax = 0;

void setup() {
  pinMode(LEFT_PWM, OUTPUT);  pinMode(LEFT_DIR, OUTPUT);
  pinMode(RIGHT_PWM, OUTPUT); pinMode(RIGHT_DIR, OUTPUT);
  Serial.begin(9600);

  Serial.println("Calibrating - sweep the robot across the line for 5 seconds");
  unsigned long start = millis();
  while (millis() - start < 5000) {
    int l = analogRead(LEFT_SENSOR);
    int r = analogRead(RIGHT_SENSOR);
    leftMin = min(leftMin, l);   leftMax = max(leftMax, l);
    rightMin = min(rightMin, r); rightMax = max(rightMax, r);
    delay(10);
  }
  Serial.println("Calibration done");
}

// Map a raw reading to 0.0 (fully on the line) .. 1.0 (fully off it).
float normalise(int raw, int minVal, int maxVal) {
  if (maxVal - minVal < 50) return 0.5;    // contrast too low to trust
  float v = (float)(raw - minVal) / (maxVal - minVal);
  return constrain(v, 0.0, 1.0);
}

void drive(int leftSpeed, int rightSpeed) {
  digitalWrite(LEFT_DIR,  leftSpeed  >= 0 ? HIGH : LOW);
  digitalWrite(RIGHT_DIR, rightSpeed >= 0 ? HIGH : LOW);
  analogWrite(LEFT_PWM,  constrain(abs(leftSpeed),  0, MAX_SPEED));
  analogWrite(RIGHT_PWM, constrain(abs(rightSpeed), 0, MAX_SPEED));
}

void loop() {
  float left  = normalise(analogRead(LEFT_SENSOR),  leftMin,  leftMax);
  float right = normalise(analogRead(RIGHT_SENSOR), rightMin, rightMax);

  // Both sensors off the line: the line was lost.
  if (left > 0.8 && right > 0.8) {
    drive(0, 0);
    Serial.println("line lost");
    return;
  }

  float error = right - left;
  float correction = Kp * error;

  drive(BASE_SPEED - correction, BASE_SPEED + correction);

  Serial.print("L "); Serial.print(left, 2);
  Serial.print("  R "); Serial.print(right, 2);
  Serial.print("  err "); Serial.println(error, 2);
}`,
            annotations: [
              { line: 19, text: "Startup calibration. Sweep the sensors across the line so each records its own light and dark extremes." },
              { line: 33, text: "If the contrast range is tiny, the sensor is not seeing the line at all — return a neutral value instead of amplifying noise." },
              { line: 50, text: "Line-lost detection. Stopping is the honest response; the challenge below adds a search behaviour." },
              { line: 56, text: "The entire controller, in one line." },
            ],
          },
        ],
      },
      {
        id: "test",
        blocks: [
          {
            type: "steps",
            title: "Tuning Kp",
            steps: [
              { title: "Start low", text: "Kp = 20. The robot will drift off on curves — too little correction." },
              { title: "Raise until it oscillates", text: "Increase in steps of 20. At some point it weaves side to side down a straight line. That is too much." },
              { title: "Back off about a third", text: "From the oscillation point, reduce by roughly 30%. It should track smoothly." },
              { title: "Then change the speed", text: "Raise BASE_SPEED and it will oscillate again — gain and speed interact. This is exactly the gain-scheduling problem real controllers face." },
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        blocks: [
          {
            type: "table",
            title: "Common problems",
            columns: ["Symptom", "Cause", "Fix"],
            rows: [
              ["Weaves down a straight line", "Kp too high", "Reduce by a third"],
              ["Drifts off on curves", "Kp too low", "Increase in steps of 20"],
              ["Follows in reverse, turns the wrong way", "Sensors or motors swapped", "Negate the error, or swap the sensor pins"],
              ["Works slow, fails fast", "Gain tuned at one speed only", "Scale Kp with BASE_SPEED"],
              ["Resets randomly while driving", "Motors powered from the Arduino", "Separate motor supply, common ground"],
              ["Behaves differently in another room", "Calibration is lighting-specific", "Re-run calibration on site, every time"],
              ["One wheel always slower", "Motor mismatch", "Add a per-motor trim factor in software"],
            ],
          },
        ],
      },
      {
        id: "challenge",
        blocks: [
          {
            type: "challenge",
            title: "Five sensors, full PID, and a line-lost search",
            text: "Upgrade to a five-sensor array and compute a weighted position rather than a two-sensor difference — this gives a proportional error instead of a coarse one, and handles sharp corners. Then add the D term to damp oscillation at speed, and a search behaviour that pivots toward the last known line direction instead of stopping.",
            hints: [
              "Weighted position: sum(index × reading) / sum(reading), giving a continuous error",
              "The D term needs the previous error and the elapsed time — use micros(), not delay()",
              "Remember the sign of the last non-zero error; that is which way to search",
              "Cap the search: after a full sweep with no line, stop rather than spinning forever",
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            type: "prose",
            text: "A robot that follows a taped line smoothly at a steady pace, stops when the line ends, and re-calibrates for a new environment on startup. You will have tuned a real feedback controller, discovered that gains depend on operating point, and learned why motors need their own power — three lessons that reappear in every robot you build afterwards.",
          },
        ],
      },
    ],
  },

  {
    slug: "ros2-teleop-robot",
    title: "ROS 2 keyboard-driven robot",
    summary:
      "A complete three-node ROS 2 system: a keyboard teleop node, a safety filter, and a differential-drive controller publishing odometry. The smallest system that is genuinely shaped like production robot software.",
    difficulty: "INTERMEDIATE",
    category: "ros2",
    estimatedHours: 6,
    tags: ["ROS 2", "teleop", "odometry", "nodes"],
    prerequisites: ["what-is-ros2", "topics-and-messages", "differential-drive"],
    skills: ["ros2", "mobile-robots"],
    courses: ["ros2-foundations", "mobile-robot-foundations"],
    hardware: [
      { name: "Computer running Ubuntu 24.04", qty: 1, note: "Or a VM / WSL2 / Docker container" },
      { name: "Differential-drive robot base", qty: 1, optional: true, note: "The whole project runs in simulation without one" },
    ],
    software: [
      { name: "ROS 2 Jazzy Jalisco", url: "https://docs.ros.org/en/jazzy/", note: "Humble also works with no changes" },
      { name: "RViz2", note: "Ships with a ROS 2 desktop install" },
    ],
    sections: [
      {
        id: "overview",
        blocks: [
          {
            type: "prose",
            text: "Three nodes that pass messages: keyboard input becomes velocity commands, a safety filter clamps them, and a controller integrates them into an odometry estimate published to TF. Every piece is small; the architecture is exactly what a real robot uses.",
          },
          {
            type: "callout",
            tone: "insight",
            title: "Why a separate safety node",
            text: "You could clamp inside the teleop node. Splitting it out means the *same* filter protects commands from a planner, a joystick or an autonomy stack later. Real robots put a filter between every command source and the base controller, precisely so no single source can exceed the limits.",
          },
        ],
      },
      {
        id: "architecture",
        blocks: [
          {
            type: "flow",
            title: "The node graph",
            nodes: [
              { label: "/teleop_keyboard", detail: "publishes → /cmd_vel_raw" },
              { label: "/velocity_filter", detail: "clamps limits → /cmd_vel", accent: true },
              { label: "/diff_drive_controller", detail: "integrates → /odom and the odom→base_link transform" },
              { label: "RViz2", detail: "subscribes to TF and visualises the pose" },
            ],
          },
        ],
      },
      {
        id: "theory",
        blocks: [
          {
            type: "prose",
            text: "Two ideas from earlier courses meet here. Differential-drive kinematics converts a Twist into wheel speeds and integrates them back into a pose. Coordinate frames determine where that pose is published: the controller owns the `odom` → `base_link` transform, and nothing else may publish it.",
          },
          {
            type: "math",
            title: "The integration, per cycle",
            latex: "\\theta \\mathrel{+}= \\omega\\,\\Delta t, \\qquad x \\mathrel{+}= v\\cos\\theta\\,\\Delta t, \\qquad y \\mathrel{+}= v\\sin\\theta\\,\\Delta t",
            note: "Simulated here from the commanded velocity. On real hardware, v and ω come from wheel encoders instead — and the drift discussed in Level 8 appears.",
          },
        ],
      },
      {
        id: "build",
        blocks: [
          {
            type: "steps",
            title: "Create the workspace and package",
            steps: [
              {
                title: "Make a workspace",
                text: "ROS 2 builds packages inside a workspace with a src directory.",
                code: "mkdir -p ~/robot_ws/src && cd ~/robot_ws/src",
                language: "bash",
              },
              {
                title: "Create the package",
                text: "ament_python is the build type for pure-Python packages.",
                code: "ros2 pkg create --build-type ament_python --dependencies rclpy geometry_msgs nav_msgs tf2_ros my_teleop_robot",
                language: "bash",
              },
              {
                title: "Add the three node files",
                text: "They go in my_teleop_robot/my_teleop_robot/ — the inner directory that shares the package name.",
              },
              {
                title: "Register entry points",
                text: "In setup.py, list each node under console_scripts, or ros2 run will not find them.",
                code: `entry_points={\n    'console_scripts': [\n        'teleop = my_teleop_robot.teleop_keyboard:main',\n        'filter = my_teleop_robot.velocity_filter:main',\n        'controller = my_teleop_robot.diff_drive_controller:main',\n    ],\n},`,
                language: "python",
              },
              {
                title: "Build and source",
                text: "Build from the workspace root, never from src. Source the overlay in every new terminal.",
                code: "cd ~/robot_ws && colcon build --symlink-install && source install/setup.bash",
                language: "bash",
              },
            ],
          },
          {
            type: "callout",
            tone: "mistake",
            title: "Forgetting to source",
            text: "`ros2 run: package not found` after a successful build almost always means the overlay is not sourced in that terminal. Every new terminal needs `source ~/robot_ws/install/setup.bash`. Adding it to `~/.bashrc` saves this from happening a hundred times.",
          },
        ],
      },
      {
        id: "code",
        blocks: [
          {
            type: "code",
            language: "python",
            filename: "velocity_filter.py",
            title: "The safety filter",
            code: `import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist


class VelocityFilter(Node):
    def __init__(self):
        super().__init__('velocity_filter')

        self.declare_parameter('max_linear', 0.5)
        self.declare_parameter('max_angular', 1.0)

        self.subscription = self.create_subscription(
            Twist, 'cmd_vel_raw', self.on_command, 10)
        self.publisher = self.create_publisher(Twist, 'cmd_vel', 10)

        self.get_logger().info('Velocity filter active')

    def on_command(self, msg: Twist):
        max_linear = self.get_parameter('max_linear').value
        max_angular = self.get_parameter('max_angular').value

        out = Twist()
        out.linear.x = max(-max_linear, min(max_linear, msg.linear.x))
        out.angular.z = max(-max_angular, min(max_angular, msg.angular.z))

        if out.linear.x != msg.linear.x or out.angular.z != msg.angular.z:
            self.get_logger().warn(
                f'clamped: v {msg.linear.x:.2f}->{out.linear.x:.2f}  '
                f'w {msg.angular.z:.2f}->{out.angular.z:.2f}')

        self.publisher.publish(out)


def main():
    rclpy.init()
    node = VelocityFilter()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()`,
            annotations: [
              { line: 10, text: "Parameters make limits configurable at launch without editing code — and adjustable at runtime with ros2 param set." },
              { line: 21, text: "Reading the parameter inside the callback picks up runtime changes. Reading it once in __init__ would freeze it at startup." },
              { line: 27, text: "Log only when clamping actually happened. Logging every message makes the log useless." },
            ],
          },
          {
            type: "code",
            language: "python",
            filename: "diff_drive_controller.py",
            title: "Controller and odometry",
            code: `import math
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, TransformStamped
from nav_msgs.msg import Odometry
from tf2_ros import TransformBroadcaster


class DiffDriveController(Node):
    def __init__(self):
        super().__init__('diff_drive_controller')

        self.declare_parameter('wheel_separation', 0.30)
        self.declare_parameter('wheel_radius', 0.035)

        self.x = self.y = self.theta = 0.0
        self.v = self.omega = 0.0

        self.create_subscription(Twist, 'cmd_vel', self.on_command, 10)
        self.odom_publisher = self.create_publisher(Odometry, 'odom', 10)
        self.tf_broadcaster = TransformBroadcaster(self)

        self.last_time = self.get_clock().now()
        self.create_timer(0.02, self.update)      # 50 Hz

    def on_command(self, msg: Twist):
        self.v = msg.linear.x
        self.omega = msg.angular.z

    def wheel_speeds(self):
        L = self.get_parameter('wheel_separation').value
        r = self.get_parameter('wheel_radius').value
        v_left = self.v - self.omega * L / 2.0
        v_right = self.v + self.omega * L / 2.0
        return v_left / r, v_right / r          # rad/s at each wheel

    def update(self):
        now = self.get_clock().now()
        dt = (now - self.last_time).nanoseconds / 1e9
        self.last_time = now
        if dt <= 0.0:
            return

        self.theta += self.omega * dt
        self.theta = math.atan2(math.sin(self.theta), math.cos(self.theta))
        self.x += self.v * math.cos(self.theta) * dt
        self.y += self.v * math.sin(self.theta) * dt

        qz = math.sin(self.theta / 2.0)
        qw = math.cos(self.theta / 2.0)

        tf = TransformStamped()
        tf.header.stamp = now.to_msg()
        tf.header.frame_id = 'odom'
        tf.child_frame_id = 'base_link'
        tf.transform.translation.x = self.x
        tf.transform.translation.y = self.y
        tf.transform.rotation.z = qz
        tf.transform.rotation.w = qw
        self.tf_broadcaster.sendTransform(tf)

        odom = Odometry()
        odom.header.stamp = now.to_msg()
        odom.header.frame_id = 'odom'
        odom.child_frame_id = 'base_link'
        odom.pose.pose.position.x = self.x
        odom.pose.pose.position.y = self.y
        odom.pose.pose.orientation.z = qz
        odom.pose.pose.orientation.w = qw
        odom.twist.twist.linear.x = self.v
        odom.twist.twist.angular.z = self.omega
        self.odom_publisher.publish(odom)


def main():
    rclpy.init()
    node = DiffDriveController()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()`,
            annotations: [
              { line: 30, text: "The inverse kinematics from Level 8, now dividing by wheel radius to get angular wheel speed." },
              { line: 38, text: "Measure real elapsed time rather than assuming the timer fired exactly on schedule. Assuming 0.02 s accumulates error whenever the system is loaded." },
              { line: 44, text: "Wrap heading to (−π, π] using atan2 of its own sine and cosine — concise and numerically stable." },
              { line: 48, text: "A planar rotation as a quaternion needs only the z and w components; x and y stay zero." },
              { line: 53, text: "This node is the sole publisher of odom→base_link. A second publisher would corrupt the TF tree." },
            ],
          },
        ],
      },
      {
        id: "test",
        blocks: [
          {
            type: "steps",
            title: "Bring it up",
            steps: [
              { title: "Terminal 1 — controller", text: "", code: "ros2 run my_teleop_robot controller", language: "bash" },
              { title: "Terminal 2 — filter", text: "", code: "ros2 run my_teleop_robot filter", language: "bash" },
              { title: "Terminal 3 — teleop", text: "", code: "ros2 run my_teleop_robot teleop", language: "bash" },
              { title: "Terminal 4 — inspect", text: "Confirm the graph is what you expect.", code: "ros2 node list && ros2 topic list && ros2 topic hz /odom", language: "bash" },
              { title: "Terminal 5 — visualise", text: "Set Fixed Frame to 'odom' and add a TF display.", code: "rviz2", language: "bash" },
              { title: "Check the filter works", text: "Command more than the limit and watch it clamp.", code: "ros2 topic pub --once /cmd_vel_raw geometry_msgs/msg/Twist '{linear: {x: 5.0}}'", language: "bash" },
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        blocks: [
          {
            type: "table",
            title: "Common problems",
            columns: ["Symptom", "Cause", "Fix"],
            rows: [
              ["`package not found`", "Overlay not sourced", "source ~/robot_ws/install/setup.bash"],
              ["`No executable found`", "Entry point missing from setup.py", "Add it, rebuild, re-source"],
              ["Nodes cannot see each other", "Different ROS_DOMAIN_ID", "Export the same value in every terminal"],
              ["/odom exists but 0 Hz", "Timer never created, or spin() not called", "Check create_timer and rclpy.spin"],
              ["RViz shows nothing", "Fixed Frame wrong", "Set it to 'odom'"],
              ["TF tree broken in view_frames", "Two publishers on one frame", "Only the controller may publish odom→base_link"],
              ["Robot drifts with no input", "Last command never cleared", "Add a watchdog that zeroes velocity after ~0.5 s of silence"],
            ],
          },
          {
            type: "callout",
            tone: "warning",
            title: "The watchdog is not optional",
            text: "If the teleop node dies mid-command, the controller keeps integrating the last velocity forever — a real robot drives away with nothing controlling it. Production systems zero the command if none has arrived within a few hundred milliseconds. Add it before you ever run this on hardware.",
          },
        ],
      },
      {
        id: "challenge",
        blocks: [
          {
            type: "challenge",
            title: "Watchdog, launch file and acceleration limits",
            text: "Add a command watchdog that zeroes velocity after 0.5 s of silence. Write a launch file that starts all three nodes with parameters from a YAML file. Then extend the filter to limit *acceleration* as well as velocity, so a step command ramps instead of jolting — which is what protects real drivetrains.",
            hints: [
              "Store the timestamp of the last command; check it in the 50 Hz timer",
              "Launch files live in a launch/ directory and must be listed in setup.py's data_files",
              "Acceleration limiting needs the previous output and dt: clamp the change, not the value",
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            type: "prose",
            text: "Three nodes running, keyboard input driving a simulated robot whose pose updates live in RViz, a filter that logs when it clamps, and a TF tree that passes `ros2 run tf2_tools view_frames`. This is the smallest system that is genuinely production-shaped — every larger ROS 2 robot is this, with more nodes.",
          },
        ],
      },
    ],
  },

  {
    slug: "vision-guided-pick-and-place",
    title: "Vision-guided pick-and-place",
    summary:
      "A capstone joining perception, coordinate transforms, inverse kinematics and motion: find a coloured part with a camera, convert the pixel to a robot coordinate, and pick it up.",
    difficulty: "ADVANCED",
    category: "integration",
    estimatedHours: 20,
    tags: ["vision", "manipulation", "ROS 2", "capstone"],
    prerequisites: ["images-as-numbers", "why-frames-exist", "geometric-inverse-kinematics", "tcp-and-frames"],
    skills: ["computer-vision", "manipulation", "ros2"],
    courses: ["computer-vision-foundations", "inverse-kinematics", "industrial-manipulators"],
    hardware: [
      { name: "Robot arm with a ROS 2 driver", qty: 1, note: "UR, xArm, or a simulated arm in Gazebo" },
      { name: "RGB-D camera", qty: 1, note: "RealSense D435 or similar; a plain webcam works with a fixed working plane" },
      { name: "Two-finger or vacuum gripper", qty: 1 },
      { name: "Calibration checkerboard", qty: 1 },
      { name: "Coloured parts to pick", qty: 5 },
    ],
    software: [
      { name: "ROS 2 Jazzy", url: "https://docs.ros.org/en/jazzy/" },
      { name: "MoveIt 2", url: "https://moveit.ai/", note: "Motion planning and collision checking" },
      { name: "OpenCV", note: "Comes with the ROS 2 desktop install" },
    ],
    sections: [
      {
        id: "overview",
        blocks: [
          {
            type: "prose",
            text: "A camera watches a work surface. Parts arrive in unknown positions. The system detects one, works out where it is in robot coordinates, plans a collision-free approach, closes the gripper and places the part in a bin. Everything you have learned meets here.",
          },
          {
            type: "callout",
            tone: "warning",
            title: "This project is mostly calibration",
            text: "The detection is a hundred lines. Making the robot go *exactly* where the camera says is the hard part, and it is where the time goes. Budget accordingly — this is also true of every commercial vision-guided cell.",
          },
        ],
      },
      {
        id: "architecture",
        blocks: [
          {
            type: "flow",
            title: "The full pipeline",
            nodes: [
              { label: "/camera — RGB and depth frames" },
              { label: "/part_detector — segment, centroid, deproject to 3D", accent: true },
              { label: "/tf — camera_link → base_link, from hand-eye calibration" },
              { label: "/pick_planner — approach, grasp, lift, place poses" },
              { label: "MoveIt 2 — collision-free trajectory" },
              { label: "/arm_controller — execute" },
              { label: "/gripper_controller — close, then open" },
            ],
          },
        ],
      },
      {
        id: "theory",
        blocks: [
          {
            type: "prose",
            text: "Three transforms must be right, and an error in any one produces the same symptom — the robot misses.",
          },
          {
            type: "table",
            title: "The three calibrations",
            columns: ["Calibration", "What it finds", "How", "If wrong"],
            rows: [
              ["Camera intrinsics", "Focal length, principal point, distortion", "Checkerboard from many angles", "Pixel-to-ray is wrong; error grows toward the frame edges"],
              ["Hand-eye extrinsics", "camera_link → base_link", "Move the arm to known poses with a marker", "Constant offset in one direction"],
              ["Tool centre point", "flange → grasp point", "Four-point pivot method", "Correct in translation, wrong on any rotation"],
            ],
          },
          {
            type: "math",
            title: "Deprojecting a pixel with depth",
            latex: "P_{\\text{cam}} = \\begin{bmatrix} (u - c_x) Z / f_x \\\\ (v - c_y) Z / f_y \\\\ Z \\end{bmatrix}, \\qquad P_{\\text{base}} = {}^{\\text{base}}T_{\\text{cam}} \\; P_{\\text{cam}}",
            note: "The first step needs intrinsics, the second needs hand-eye calibration. Both must be right before the arm reaches anywhere useful.",
          },
          {
            type: "callout",
            tone: "insight",
            title: "Approach along the tool axis, always",
            text: "Never drive straight to the grasp pose from wherever the arm happens to be. Move to a pre-grasp pose 10 cm above along the tool's approach axis, then descend linearly. This makes the final motion predictable, keeps the gripper clear of neighbouring parts, and means a small position error costs you a slightly off-centre grasp rather than a collision.",
          },
        ],
      },
      {
        id: "build",
        blocks: [
          {
            type: "steps",
            title: "Build order — calibrate before writing pick logic",
            steps: [
              { title: "Mount the camera rigidly", text: "Any movement after calibration invalidates it. Bolt it; do not clamp it." },
              { title: "Calibrate intrinsics", text: "Capture 20+ checkerboard images across the whole frame, especially the corners where distortion is largest. Aim for reprojection error below 0.5 px." },
              { title: "Hand-eye calibration", text: "Move the arm to at least 10 varied poses with a marker on the flange, solving for camera_link → base_link. Vary orientation, not just position." },
              { title: "Set the TCP", text: "Use the four-point pivot method. Verify by rotating about the tool axis — a correct TCP keeps the tip stationary." },
              { title: "Verify before proceeding", text: "Place a part at a measured position. The detected coordinates must match within a few millimetres. Do not write pick logic until this passes." },
              { title: "Then build detection and planning", text: "With calibration verified, the remaining work is comparatively straightforward." },
            ],
          },
        ],
      },
      {
        id: "code",
        blocks: [
          {
            type: "code",
            language: "python",
            filename: "part_detector.py",
            title: "Detection and deprojection",
            code: `import cv2
import numpy as np
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from geometry_msgs.msg import PointStamped
from cv_bridge import CvBridge
import message_filters


class PartDetector(Node):
    def __init__(self):
        super().__init__('part_detector')
        self.bridge = CvBridge()
        self.intrinsics = None

        self.create_subscription(CameraInfo, '/camera/color/camera_info',
                                 self.on_camera_info, 10)

        # Colour and depth must describe the same instant, so synchronise
        # them rather than caching the latest of each independently.
        colour_sub = message_filters.Subscriber(self, Image, '/camera/color/image_raw')
        depth_sub = message_filters.Subscriber(self, Image,
                                               '/camera/aligned_depth_to_color/image_raw')
        sync = message_filters.ApproximateTimeSynchronizer(
            [colour_sub, depth_sub], queue_size=10, slop=0.05)
        sync.registerCallback(self.on_frames)

        self.publisher = self.create_publisher(PointStamped, '/detected_part', 10)

    def on_camera_info(self, msg: CameraInfo):
        self.intrinsics = {
            'fx': msg.k[0], 'fy': msg.k[4],
            'cx': msg.k[2], 'cy': msg.k[5],
        }

    def on_frames(self, colour_msg: Image, depth_msg: Image):
        if self.intrinsics is None:
            return

        colour = self.bridge.imgmsg_to_cv2(colour_msg, 'bgr8')
        depth = self.bridge.imgmsg_to_cv2(depth_msg, '16UC1')

        hsv = cv2.cvtColor(colour, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, np.array([50, 100, 60]), np.array([80, 255, 255]))
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return

        largest = max(contours, key=cv2.contourArea)
        if cv2.contourArea(largest) < 800:
            return

        moments = cv2.moments(largest)
        u = int(moments['m10'] / moments['m00'])
        v = int(moments['m01'] / moments['m00'])

        # Median over a patch: a single depth pixel is often invalid.
        patch = depth[max(0, v-4):v+5, max(0, u-4):u+5]
        valid = patch[patch > 0]
        if valid.size < 10:
            self.get_logger().warn('no valid depth at the detected centroid')
            return
        Z = float(np.median(valid)) / 1000.0        # mm -> m

        k = self.intrinsics
        point = PointStamped()
        point.header = colour_msg.header
        point.point.x = (u - k['cx']) * Z / k['fx']
        point.point.y = (v - k['cy']) * Z / k['fy']
        point.point.z = Z
        self.publisher.publish(point)`,
            annotations: [
              { line: 25, text: "ApproximateTimeSynchronizer pairs colour and depth frames by timestamp. Without it, a moving part is detected in one frame and measured in another — a systematic offset that looks like a calibration error." },
              { line: 62, text: "Depth cameras return zero for pixels they could not measure. A single-pixel read fails often; a median over a small patch is far more robust." },
              { line: 68, text: "RealSense depth is in millimetres. Publishing millimetres as metres puts the target a kilometre away, and the arm faults rather than moving." },
              { line: 72, text: "Setting the header from the colour message preserves both the frame_id and the timestamp, so TF2 can transform this point at the right moment in time." },
            ],
          },
        ],
      },
      {
        id: "test",
        blocks: [
          {
            type: "steps",
            title: "Test in this order — never skip to the end",
            steps: [
              { title: "Detection only", text: "Overlay the centroid on the image. Confirm it tracks the part as you move it, and does not latch onto shadows." },
              { title: "Deprojection", text: "Place the part at a measured position. Echo /detected_part and compare against a tape measure. Within 5 mm is acceptable." },
              { title: "Transform", text: "Transform into base_link and compare against a position you jog the arm to manually. This validates hand-eye calibration." },
              { title: "Planning, no execution", text: "Plan to the grasp pose and visualise in RViz without executing. Check the approach path and the gripper orientation." },
              { title: "Execute slowly", text: "10% speed, hand on the e-stop. Watch the approach and the descent." },
              { title: "Full cycle", text: "Only once every stage above is verified. Then run repeatability: same part, same place, twenty times." },
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        blocks: [
          {
            type: "table",
            title: "Diagnosing a miss by its pattern",
            columns: ["Symptom", "Diagnosis", "Fix"],
            rows: [
              ["Constant offset in one direction", "Hand-eye calibration", "Redo it with more varied orientations"],
              ["Error grows toward frame edges", "Intrinsics, especially distortion", "Recalibrate with corner coverage"],
              ["Fine straight, wrong when rotated", "TCP definition", "Redo the four-point pivot"],
              ["Grasps a shadow", "HSV thresholds too loose", "Raise the saturation and value floors"],
              ["Depth reads zero", "Reflective or dark part, or too close", "Diffuse the lighting; check the minimum range"],
              ["Offset only on moving parts", "Colour and depth not synchronised", "Use ApproximateTimeSynchronizer"],
              ["Planning fails, pose is reachable", "Collision geometry or a joint limit", "Check the planning scene; try a different approach angle"],
              ["Works, then drifts over hours", "Thermal expansion", "Warm the robot before production; recalibrate periodically"],
            ],
          },
        ],
      },
      {
        id: "challenge",
        blocks: [
          {
            type: "challenge",
            title: "Make it production-grade",
            text: "Add grasp orientation from the part's principal axis using cv2.minAreaRect, so elongated parts are gripped across their narrow dimension. Handle multiple parts by picking the most accessible first. Add a grasp-success check using gripper width feedback, and retry a failed grasp with an offset before giving up.",
            hints: [
              "minAreaRect returns a rotation angle — convert it to a yaw about the tool axis",
              "Most accessible usually means highest, and furthest from other detections",
              "A gripper that fully closes has grasped nothing; commanded versus actual width tells you",
              "Retry with a small lateral offset — a repeated identical attempt fails identically",
            ],
          },
        ],
      },
      {
        id: "result",
        blocks: [
          {
            type: "prose",
            text: "A system that locates a part anywhere on the work surface and picks it reliably — better than 95% over 20 attempts is a realistic target for a well-calibrated setup with controlled lighting. You will have integrated camera calibration, coordinate transforms, motion planning and gripper control, which is the core skill set of an industrial robotics engineer.",
          },
        ],
      },
    ],
  },
];
