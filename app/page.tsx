"use client";
import { useState } from "react";

// 这里是美化后的极简UI组件
export default function Flashcard({ question }: { question: any }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-8 md:p-12">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center text-slate-400 text-sm mb-12">
        <span className="uppercase tracking-widest font-semibold">Daily Task</span>
        <span>19 Remaining</span>
      </div>

      {/* 题目内容区 - 增加了段落行高，让阅读更舒适 */}
      <div className="mb-12">
        <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-light">
          {question.passage.split(question.target_word).map((part: string, i: number, arr: any[]) => (
            <>
              {part}
              {i < arr.length - 1 && (
                <span className="font-bold text-emerald-600 underline decoration-2 underline-offset-4">
                  {question.target_word}
                </span>
              )}
            </>
          ))}
        </p>
      </div>

      {/* 选项区 - 彻底拉开间距，增加圆角和悬停交互 */}
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
            {/* 选项字母加粗，与内容保持舒适间距 */}
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