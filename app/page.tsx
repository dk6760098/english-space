"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("questions").select("*");
      if (data) setQuestions(data);
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        <h1 className="text-sm uppercase tracking-[0.3em] text-emerald-500 font-bold border-b border-slate-800 pb-4">
          Data/Extraction // System Ready
        </h1>
        {questions.map((q) => (
          <div key={q.id} className="border border-slate-800 p-8 rounded-none bg-slate-900/50 shadow-2xl">
            <p className="text-xl font-light leading-relaxed mb-8">
              {q.passage}
            </p>
            <div className="space-y-3">
              {Object.entries(q.options).map(([k, v]) => (
                <div key={k} className="p-4 border border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer text-slate-400 hover:text-white">
                  <span className="text-emerald-500 font-mono mr-4">{k}.</span>
                  {v as string}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}