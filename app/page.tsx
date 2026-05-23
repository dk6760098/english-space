'use client';

import { useState } from 'react';

// 终极版内置词库：包含全英释义和深度中文解析
const vocabulary = [
  {
    word: "Ephemeral",
    options: [
      "Lasting for a very short time",
      "Having a profound or significant impact",
      "Difficult to find, catch, or achieve",
      "Occurring at irregular intervals"
    ],
    correctIndex: 0,
    resolution: {
      phonetic: "/ɪˈfem(ə)rəl/",
      translation: "adj. 短暂的；朝生暮死的",
      example: "Fashions are ephemeral; true style is timeless.",
      exampleTranslation: "流行是短暂的，真正的风格才永恒。"
    }
  },
  {
    word: "Pragmatic",
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
      example: "We need to adopt a pragmatic approach to solve this issue.",
      exampleTranslation: "我们需要采取务实的方法来解决这个问题。"
    }
  },
  {
    word: "Meticulous",
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
      example: "The architect was meticulous about the building's layout.",
      exampleTranslation: "这位建筑师对建筑的布局一丝不苟。"
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
      // 模拟所有单词背完的状态
      alert("Today's review is complete!");
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 flex flex-col items-center justify-center p-6 selection:bg-gray-700 font-sans">
      <div className="max-w-xl w-full flex flex-col space-y-10">

        {/* 顶部状态栏 */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <span className="text-xs font-mono text-gray-500 tracking-[0.2em] uppercase">
            Vocabulary
          </span>
          <span className="text-xs font-mono text-gray-500">
            {currentIndex + 1} / {vocabulary.length}
          </span>
        </div>

        {/* 目标单词展示区 */}
        <div className="flex flex-col items-center justify-center py-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight underline decoration-gray-700 decoration-2 underline-offset-[12px]">
            {currentData.word}
          </h1>
        </div>

        {/* 全英选项区 */}
        <div className="space-y-3">
          {currentData.options.map((option, index) => {
            // 极简基础样式
            let buttonStyle = "border-gray-800 bg-[#0a0a0a] text-gray-400 hover:border-gray-500 hover:text-gray-100";

            // 作答后的状态判断
            if (isAnswered) {
              if (index === currentData.correctIndex) {
                // 正确答案：低饱和度的绿色边框和文字
                buttonStyle = "border-[#1c3a27] bg-[#0c160f] text-[#4ade80]";
              } else if (index === selectedOption) {
                // 选错的答案：低饱和度的红色边框和文字
                buttonStyle = "border-[#3f1919] bg-[#1a0a0a] text-[#f87171]";
              } else {
                // 未被选择的错误答案：深度弱化
                buttonStyle = "border-transparent bg-[#050505] text-gray-700 opacity-40";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ease-in-out flex items-center ${buttonStyle}`}
              >
                <span className="mr-5 text-xs font-mono opacity-50 uppercase w-4 text-center">
                  {String.fromCharCode(97 + index)}
                </span>
                <span className="text-[15px] leading-relaxed">
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* 解析区与下一步按钮 (作答后平滑出现) */}
        <div
          className={`flex flex-col space-y-6 transition-all duration-700 ease-out overflow-hidden ${isAnswered ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'
            }`}
        >
          {/* 中文解析卡片 */}
          <div className="p-6 rounded-xl bg-[#0a0a0a] border border-gray-800/60 space-y-4">
            <div className="flex items-end space-x-4 mb-2">
              <span className="text-white font-medium text-lg tracking-wide">
                {currentData.resolution.translation}
              </span>
              <span className="text-gray-500 font-mono text-sm">
                {currentData.resolution.phonetic}
              </span>
            </div>

            <div className="h-px w-full bg-gray-800/50"></div>

            <div className="space-y-1">
              <p className="text-gray-400 text-sm italic leading-relaxed">
                "{currentData.resolution.example}"
              </p>
              <p className="text-gray-600 text-xs leading-relaxed">
                {currentData.resolution.exampleTranslation}
              </p>
            </div>
          </div>

          {/* 下一步按钮 */}
          <button
            onClick={handleNext}
            className="w-full py-4 bg-white text-black text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200"
          >
            Continue →
          </button>
        </div>

      </div>
    </div>
  );
}