'use client';

import { useState } from 'react';

// 内置词库：加入了 sentence 字段，提供完整的语境
const vocabulary = [
  {
    word: "Pragmatic",
    sentence: "When designing the public square, we must adopt a pragmatic approach to balance aesthetics and pedestrian flow.",
    options: [
      "Based on theoretical assumptions",
      "Dealing with things sensibly and realistically",
      "Showing a lack of respect",
      "Easily broken or damaged"
    ],
    correctIndex: 1,
    resolution: {
      phonetic: "/præɡˈmætɪk/",
      translation: "adj. 实用的；务实的",
      exampleTranslation: "在设计公共广场时，我们必须采取务实的方法来平衡美观与人流量。"
    }
  },
  {
    word: "Meticulous",
    sentence: "The site analysis required a meticulous mapping of transportation and green space layers.",
    options: [
      "Acting quickly without thought",
      "Showing great attention to detail; very careful",
      "Having a friendly and pleasant manner",
      "Incapable of making mistakes"
    ],
    correctIndex: 1,
    resolution: {
      phonetic: "/məˈtɪkjələs/",
      translation: "adj. 一丝不苟的；极其细致的",
      exampleTranslation: "场地分析需要对交通和绿地功能层进行极其细致的测绘。"
    }
  },
  {
    word: "Symbiotic",
    sentence: "The report explores the symbiotic logic between formal infrastructure and informal park usage.",
    options: [
      "Involving interaction between two organisms living in close association",
      "Causing a feeling of strong dislike",
      "Existing at or from the beginning of time",
      "Not able to be changed or reversed"
    ],
    correctIndex: 0,
    resolution: {
      phonetic: "/ˌsɪm.baɪˈɒt.ɪk/",
      translation: "adj. 共生的；相互依赖的",
      exampleTranslation: "该报告探讨了正式基础设施与非正式公园使用之间的共生逻辑。"
    }
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentData = vocabulary[currentIndex];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      alert("Today's review is complete!");
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  // 高亮句子中目标单词的渲染函数
  const renderSentence = (sentence: string, targetWord: string) => {
    // 忽略大小写拆分句子
    const parts = sentence.split(new RegExp(`(${targetWord})`, 'gi'));
    return (
      <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-medium">
        {parts.map((part, i) =>
          part.toLowerCase() === targetWord.toLowerCase() ? (
            <span key={i} className="text-white font-bold underline decoration-zinc-500 decoration-2 underline-offset-8">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </p>
    );
  };

  return (
    // 使用 zinc-950 作为背景，比纯黑柔和，对比度极高
    <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center p-6 selection:bg-zinc-700 font-sans">
      <div className="max-w-2xl w-full flex flex-col space-y-12">

        {/* 顶部状态栏 */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <span className="text-xs font-mono text-zinc-500 tracking-[0.2em] uppercase">
            Contextual Reading
          </span>
          <span className="text-xs font-mono text-zinc-500">
            {currentIndex + 1} / {vocabulary.length}
          </span>
        </div>

        {/* 语境句子展示区 */}
        <div className="py-8 px-4 bg-zinc-900 rounded-2xl border border-zinc-800/50 shadow-lg">
          {renderSentence(currentData.sentence, currentData.word)}
        </div>

        {/* 全英选项区 */}
        <div className="space-y-4">
          {currentData.options.map((option, index) => {
            // 提亮了选项的背景和文字颜色
            let buttonStyle = "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-400 hover:bg-zinc-800 hover:text-white";

            if (isAnswered) {
              if (index === currentData.correctIndex) {
                // 正确答案：清晰的绿色
                buttonStyle = "border-emerald-600/50 bg-emerald-900/20 text-emerald-400";
              } else if (index === selectedOption) {
                // 选错的答案：清晰的红色
                buttonStyle = "border-rose-600/50 bg-rose-900/20 text-rose-400";
              } else {
                // 未选错误答案：变暗
                buttonStyle = "border-transparent bg-zinc-900/30 text-zinc-600";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ease-in-out flex items-center ${buttonStyle}`}
              >
                <span className="mr-5 text-sm font-mono opacity-60 uppercase w-6 text-center">
                  {String.fromCharCode(97 + index)}.
                </span>
                <span className="text-[15px] leading-relaxed font-medium">
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* 解析区与下一步按钮 */}
        <div
          className={`flex flex-col space-y-6 transition-all duration-700 ease-out overflow-hidden ${isAnswered ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'
            }`}
        >
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-end space-x-4 mb-2">
              <span className="text-white font-semibold text-lg tracking-wide">
                {currentData.resolution.translation}
              </span>
              <span className="text-zinc-500 font-mono text-sm">
                {currentData.resolution.phonetic}
              </span>
            </div>
            <div className="h-px w-full bg-zinc-800"></div>
            <div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {currentData.resolution.exampleTranslation}
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 bg-white text-zinc-950 text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all duration-200"
          >
            Continue →
          </button>
        </div>

      </div>
    </div>
  );
}