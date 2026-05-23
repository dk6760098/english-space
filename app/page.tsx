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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <div className="mb-8">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Today's Task: {questions.length - currentIndex} Left</span>
          <p className="text-xl text-gray-800 leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: currentQ.passage.replace(/\*\*(.*?)\*\*/g, '<b class="border-b-2 border-black pb-1 text-black">$1</b>') }} />
        </div>

        <div className="space-y-3">
          {Object.entries(currentQ.options).map(([key, value]) => (
            <button key={key} onClick={() => handleAnswer(key)} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center ${!selectedAnswer ? "border-gray-100 bg-gray-50 hover:border-black" :
                key === currentQ.correct_answer ? "border-green-500 bg-green-50" :
                  key === selectedAnswer ? "border-red-500 bg-red-50" : "border-transparent opacity-30"
              }`}>
              <span className="w-8 font-bold">{key}</span> {value as string}
            </button>
          ))}
        </div>

        {selectedAnswer && (
          <div className="mt-8 animate-in slide-in-from-top-2">
            <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 mb-6">{currentQ.explanation}</div>
            <button onClick={() => { setSelectedAnswer(null); setCurrentIndex(currentIndex + 1); }} className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-lg">Next Question</button>
          </div>
        )}
      </div>
    </main>
  );
}