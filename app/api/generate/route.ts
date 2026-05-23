import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { passage } = await request.json();

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.AI_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `你是一个专业的英语出题专家。请根据用户提供的英文段落，挑选一个具有学术价值的生词，生成一道单选题。
            必须严格返回以下 JSON 格式（不要有任何内容以外的文字）：
            {
              "type": "definition",
              "target_word": "挑选的单词",
              "passage": "包含该单词的原句，并将该单词用 **包裹，例如 **word**",
              "options": {"A": "选项1", "B": "选项2", "C": "选项3", "D": "选项4"},
              "correct_answer": "正确选项的大写字母，如 A",
              "explanation": "中文解析，解释词义和各选项的含义"
            }`
                    },
                    { role: "user", content: passage }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const rawContent = data.choices[0].message.content;
        const cleanJsonStr = rawContent.replace(/```json\n?|\n?```/g, '').trim();
        return NextResponse.json(JSON.parse(cleanJsonStr));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}