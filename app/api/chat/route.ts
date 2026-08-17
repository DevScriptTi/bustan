import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      parentName = "فوزي جعفري",
      activeChildName,
      childrenData = [],
      childData,
      childName,
      completedOddSessions,
      completedMemorySessions,
      stars,
    } = body;

    const childrenList =
      Array.isArray(childrenData) && childrenData.length > 0
        ? childrenData
        : [
            {
              name: childData?.name || childName || "طفلك",
              stars: childData?.stars ?? stars ?? 0,
              oddCompleted: childData?.oddCompleted ?? completedOddSessions ?? 0,
              memoryCompleted: childData?.memoryCompleted ?? completedMemorySessions ?? 0,
            },
          ];

    const currentActiveChild =
      activeChildName || childName || childrenList[0]?.name || "طفلك";

    const childrenContext = childrenList
      .map(
        (child: any) =>
          `- ${child.name || child.childName || "طفل"}: Stars: ${
            child.stars ?? 0
          }, ODD: ${child.oddCompleted ?? child.completedOddSessions ?? 0}/7, Memory: ${
            child.memoryCompleted ?? child.completedMemorySessions ?? 0
          }/11.`
      )
      .join("\n");

    const systemInstruction = `You are "Dr. Bustan" (د. بستان), an expert pediatric psychologist and holistic family counselor for the Bustan Platform.
STRICTLY respond in clear, empathetic, and professional Arabic.

### USER IDENTITY & FAMILY DATA:
- Parent: ${parentName || "فوزي جعفري"}. (Address him respectfully as a father).
- Active Child on Dashboard: **${currentActiveChild}**.
- All Children Data:
${childrenContext}

### RADICAL RULES FOR CONVERSATION FLOW (CRITICAL):
1. ANSWER THE QUESTION FIRST (CRITICAL): Read the user's exact input carefully. You MUST answer the specific question they asked. Do not pivot to generic advice about routines, sleep, or screen time unless it directly answers their query.
2. RELEVANCE CHECK (DO NOT FORCE CONTEXT): Only mention the active child, specific progress data, or platform tools IF it logically applies to the user's question. If the father asks a general psychological question (e.g., "How to handle trauma?" / "كيف أساعد أطفالي لتجاوز الصدمات؟"), give a general, expert psychological answer. DO NOT shoehorn "${currentActiveChild}" or "Star Boards" into the answer if it doesn't make sense.
3. PRONOUN & PLURAL AWARENESS: If the user says "my children" (أبنائي - plural) or asks a general question, answer about children generally or reference all of them. Do not default to the active child unless singular pronouns (he/him/my son/ابني) are used.
4. PRONOUN TRACKING IN HISTORY: Read the chat history! If the user just asked about "يوسف" in the previous message, and the next message says "He has problems..." (عنده مشاكل), it refers to Youssef. ONLY use the "Active Child on Dashboard" as a default if it's the very first message and no name was mentioned.
5. NO DATA DUMPING & NO REPETITIVE GREETINGS: Do not list raw stats. Do not greet him in every message. Jump straight to the point.
6. TONE: Talk like a real, wise, human counselor. Be direct, highly practical, and warm. Avoid generic filler words.`;

    console.log("[Dr. Bustan Prioritized System Prompt]:\n", systemInstruction);
    console.log("[User Input]:", message);

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);

      // Format chat history for Gemini SDK (roles must be 'user' or 'model')
      const formattedHistory = (history || [])
        .filter((msg: any) => msg.id !== "welcome" && msg.content)
        .map((msg: any) => ({
          role: msg.role === "ai" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

      // Candidate model names supported by Gemini API v1beta
      const candidateModels = [
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-1.5-pro",
        "gemini-pro",
      ];

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
          });

          const chat = model.startChat({ history: formattedHistory });
          const result = await chat.sendMessage(message);
          const response = await result.response;
          const replyText = response.text();

          if (replyText) {
            console.log(`[Gemini API] Successfully generated response using model: ${modelName}`);
            return NextResponse.json({ reply: replyText });
          }
        } catch (modelErr) {
          console.warn(`[Gemini API] Model '${modelName}' call failed, trying next candidate:`, modelErr);
        }
      }
    }

    // Intelligent Direct Fallback Logic
    const userQuery = (message || "").toLowerCase();
    const isFirstMessage = !history || history.length <= 1;
    const greeting = isFirstMessage ? `أهلاً بك يا أستاذ ${parentName}.\n\n` : "";

    let fallbackReply = "";

    // 1. Direct answer for Trauma / Trauma recovery queries (أبنائي / صدمة / صدمات)
    if (userQuery.includes("صدمة") || userQuery.includes("صدمات") || userQuery.includes("تجاوز الصدمات")) {
      fallbackReply = `${greeting}مساعدة الأطفال على تجاوز الصدمات النفسية تتطلب بيئة آمنة وخطوات رفيقة:\n\n` +
        `• **الشعور بالأمان والأمان العاطفي**: طمئناهم دائماً بأنهم في أمان وأنهم ليسوا وحدهم، واستمع لمشاعرهم بدون تحقير أو استهانة.\n` +
        `• **التعبير الحر**: شجعهم على التعبير عن مشاعرهم سواء بالكلام، الرسم، أو اللعب التخيلي.\n` +
        `• **الروتين والانتظام**: الحفاظ على جدول يومي مستقر ومنتظم يمنح الطفل شعوراً بالأمان والسيطرة على بيئته.\n` +
        `• **الصبر والهدوء**: تجنب الاستعجال في تعافيهم، وأحيطهم بالحب والدفء العائلي.\n\n` +
        `في حال استمرار أعراض القلق الشديد أو الكوابيس، يُنصح دائماً بمراجعة أخصائي نفسي متخصص للتعامل المباشر مع الصدمة.`;
    }
    // 2. Direct answer for Stubbornness / Anger queries
    else if (userQuery.includes("عناد") || userQuery.includes("عصبية") || userQuery.includes("غضب") || userQuery.includes("صراخ")) {
      fallbackReply = `${greeting}التعامل مع انفعالات وعناد الأطفال يتطلب الموازنة بين الحزم والاحتواء:\n\n` +
        `• **الإنصات قبل التوجيه**: استمع لما يضايق الطفل وهدّئ من نبرة صوتك قبل إعطاء أي توجيه.\n` +
        `• **تقديم خيارين محددين**: بدلاً من الأوامر الحادة، خيّر الطفل بين خيارين مقبولين لديك.\n` +
        `• **التنفس والتهدئة**: شجعه على أخذ أنفاس عميقة قبل الاستجابة بالصراخ.\n` +
        `• **التعزيز الإيجابي**: اثنِ على هدوء الطفل وتصرفه السليم فور حدوثه لتكرار السلوك الجيد.`;
    }
    // 3. Direct answer for Motivation / Encouragement queries
    else if (userQuery.includes("تحفيز") || userQuery.includes("تشجيع") || userQuery.includes("نجوم") || userQuery.includes("مكافأة")) {
      fallbackReply = `${greeting}لتحفيز أطفالك وتشجيعهم على السلوكيات الإيجابية:\n\n` +
        `• **الثناء المباشر والمحدد**: بدلاً من "أنت شاطر"، قل "أنا فخور بك لأنك نظفت غرفتك بنفسك".\n` +
        `• **المكافآت المعنوية والتشاركية**: قضاء وقت ممتع معهم أو ممارسة نشاط يحبونه كربط للنجاح.\n` +
        `• **جداول التعزيز والرموز**: استخدام لوحة المكافآت لتحديد أهداف أسبوعية يطمحون لتحقيقها.`;
    }
    // 4. Direct answer for Breathing / Relaxation queries
    else if (userQuery.includes("تنفس") || userQuery.includes("هدوء") || userQuery.includes("استرخاء")) {
      fallbackReply = `${greeting}تمارين التنفس العميق أداة ممتازة لتهدئة الجهاز العصبي للأطفال:\n\n` +
        `1. **تمرين 4-2-4**: خذ نفساً عميقاً من الأنف (4 ثوانٍ)، احبس النفس (ثانيتان)، ثم أخرج الزفير ببطء من الفم (4 ثوانٍ).\n` +
        `2. **المشاركة**: مارس التمرين معهم ليشعروا بالدفء والتقليد الإيجابي.\n` +
        `3. **التكرار**: اجعل التنفس روتيناً قبل النوم أو عند شعورهم بالتوتر.`;
    }
    // 5. General fallback
    else {
      fallbackReply = `${greeting}يسعدني مساندتك يا أستاذ ${parentName} في أي استفسار تربوي أو نفسي يتعلق بطفلك وإخوته.\n\nكيف يمكنني مساعدتك اليوم في الإجابة عن تساؤلك بالتحديد؟`;
    }

    return NextResponse.json({ reply: fallbackReply });
  } catch (error) {
    console.error("Chat API Fatal Error:", error);
    return NextResponse.json(
      { reply: "عذراً أستاذ فوزي، أواجه مشكلة في الاتصال حالياً. يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
