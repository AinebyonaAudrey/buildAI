import ReactMarkdown from 'react-markdown';
import { Printer, FileText } from 'lucide-react';
import { TeacherFormInput, Topic } from '../types';

interface LessonPlanDisplayProps {
  plan: string;
  metadata?: {
    input: TeacherFormInput;
    topic: Topic;
  };
}

export default function LessonPlanDisplay({ plan, metadata }: LessonPlanDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-between w-full max-w-4xl mb-4 px-4 no-print">
        <button
          onClick={handlePrint}
          className="bg-white border border-slate-200 text-xs px-4 py-2 rounded shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors font-semibold"
        >
          <Printer className="w-4 h-4" />
          Print / Download PDF
        </button>
        
        {metadata && (
          <div className="text-xs text-slate-400 italic">
            Previewing: {metadata.input.classLevel} - {metadata.input.subject} - Term {metadata.topic.term}
          </div>
        )}
      </div>

      <div id="printable-plan" className="lesson-page relative overflow-hidden">
        <div className="doc-header">
          <h2 className="text-3xl font-bold uppercase mb-1 tracking-tight text-slate-900">Lesson Plan</h2>
          <p className="text-sm font-sans tracking-wide text-slate-500 font-medium">NCDC Competence-Based Curriculum</p>
        </div>

        {metadata && (
          <div className="grid-table border-b border-slate-100 pb-4">
            <div className="border-b border-slate-100 pb-1">
              <span className="font-bold mr-2 uppercase text-[10px] text-slate-400 tracking-wider">Subject:</span> {metadata.input.subject}
            </div>
            <div className="border-b border-slate-100 pb-1">
              <span className="font-bold mr-2 uppercase text-[10px] text-slate-400 tracking-wider">Class:</span> {metadata.input.classLevel}
            </div>
            <div className="border-b border-slate-100 pb-1">
              <span className="font-bold mr-2 uppercase text-[10px] text-slate-400 tracking-wider">Topic:</span> {metadata.input.topic} ({metadata.topic.topicCode})
            </div>
            <div className="border-b border-slate-100 pb-1">
              <span className="font-bold mr-2 uppercase text-[10px] text-slate-400 tracking-wider">Theme:</span> {metadata.topic.theme}
            </div>
            <div className="border-b border-slate-100 pb-1">
              <span className="font-bold mr-2 uppercase text-[10px] text-slate-400 tracking-wider">Term:</span> {metadata.topic.term}
            </div>
            <div className="border-b border-slate-100 pb-1">
              <span className="font-bold mr-2 uppercase text-[10px] text-slate-400 tracking-wider">Duration:</span> {metadata.input.duration}
            </div>
          </div>
        )}

        <div className="markdown-body font-serif">
          <ReactMarkdown>{plan}</ReactMarkdown>
        </div>

        <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-100 no-print-footer">
          <div className="text-[10px] text-slate-400 font-sans p-1 border border-slate-200 rounded">
            Powered by SyllabusBridge & NCDC Data
          </div>
          <div className="text-[10px] text-slate-400 font-sans italic">
            Ref: {metadata?.input?.subject.slice(0, 3).toUpperCase()}/{metadata?.input?.classLevel}/T{metadata?.topic?.term}/{metadata?.topic?.topicCode}
          </div>
        </div>
      </div>
    </div>
  );
}
