"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// SM-2 记忆算法
function calculateSM2(isCorrect: boolean, currentRep: number, currentInterval: number, currentEF: number) {
  const q = isCorrect ? 4 : 1;
  let newEF = currentEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newRep = isCorrect ? currentRep + 1 : 0;
  let newInterval = 1;
  if (isCorrect) {
    if (newRep === 1) newInterval = 1;
    else if (newRep === 2) newInterval = 6;
    else newInterval = Math.round(currentInterval * currentEF);
  }
  return { newRep, newInterval, newEF };
}

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchQuestions() {
      const { data } = await supabase.from("questions")
        .select() // <--- 就是漏了这极其关键的一句！
        .lte("next_review", new Date().toISOString())
        .order("next_review", { ascending: true });
      if (data) setQuestions(data);
      setLoading(false);
    }
    fetchQuestions();
  }, []);
  if (loading) return <div className="min-h-screen flex items-center justify-center">同步记忆曲线中...</div>;
  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl">🎉 今日任务已完成！</div>;

  const currentQ = questions[currentIndex];

  const handleAnswer = async (key: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(key);
    const isCorrect = key === currentQ.correct_answer;
    const { newRep, newInterval, newEF } = calculateSM2(isCorrect, currentQ.repetition || 0, currentQ.interval || 0, currentQ.efactor || 2.5);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    await supabase.from("questions").update({
      repetition: newRep, interval: newInterval, efactor: newEF, next_review: nextDate.toISOString()
    }).eq("id", currentQ.id);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 antialiased selection:bg-emerald-200">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 md:p-14 border border-slate-100/50 relative overflow-hidden">
        {/* 顶部极简装饰线 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Daily Task</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">
              {questions.length - currentIndex} Remaining
            </span>
          </div>

          {/* 题干部分大面积留白，核心词汇下划线高亮 */}
          <p
            className="text-2xl text-slate-800 leading-[1.6] font-light"
            dangerouslySetInnerHTML={{
              __html: currentQ.passage.replace(/\*\*(.*?)\*\*/g, '<b class="font-semibold text-slate-900 border-b-2 border-emerald-400/50 pb-0.5">$1</b>')
            }}
          />
        </div>

        <div className="space-y-4">
          {Object.entries(currentQ.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleAnswer(key)}
              className={`w-full group text-left p-6 rounded-[1.5rem] transition-all duration-300 ease-out flex items-center bg-white border ${!selectedAnswer ? "border-slate-100 hover:border-emerald-200 hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.2)] hover:-translate-y-0.5" :
                  key === currentQ.correct_answer ? "border-emerald-500 bg-emerald-50/50 text-emerald-900" :
                    key === selectedAnswer ? "border-rose-300 bg-rose-50/50 text-rose-900" : "border-slate-50 opacity-40 grayscale"
                }`}
            >
              <span className={`w-12 h-12 flex items-center justify-center rounded-2xl mr-5 text-sm font-bold transition-colors ${!selectedAnswer ? "bg-slate-50 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600" :
                  key === currentQ.correct_answer ? "bg-emerald-200 text-emerald-800" :
                    key === selectedAnswer ? "bg-rose-200 text-rose-800" : "bg-slate-50 text-slate-300"
                }`}>
                {key}
              </span>
              <span className="text-slate-700 font-medium text-lg">{value as string}</span>
            </button>
          ))}
        </div>

        {selectedAnswer && (
          <div className="mt-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="p-6 bg-slate-50 rounded-3xl text-sm text-slate-600 leading-relaxed mb-8 border border-slate-100">
              <span className="font-bold text-slate-800 block mb-2">解析</span>
              {currentQ.explanation}
            </div>
            <button
              onClick={() => { setSelectedAnswer(null); setCurrentIndex(currentIndex + 1); }}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold tracking-wide hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
            >
              Next <span className="opacity-50 ml-2 text-xl leading-none">→</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}