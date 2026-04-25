import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TeacherFormInput } from '../types';

interface InputFormProps {
  onGenerate: (input: TeacherFormInput) => void;
  isLoading: boolean;
}

export default function InputForm({ onGenerate, isLoading }: InputFormProps) {
  const [formData, setFormData] = useState<TeacherFormInput>({
    subject: "Biology",
    classLevel: "S1",
    topic: "",
    resources: "",
    duration: "2 periods of 40 minutes each"
  });

  const subjects = ["Biology", "English", "General Science", "Geography", "Mathematics"];
  const levels = ["S1", "S2", "S3", "S4"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;
    onGenerate(formData);
  };

  return (
    <div className="mb-6">
      <p className="sidebar-label">Lesson Configuration</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-semibold ml-1">Subject</label>
          <select
            className="input-field"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-semibold ml-1">Class Level</label>
          <select
            className="input-field"
            value={formData.classLevel}
            onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
          >
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-semibold ml-1">Topic</label>
          <input
            type="text"
            placeholder="Structure of a Cell"
            className="input-field"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-semibold ml-1">Available Resources</label>
          <textarea
            rows={3}
            placeholder="Textbooks, Microscope, Wall charts, Mobile phones"
            className="input-field h-24 resize-none"
            value={formData.resources}
            onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-slate-500 font-semibold ml-1">Lesson Duration</label>
          <input
            type="text"
            placeholder="2 periods of 40 minutes"
            className="input-field"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Lesson Plan"
          )}
        </button>
      </form>
    </div>
  );
}
