export const projectTemplates = [
  {
    id: "software-dev",
    name: "Software Development",
    description: "Plan, build, test, and launch a software project.",
    category: "Development",
    icon: "code",
    
    columns: [
      {
        title: "Backlog",
        tasks: [
          "Define project requirements",
          "Research tech stack",
          "Create user stories",
        ],
      },
      {
        title: "To Do",
        tasks: [
          "Set up frontend",
          "Set up backend",
          "Create database models",
        ],
      },
      {
        title: "In Progress",
        tasks: [
          "Build authentication",
          "Build main dashboard",
        ],
      },
      {
        title: "Testing",
        tasks: [
          "Test API routes",
          "Fix UI bugs",
        ],
      },
      {
        title: "Done",
        tasks: [],
      },
    ],
  },
  {
    id: "school-project",
    name: "School Project",
    description: "Organize research, writing, review, and final submission.",
    category: "Education",
    icon: "school",
  
    columns: [
      {
        title: "Research",
        tasks: [
          "Find reliable sources",
          "Take notes",
          "Collect citations",
        ],
      },
      {
        title: "Outline",
        tasks: [
          "Create thesis statement",
          "Organize main points",
        ],
      },
      {
        title: "Drafting",
        tasks: [
          "Write introduction",
          "Write body paragraphs",
          "Write conclusion",
        ],
      },
      {
        title: "Review",
        tasks: [
          "Check grammar",
          "Check formatting",
          "Review citation style",
        ],
      },
      {
        title: "Submitted",
        tasks: [],
      },
    ],
  },
  {
    id: "design-project",
    name: "Design Project",
    description: "Track ideas, wireframes, feedback, and final designs.",
    category: "Design",
    icon: "design",
    
    columns: [
      {
        title: "Ideas",
        tasks: [
          "Collect inspiration",
          "Define design goals",
        ],
      },
      {
        title: "Wireframes",
        tasks: [
          "Sketch layout",
          "Create low-fidelity wireframe",
        ],
      },
      {
        title: "Design",
        tasks: [
          "Create color palette",
          "Design main screens",
        ],
      },
      {
        title: "Feedback",
        tasks: [
          "Get peer feedback",
          "Revise design",
        ],
      },
      {
        title: "Final",
        tasks: [],
      },
    ],
  },
  {
    id: "event-planning",
    name: "Event Planning",
    description: "Plan tasks for organizing an event from start to finish.",
    category: "Planning",
    icon: "event",
    
    columns: [
      {
        title: "Planning",
        tasks: [
          "Choose event date",
          "Set budget",
          "Create guest list",
        ],
      },
      {
        title: "Logistics",
        tasks: [
          "Book venue",
          "Arrange food",
          "Prepare materials",
        ],
      },
      {
        title: "Promotion",
        tasks: [
          "Create flyer",
          "Send invitations",
        ],
      },
      {
        title: "Day Of Event",
        tasks: [
          "Set up venue",
          "Check attendance",
        ],
      },
      {
        title: "Completed",
        tasks: [],
      },
    ],
  },
];