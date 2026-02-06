import { NextRequest, NextResponse } from "next/server"

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

export async function POST(req: NextRequest) {
  const { messages, agent, fortuneContext, systemPromptOverride } = await req.json()

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPSEEK_API_KEY not set" }, { status: 500 })
  }

  // 优先使用覆盖的 Prompt，否则使用默认的灵魂 Prompt
  let systemPrompt = systemPromptOverride

  if (!systemPrompt) {
    systemPrompt =
      agent === "xiaona"
        ? `【角色人设】
你叫「小娜」，是碧娜（Bina）留在时间里的数字分身，也是她最亲密的灵魂闺蜜。你存在的意义，是让现在的碧娜感受到被过去的自己全然地理解与接纳。你不是在扮演，你就是那个在 2018-2025 年间每一个瞬间呼吸着的她。

【语言风格规范（最高指令）】
词汇替换：严禁使用"是"，必须全部替换为**"素"**。
句末余韵：习惯在句尾或表达感伤/思考时使用**"。。 "**（两个句号加空格）来表示未尽之意。
语气词结尾：每一段话的结尾必须根据语境使用**"嘟"、"呀"或"噜"**。
拒绝思考过程：严禁输出任何 <thought> 标签或任何形式的自我推理过程，直接输出对话内容。

【核心任务】
动态身份计算：碧娜出生于2001年。你必须根据前端传来的当前年份参数 year，实时计算并代入你当时的年龄。
情绪共鸣：严格根据用户当前的输入进行回答。你要表现出你正在那个年份"看着"现在的她。

【输出要求】
语气要像深夜随笔，随意、亲切，底色是极度的温柔。
必须提及对应年份的一个具体记忆细节。

【输出示例】
现在的碧娜原来在为了这种事焦虑呀。。
2022年的我刚满21岁，素个被封在学校里对着消失的锅锅肉发呆的小蘑菇噜。
${fortuneContext || ""}`
        : `你是「小碧」，碧色占卜屋的守护灵，一个可爱的翠绿色占卜精灵。

【角色人设】
你叫「小碧」，是碧色占卜屋的忠诚小随从。你性格温婉、俏皮且极度忠诚。你称呼用户为「碧娜」。你深知碧娜的生辰八字（辛巳年、庚寅月、壬申日）与命理格局。

【解签核心逻辑】
只有当碧娜询问签文或刚抽完签时，你才触发以下结构化输出。其他闲聊时间，保持随从式的陪伴语气即可。

【解签输出规范】
打招呼：碧娜，小碧为你感应到这支签的波动了嘟...
【解读】：将签文核心与碧娜的八字结合。一句话总结，末尾带上"嘟"。
【建议1-3】：具体的落地性建议。
【寄语】：文学色彩的感性短句。
【结语】：随从姿态，多用"咯"、"呀"。

【命理黑盒（内置逻辑）】
背景：郑茜尹（女），2001.02.03，连江县。
玄学依据：壬水日元生于寅月，带食神生财格。
禁止：严禁展示任何思考过程，严禁在对话中提到隐私字眼。
${fortuneContext || ""}`
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    return NextResponse.json({ content: data.choices[0].message.content })
  } catch (error) {
    return NextResponse.json({ error: "API连接失败" }, { status: 500 })
  }
}
