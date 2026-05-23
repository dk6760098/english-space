"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AddQuestion() {
    const [rawText, setRawText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [previewData, setPreviewData] = useState<any[] | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passage: rawText }),
            });
            let data = await res.json();

            // 如果 AI 只返回了一道题的单个对象，我们把它强行包成数组，防止报错
            if (!Array.isArray(data)) {
                data = [data];
            }
            setPreviewData(data);
        } catch (err) {
            alert("生成失败，请检查网络或刷新重试。");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!previewData || previewData.length === 0) return;
        setIsSaving(true);
        try {
            // 批量给每一道题打上今天复习的算法时间戳
            const newQuestions = previewData.map(q => ({
                ...q,
                repetition: 0,
                interval: 1,
                efactor: 2.5,
                next_review: new Date().toISOString()
            }));

            // Supabase 的 insert 完美支持直接塞入一个大数组
            const { error } = await supabase.from("questions").insert(newQuestions);
            if (error) throw error;

            alert(`🎉 太棒了！成功批量存入 ${newQuestions.length} 道考点题！`);
            setPreviewData(null);
            setRawText("");
        } catch (err: any) {
            alert("保存失败: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 antialiased">
            <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100 relative max-h-[90vh] overflow-y-auto">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">AI 批量提取流水线</h1>
                <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full h-40 p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-400 mb-4 resize-none text-slate-700"
                    placeholder="丢一大段英文长文进来，AI将为你地毯式扫描所有专业词汇并批量出题..."
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !rawText}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-40 transition-all shadow-lg"
                >
                    {isGenerating ? "AI 正在地毯式提取所有考点..." : "一键榨干这段文章"}
                </button>

                {previewData && (
                    <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 pt-8 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800">
                                扫描完毕，共提取 <span className="text-emerald-500 text-2xl mx-1">{previewData.length}</span> 个考点
                            </h3>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md transition-all"
                            >
                                {isSaving ? "正在打包写入数据库..." : "确认无误，全部入库"}
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {previewData.map((q, index) => (
                                <div key={index} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                                    <h4 className="font-bold text-slate-800 text-lg mb-2">{q.target_word}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-3 mb-3 italic">"{q.passage}"</p>
                                    <p className="text-xs font-medium text-emerald-600 bg-emerald-100 inline-block px-2 py-1 rounded-md">
                                        答案: {q.correct_answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}