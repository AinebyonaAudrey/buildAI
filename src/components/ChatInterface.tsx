import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  history: ChatMessage[];
  onSendMessage: (message: string, mode: 'ask' | 'refine') => void;
  isLoading: boolean;
}

export default function ChatInterface({ history, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<'ask' | 'refine'>('ask');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input, mode);
    setInput("");
  };

  // Filter out the initial full lesson plan from chat history to keep it focused on dialogue
  const displayHistory = history.slice(1);

  return (
    <div className="h-full flex flex-col no-print">
      {/* Mode Toggle */}
      <div className="flex p-2 gap-1 bg-slate-100/50">
        <button
          onClick={() => setMode('ask')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
            mode === 'ask' 
              ? 'bg-white text-emerald-700 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Ask Question
        </button>
        <button
          onClick={() => setMode('refine')}
          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
            mode === 'refine' 
              ? 'bg-white text-emerald-700 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Refine Lesson
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {displayHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-40">
            <Bot className="w-8 h-8 text-slate-300" />
            <p className="text-xs text-slate-500 italic">
              {mode === 'ask' 
                ? "Ask me anything about the content, teaching methods, or curriculum alignment." 
                : "Tell me what to change, like 'make it more practical' or 'add more ICT options'."}
            </p>
          </div>
        ) : (
          displayHistory.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-1.5 mb-1 text-[9px] font-bold uppercase tracking-widest ${
                msg.role === 'user' ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {msg.role === 'user' ? (
                  <>You <User className="w-2.5 h-2.5" /></>
                ) : (
                  <><Bot className="w-2.5 h-2.5" /> Assistant</>
                )}
              </div>
              <div className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex flex-col items-start">
             <div className="flex items-center gap-1.5 mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                <Bot className="w-2.5 h-2.5" /> Assistant
              </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
              <Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
              <span className="text-[10px] text-slate-400 italic">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            placeholder={mode === 'ask' ? "Ask about the lesson..." : "Request a change..."}
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-200 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-[9px] text-center text-slate-400 font-medium">
          {mode === 'ask' 
            ? "Mode: ASK — Getting information" 
            : "Mode: REFINE — Updating lesson plan"}
        </p>
      </form>
    </div>
  );
}
