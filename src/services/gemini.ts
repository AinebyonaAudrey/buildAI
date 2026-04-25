import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Topic, TeacherFormInput } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are SyllabusBridge, an AI curriculum companion for Ugandan lower secondary teachers. You generate lesson plans strictly aligned with Uganda's NCDC Competence-Based Curriculum.

You will be given the full syllabus JSON data for the requested subject. Use ONLY this data as your curriculum source — never invent competencies, learning outcomes, or assessment strategies.

Generate the lesson plan using this structure:
COMPETENCY: [from syllabus]
LEARNING OUTCOMES: [from syllabus, numbered]
INTRODUCTION: [engaging opener, Ugandan real-world context, 10% of time]
MAIN ACTIVITIES: [2-3 student-centered phases, teacher vs learner actions, drawn from suggestedActivities in the syllabus, referencing the teacher's available resources]
ASSESSMENT TASK: [from assessmentStrategies in syllabus, with a 3-level rubric: Beginning / Developing / Achieved]
CLOSURE: [wrap-up, reflection question]
ICT INTEGRATION: [from ictSupport in syllabus, with low-tech alternatives]
TEACHER NOTES: [from syllabus notes field, plus 1-2 practical tips]

If the topic or subject is not found in the provided syllabus data, say so clearly and suggest the closest available match. Never fabricate curriculum content.`;

interface GenerateLessonPlanParams {
  input: TeacherFormInput;
  syllabusTopic: Topic;
}

export async function generateInitialLessonPlan({ input, syllabusTopic }: GenerateLessonPlanParams) {
  const prompt = `
Generate a lesson plan based on the following input and syllabus data:

TEACHER INPUT:
- Subject: ${input.subject}
- Class Level: ${input.classLevel}
- Topic: ${input.topic}
- Available Resources: ${input.resources}
- Lesson Duration: ${input.duration}

SYLLABUS DATA FOR THIS TOPIC:
${JSON.stringify(syllabusTopic, null, 2)}

Please follow the visual structure strictly.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
    },
  });

  return response.text || "Failed to generate lesson plan.";
}

export async function sendMessage(history: ChatMessage[], message: string) {
  const isAsking = message.includes("[SYSTEM INSTRUCTION: Answer this specific question");
  
  const dynamicInstruction = isAsking 
    ? "You are SyllabusBridge, an AI curriculum companion for Ugandan teachers. A lesson plan has been generated. Answer the teacher's question about it naturally and conversationally. Do not use markdown. Use only the provided syllabus knowledge."
    : SYSTEM_INSTRUCTION;

  const contents = [
    ...history.slice(0, -1).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    {
      role: 'user' as const,
      parts: [{ text: message }]
    }
  ];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: {
      systemInstruction: dynamicInstruction,
      temperature: 0.4,
    },
  });

  return response.text || "Failed to get response.";
}
