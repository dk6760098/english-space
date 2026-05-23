"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取数据库题目
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("questions").select("*");
      if (data) setQuestions(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center">加载中...</div>;

  return (
    <main className="min-h-screen bg-slate-50">
      {questions.map((q) => (
        <Flashcard key={q.id} question={q} />
      ))}
    </main>
  );
}

// 这是我们刚才优化的精美卡片组件，直接嵌入在这里，确保被调用
function Flashcard({ question }: { question: any }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-8 md:p-12 border-b border-slate-200">
      <div className="flex justify-between items-center text-slate-400 text-sm mb-12">
        <span className="uppercase tracking-widest font-semibold">Daily Task</span>
      </div>

      <div className="mb-12">
        <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-light">
          {question.passage.split(question.target_word).map((part: string, i: number, arr: any[]) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="font-bold text-emerald-600 underline decoration-2 underline-offset-4">
                  {question.target_word}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(question.options).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-6 group
              ${selected === key
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-white border-slate-200 hover:border-slate-400 text-slate-700"
              }`}
          >
            <span className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-bold transition-colors
              ${selected === key ? "border-slate-700 bg-slate-800" : "border-slate-200 group-hover:border-slate-400"}`}>
              {key}
            </span>
            <span className="font-medium text-lg">{value as string}</span>
          </button>
        ))}
      </div>
    </div>
  );
}