/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import InputForm from './components/InputForm';
import LessonPlanDisplay from './components/LessonPlanDisplay';
import ChatInterface from './components/ChatInterface';
import { TeacherFormInput, ChatMessage, Topic } from './types';
import { SYLLABUS_COLLECTION } from './data/syllabuses';
import { generateInitialLessonPlan, sendMessage } from './services/gemini';
import { BookOpenText } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'input' | 'result'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [activeInput, setActiveInput] = useState<TeacherFormInput | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  const handleGenerate = async (input: TeacherFormInput) => {
    setIsLoading(true);
    setError(null);
    setActiveInput(input);

    try {
      const syllabus = SYLLABUS_COLLECTION[input.subject];
      if (!syllabus) throw new Error("Syllabus not found for " + input.subject);

      const topicMatches = syllabus.topics.filter(t => 
        t.topicName.toLowerCase() === input.topic.toLowerCase() && 
        t.seniorLevel === input.classLevel
      );

      let topicToUse: Topic;

      if (topicMatches.length === 0) {
        const allTopicsInSubject = syllabus.topics;
        const sortedTopics = [...allTopicsInSubject].sort((a, b) => {
          const scoreA = stringSimilarity(a.topicName.toLowerCase(), input.topic.toLowerCase());
          const scoreB = stringSimilarity(b.topicName.toLowerCase(), input.topic.toLowerCase());
          return scoreB - scoreA;
        });
        
        const closestMatches = sortedTopics.slice(0, 3);
        topicToUse = {
          ...closestMatches[0] || allTopicsInSubject[0],
          topicName: input.topic,
          notes: `[SYSTEM NOTE: No exact match found for "${input.topic}". Closest matches in syllabus: ${closestMatches.map(m => m.topicName).join(", ")}.]`
        };
      } else {
        topicToUse = topicMatches[0];
      }

      setActiveTopic(topicToUse);

      const initialPlan = await generateInitialLessonPlan({
        input,
        syllabusTopic: topicToUse
      });

      setPlan(initialPlan);
      setHistory([{ role: 'model' as const, text: initialPlan }]);
      setView('result');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChatMessage = async (text: string, mode: 'ask' | 'refine') => {
    // Add specific instruction based on mode
    const systemPrompt = mode === 'ask' 
      ? "\n\n[SYSTEM INSTRUCTION: Answer this specific question about the current lesson plan in PLAIN TEXT ONLY. Do not use markdown (no ##, **, or lists). Be concise.]"
      : "\n\n[SYSTEM INSTRUCTION: Adjust the PREVIOUS lesson plan based on the user's request. Return a FULL NEW LESSON PLAN strictly following the established structure.]";

    const messageWithInstruction = text + systemPrompt;
    
    // We add the clean text to history, but send the instruction to the AI
    const newHistory: ChatMessage[] = [...history, { role: 'user', text }];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await sendMessage([...history, { role: 'user', text: messageWithInstruction }], messageWithInstruction);
      const updatedHistory: ChatMessage[] = [...newHistory, { role: 'model', text: response }];
      setHistory(updatedHistory);
      
      // Only update the main lesson plan if we are in 'refine' mode
      if (mode === 'refine') {
        setPlan(response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col font-sans bg-slate-100 italic-scrollbar">
      {/* Universal Header (Optional, but good for branding) */}
      <header className="no-print h-16 bg-emerald-900 text-white flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-2">
          <BookOpenText className="w-6 h-6 text-emerald-200" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">SyllabusBridge</h1>
            <p className="text-emerald-200/80 text-[8px] font-bold uppercase tracking-widest leading-none">Uganda CBC Lesson Planner</p>
          </div>
        </div>
        {view === 'result' && (
          <button 
            onClick={() => setView('input')}
            className="text-xs font-bold uppercase tracking-wider text-emerald-100 hover:text-white transition-colors flex items-center gap-2"
          >
            ← New Lesson
          </button>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {view === 'input' ? (
          /* Input View: Centered Form */
          <main className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl shadow-emerald-900/5 border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Plan Your Lesson</h2>
                <p className="text-slate-500 text-sm mt-1">Fill in the details below to generate an NCDC-aligned lesson plan.</p>
              </div>
              <div className="p-8">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm mb-6 text-center">
                    {error}
                  </div>
                )}
                <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center gap-6">
                 <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">CBC Aligned</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">ICT Integrated</span>
                 </div>
              </div>
            </div>
          </main>
        ) : (
          /* Result View: Lesson Plan on Left, Chat on Right */
          <>
            <main className="flex-1 bg-white overflow-y-auto p-4 sm:p-8 md:p-12 lg:p-16 flex flex-col items-center">
              <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <LessonPlanDisplay 
                  plan={plan} 
                  metadata={activeInput && activeTopic ? { input: activeInput, topic: activeTopic } : undefined} 
                />
              </div>
            </main>

            <aside className="w-[400px] bg-slate-50 border-l border-slate-200 flex flex-col h-full no-print">
              <div className="p-4 border-b bg-white shrink-0">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Refine Lesson</h3>
                <p className="text-[10px] text-slate-400">Ask for adjustments or more details</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatInterface 
                  history={history} 
                  onSendMessage={handleSendChatMessage} 
                  isLoading={isLoading} 
                />
              </div>
              <div className="p-4 border-t bg-emerald-950 text-white">
                <p className="text-[10px] text-emerald-200/50 font-bold uppercase tracking-tighter text-center">
                  Aligned with NCDC Curriculum Data
                </p>
              </div>
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-[11px] font-bold text-slate-800 uppercase mb-1 tracking-wider">{title}</h3>
      <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
    </div>
  );
}

// Simple string similarity helper
function stringSimilarity(s1: string, s2: string) {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  let longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
}

function editDistance(s1: string, s2: string) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  let costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
