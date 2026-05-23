"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AddQuestion() {
    const [rawText, setRawText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ passage: rawText }),
            });
            const data = await res.json();
            setPreviewData(data);
        } catch (err) { alert("生成失败，请检查网络或API Key"); }
        finally { setIsGenerating(false); }
    };

    const handleSave = async () => {
        if (!previewData) return;
        setIsSaving(true);
        try {
            // 【关键修复】在这里给新题目附加上 SM-2 算法的初始值，并把复习时间设为“现在”
            const newQuestion = {
                ...previewData,
                repetition: 0,
                interval: 1,
                efactor: 2.5,
                next_review: new Date().toISOString()
            };

            const { error } = await supabase.from("questions").insert([newQuestion]);
            if (error) throw error;
            alert("🎉 题目已成功入库！");
            setPreviewData(null);
            setRawText("");
        } catch (err: any) {
            alert("保存失败: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">AI 自动化出题</h1>
                <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full h-40 p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black mb-4 resize-none"
                    placeholder="粘贴你要学习的段落..."
                />
                <button onClick={handleGenerate} disabled={isGenerating || !rawText} className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:opacity-90 disabled:opacity-30 transition-all">
                    {isGenerating ? "AI 正在分析并出题..." : "一键生成题目"}
                </button>

                {previewData && (
                    <div className="mt-8 p-6 bg-blue-50 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-blue-900 mb-2">题目预览：{previewData.target_word}</h3>
                        <p className="text-sm text-blue-800 mb-4 italic">"{previewData.passage}"</p>
                        <button onClick={handleSave} disabled={isSaving} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                            {isSaving ? "正在存入云端..." : "确认存入题库"}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}