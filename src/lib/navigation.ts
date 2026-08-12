/**
 * Site navigation. The `Learn` menu mirrors the curriculum tracks, so adding a
 * track to the seed and adding it here are the only two steps needed to expose
 * a new subject area.
 */

export interface NavItem {
  label: string;
  href: string;
  description?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Learn", href: "/learn", description: "Courses, modules and lessons" },
  { label: "Roadmap", href: "/roadmap", description: "The zero-to-advanced path" },
  { label: "Projects", href: "/projects", description: "Build real robots" },
  { label: "Simulations", href: "/simulations", description: "Interactive robotics labs" },
  { label: "Challenges", href: "/challenges", description: "Practice problems" },
  { label: "Resources", href: "/resources", description: "Glossary and troubleshooting" },
];

/** Subject areas shown in the Learn dropdown. `track` matches a Track slug. */
export const LEARN_AREAS: { label: string; href: string; blurb: string }[] = [
  { label: "Start here", href: "/learn?level=0", blurb: "No prior knowledge needed" },
  { label: "Fundamentals", href: "/learn?level=1", blurb: "Joints, links, DOF, workspace" },
  { label: "Programming", href: "/learn?level=2", blurb: "Python and C++ from scratch" },
  { label: "Electronics", href: "/learn?level=3", blurb: "Ohm's law to motor drivers" },
  { label: "Sensors & actuators", href: "/learn?level=4", blurb: "Measure and move" },
  { label: "Robot mathematics", href: "/learn?level=5", blurb: "Taught through robots" },
  { label: "Kinematics", href: "/learn?level=6", blurb: "Forward and inverse" },
  { label: "Control", href: "/learn?level=7", blurb: "Feedback and PID" },
  { label: "Mobile robotics", href: "/learn?level=8", blurb: "Drive, odometry, planning" },
  { label: "Manipulators", href: "/learn?level=9", blurb: "Industrial arms and tooling" },
  { label: "ROS 2", href: "/learn?level=10", blurb: "Nodes, topics, TF2, Nav2" },
  { label: "Computer vision", href: "/learn?level=11", blurb: "Pixels to pick-and-place" },
  { label: "AI & machine learning", href: "/learn?level=12", blurb: "Perception and policies" },
  { label: "Industrial robotics", href: "/learn?level=13", blurb: "Cells, safety, fieldbus" },
  { label: "Advanced robotics", href: "/learn?level=14", blurb: "SLAM, planning, fusion" },
  { label: "Capstones", href: "/learn?level=15", blurb: "Full systems, end to end" },
];

export const RESOURCE_NAV: NavItem[] = [
  { label: "Glossary", href: "/glossary", description: "Every term, defined twice" },
  { label: "Troubleshooting", href: "/troubleshooting", description: "When the robot misbehaves" },
  { label: "Skill tree", href: "/skills", description: "What you know, what's next" },
];

export const FOOTER_NAV: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Learn",
    items: [
      { label: "All courses", href: "/learn" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Skill tree", href: "/skills" },
      { label: "Challenges", href: "/challenges" },
    ],
  },
  {
    heading: "Build",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Simulations", href: "/simulations" },
      { label: "Capstones", href: "/projects?difficulty=PROFESSIONAL" },
    ],
  },
  {
    heading: "Reference",
    items: [
      { label: "Glossary", href: "/glossary" },
      { label: "Troubleshooting", href: "/troubleshooting" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
];
