export interface TemplateSection {
  id: string
  title: string
  placeholder: string
}

export interface Template {
  id: string
  name: string
  description: string
  sections: TemplateSection[]
}

export const templates: Template[] = [
  {
    id: 'one-page-pitch',
    name: 'One-Page Pitch',
    description: 'Perfect for startup pitches and business proposals',
    sections: [
      { id: 'problem', title: 'The Problem', placeholder: 'What problem are you solving?' },
      { id: 'solution', title: 'The Solution', placeholder: 'How does your solution work?' },
      { id: 'unique', title: 'What Makes It Unique', placeholder: 'What sets you apart from competitors?' },
      { id: 'why-now', title: 'Why Now', placeholder: 'Why is this the right time?' },
      { id: 'ask', title: 'Investment Ask', placeholder: 'What are you asking for?' },
      { id: 'roadmap', title: 'Roadmap', placeholder: 'What are your milestones?' }
    ]
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Plan',
    description: 'Structured format for educational content',
    sections: [
      { id: 'objectives', title: 'Learning Objectives', placeholder: 'What will students learn?' },
      { id: 'materials', title: 'Materials Needed', placeholder: 'What resources are required?' },
      { id: 'intro', title: 'Introduction', placeholder: 'How will you introduce the topic?' },
      { id: 'activities', title: 'Activities', placeholder: 'What activities will students do?' },
      { id: 'assessment', title: 'Assessment', placeholder: 'How will you measure learning?' },
      { id: 'wrap-up', title: 'Wrap-Up', placeholder: 'How will you conclude the lesson?' }
    ]
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Professional project proposal format',
    sections: [
      { id: 'overview', title: 'Project Overview', placeholder: 'Brief summary of the project' },
      { id: 'objectives', title: 'Objectives', placeholder: 'What are the goals?' },
      { id: 'scope', title: 'Scope', placeholder: 'What is included and excluded?' },
      { id: 'timeline', title: 'Timeline', placeholder: 'Key milestones and deadlines' },
      { id: 'resources', title: 'Resources', placeholder: 'What resources are needed?' },
      { id: 'risks', title: 'Risks & Mitigation', placeholder: 'Potential challenges and solutions' }
    ]
  },
  {
    id: 'creative-brief',
    name: 'Creative Brief',
    description: 'Guide creative projects and campaigns',
    sections: [
      { id: 'background', title: 'Background', placeholder: 'Context and history' },
      { id: 'objective', title: 'Objective', placeholder: 'What should this achieve?' },
      { id: 'audience', title: 'Target Audience', placeholder: 'Who are we talking to?' },
      { id: 'message', title: 'Key Message', placeholder: 'What is the main takeaway?' },
      { id: 'tone', title: 'Tone & Style', placeholder: 'How should it feel?' },
      { id: 'deliverables', title: 'Deliverables', placeholder: 'What will be produced?' }
    ]
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Organized meeting documentation',
    sections: [
      { id: 'attendees', title: 'Attendees', placeholder: 'Who was present?' },
      { id: 'agenda', title: 'Agenda', placeholder: 'Topics discussed' },
      { id: 'discussion', title: 'Discussion Points', placeholder: 'Key points raised' },
      { id: 'decisions', title: 'Decisions Made', placeholder: 'What was decided?' },
      { id: 'actions', title: 'Action Items', placeholder: 'Tasks and owners' },
      { id: 'next', title: 'Next Steps', placeholder: 'Follow-up actions' }
    ]
  }
]

export function getTemplate(id: string): Template | undefined {
  return templates.find(t => t.id === id)
}
