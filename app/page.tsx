"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// 初始化数据库连接
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        // 尝试从远端拉取
        const { data, error } = await supabase.from("questions").select("*").order("id", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setQuestions(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("云端连接失败，已自动切换至本地备用题库测试模式...");
      }

      // 断网降级：启用本地备用题库
      const fallbackData = [
        {
          id: 1, type: "definition", correct_answer: "B", target_word: "symbiosis",
          passage: "The fundamental logic of modern composite parks relies on a delicate balance between formal infrastructure and dynamic interventions. In this context, the concept of a **symbiosis** emerges not just as a biological metaphor, but as a rigid structural necessity.",
          options: { "A": "a destructive interference between two entities", "B": "a mutually beneficial relationship between different groups", "C": "the mathematical calculation of land use concentration", "D": "a temporary disruption of spatial structures" },
          explanation: "【语境释义题】symbiosis 原意是共生，在空间与社会学语境中指不同功能或群体之间互利共存的逻辑。A是破坏性干涉，C是数学计算，D是临时中断。"
        },
        {
          id: 2, type: "cloze", correct_answer: "C", target_word: "appraise",
          passage: "When conducting a land use structure evolution analysis spanning from 2000 to 2015, researchers must utilize advanced quantitative tools to rigorously _____ the spatial concentration of commercial zones.",
          options: { "A": "deteriorate", "B": "neglect", "C": "appraise", "D": "originate" },
          explanation: "【语境填空题】appraise 意为“评估、鉴定”。句意为研究者必须使用定量工具来“评估”商业区的空间集中度。A意为恶化，B意为忽视，D意为起源。"
        },
        {
          id: 3, type: "paraphrase", correct_answer: "B", target_word: "seamlessly integrate",
          passage: "The paradigm of fourth-generation housing, characterized by vertical greening and expansive glass curtain walls, endeavors to seamlessly integrate minimalist aesthetics with ecological sustainability.",
          options: { "A": "It attempts to separate minimalist design from environmental goals.", "B": "It perfectly combines simple visual styles with environmentally friendly living.", "C": "It relies entirely on complex structures to support plant life.", "D": "It sacrifices architectural stability for the sake of planting trees." },
          explanation: "【同义改写题】原句意为“致力于将极简美学与生态可持续性无缝融合”。B选项的 perfectly combines... 完美对应了 seamlessly integrate。"
        }
      ];

      setQuestions(fallbackData);
      setLoading(false);
    }

    fetchQuestions();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">正在同步题库...</div>;
  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center text-gray-500">题库为空</div>;

  const currentQ = questions[currentIndex];
  const options = currentQ.options;

  const handleOptionClick = (key: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(key);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert("太棒了，这组题目已刷完！");
      setCurrentIndex(0);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-8 md:p-12">

        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full tracking-wider uppercase">
            {currentQ.type === 'definition' ? '语境释义' : currentQ.type === 'cloze' ? '语境填空' : '同义改写'}
          </span>
          <span className="text-gray-400 text-sm font-medium">Question {currentIndex + 1} / {questions.length}</span>
        </div>

        <div className="prose prose-lg text-gray-800 leading-relaxed mb-10">
          <p dangerouslySetInnerHTML={{
            __html: currentQ.passage.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black font-semibold border-b-2 border-gray-300 pb-1">$1</strong>')
          }}></p>
        </div>

        <div className="space-y-3">
          {Object.entries(options).map(([key, text]) => {
            let btnClass = "w-full text-left p-4 rounded-xl border transition duration-200 flex items-start ";

            if (!selectedAnswer) {
              btnClass += "border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200";
            } else {
              if (key === currentQ.correct_answer) {
                btnClass += "border-green-500 bg-green-50 text-green-800 shadow-sm";
              } else if (key === selectedAnswer) {
                btnClass += "border-red-500 bg-red-50 text-red-800 shadow-sm";
              } else {
                btnClass += "border-gray-50 bg-gray-50 opacity-40";
              }
            }

            return (
              <button
                key={key}
                onClick={() => handleOptionClick(key)}
                disabled={!!selectedAnswer}
                className={btnClass}
              >
                <span className="font-semibold mr-4 shrink-0 w-6">{key}</span>
                <span>{text as string}</span>
              </button>
            );
          })}
        </div>

        {selectedAnswer && (
          <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in duration-300">
            <div className="p-5 bg-blue-50/50 text-blue-900 rounded-xl text-sm leading-relaxed mb-6">
              <span className="font-bold mr-2 text-blue-700">解析:</span>
              {currentQ.explanation}
            </div>
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition shadow-md"
            >
              {currentIndex < questions.length - 1 ? 'Next Question / 下一题' : 'Restart / 重新开始'}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}