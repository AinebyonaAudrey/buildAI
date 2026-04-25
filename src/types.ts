/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LearningOutcome {
  id: string;
  outcome: string;
}

export interface SuggestedActivity {
  phase: string;
  teacherActions: string;
  learnerActions: string;
}

export interface AssessmentStrategy {
  method: string;
  criteria: string;
}

export interface Topic {
  topicCode: string;
  topicName: string;
  seniorLevel: string;
  term: string | number;
  theme: string;
  durationPeriods: number;
  competency: string;
  learningOutcomes: string[];
  suggestedActivities: string[];
  assessmentStrategies: string[];
  ictSupport: string | null;
  notes: string | null;
}

export interface Syllabus {
  subject: string;
  globalIctGuidelines: string;
  topics: Topic[];
}

export interface TeacherFormInput {
  subject: string;
  classLevel: string;
  topic: string;
  resources: string;
  duration: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface LessonPlanState {
  input: TeacherFormInput;
  syllabusTopic: Topic;
  planHtml: string;
  history: ChatMessage[];
}
