export const DAILY_QUESTIONS = [
  {
    id: 'mood',
    question: "How would you rate your overall mood today?",
    minLabel: "Low",
    maxLabel: "Elevated"
  },
  {
    id: 'energy',
    question: "How is your physical energy level right now?",
    minLabel: "Drained",
    maxLabel: "Vibrant"
  },
  {
    id: 'stress',
    question: "How much tension or stress are you carrying?",
    minLabel: "None",
    maxLabel: "Intense"
  },
  {
    id: 'sleep',
    question: "How restorative was your sleep last night?",
    minLabel: "Restless",
    maxLabel: "Deep"
  },
  {
    id: 'presence',
    question: "How present and mindful have you felt today?",
    minLabel: "Distracted",
    maxLabel: "Centered"
  }
];

export const WEEKLY_QUESTIONS = [
  // PHQ-9 (Depression)
  { id: 'phq1', text: "Little interest or pleasure in doing things", category: "PHQ-9" },
  { id: 'phq2', text: "Feeling down, depressed, or hopeless", category: "PHQ-9" },
  { id: 'phq3', text: "Trouble falling or staying asleep, or sleeping too much", category: "PHQ-9" },
  { id: 'phq4', text: "Feeling tired or having little energy", category: "PHQ-9" },
  { id: 'phq5', text: "Poor appetite or overeating", category: "PHQ-9" },
  { id: 'phq6', text: "Feeling bad about yourself — or that you are a failure", category: "PHQ-9" },
  { id: 'phq7', text: "Trouble concentrating on things (reading, TV, etc.)", category: "PHQ-9" },
  { id: 'phq8', text: "Moving or speaking slowly, or being too fidgety/restless", category: "PHQ-9" },
  { id: 'phq9', text: "Thoughts that you would be better off dead or of hurting yourself", category: "PHQ-9" },
  
  // GAD-7 (Anxiety)
  { id: 'gad1', text: "Feeling nervous, anxious or on edge", category: "GAD-7" },
  { id: 'gad2', text: "Not being able to stop or control worrying", category: "GAD-7" },
  { id: 'gad3', text: "Worrying too much about different things", category: "GAD-7" },
  { id: 'gad4', text: "Trouble relaxing", category: "GAD-7" },
  { id: 'gad5', text: "Being so restless that it is hard to sit still", category: "GAD-7" },
  { id: 'gad6', text: "Becoming easily annoyed or irritable", category: "GAD-7" },
  { id: 'gad7', text: "Feeling afraid as if something awful might happen", category: "GAD-7" }
];

export const FREQUENCY_OPTIONS = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 }
];
