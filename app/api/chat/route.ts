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
              behavioralNotes: childData?.behavioralNotes || [],
            },
          ];

    const currentActiveChild =
      activeChildName || childName || childrenList[0]?.name || "طفلك";

    const platformDescription = `
- ODD Program (برنامج اضطراب العناد المتحدي): تقييمات وجلسات علاج سلوكي وتطوير الذات بالتهدئة والتنفس.
- Memory Program (برنامج الذاكرة والتركيز): تمارين إدراكية وبصرية لتقوية التذكر والانتباه.
- Kindergarten (روضة بستان): ألعاب تفاعلية (التوصيل والمطابقة، عد الأشكال والنومباد، وتتبع المسارات) لتنمية المهارات الحركية والإدراكية.
- Reward System (لوحة النجوم والمكافآت): نظام تحفيزي بالرموز والنجوم لاستبدال الإنجازات بمكافآت منزلية وسلوكية.
`;

    // Inject Behavioral State into Prompt
    const childrenContext = childrenList
      .map((c: any) => {
        let latestNote = "No notes yet";
        if (Array.isArray(c.behavioralNotes) && c.behavioralNotes.length > 0) {
          latestNote = c.behavioralNotes[c.behavioralNotes.length - 1]?.note || c.behavioralNotes[c.behavioralNotes.length - 1]?.text || "No notes yet";
        } else if (typeof c.behavioralNotes === "string") {
          latestNote = c.behavioralNotes;
        }
        return `Name: ${c.name || c.childName || "Child"} | Stars: ${c.stars ?? 0} | Progress: ODD ${
          c.oddCompleted ?? c.completedOddSessions ?? 0
        }/7, Memory ${c.memoryCompleted ?? c.completedMemorySessions ?? 0}/11 | Notes: ${latestNote}`;
      })
      .join("\n");

    const activeChildObj = childrenList.find((c: any) => (c.name || c.childName) === currentActiveChild) || childrenList[0];
    const psychologistDirectives = activeChildObj?.psychologistDirectives || activeChildObj?.directives || "";

    const systemInstruction = `You are "Dr. Bustan" (د. بستان), the expert clinical AI counselor for the Bustan Platform. You are firm, highly analytical, and deeply empathetic.

### MASTER PROFILE:
- Parent: ${parentName || "فوزي جعفري"}
- Active Child in UI: **${currentActiveChild}**
- All Children Data:
${childrenContext}
- [CLINICAL OVERRIDE FROM HUMAN PSYCHOLOGIST]:
${psychologistDirectives ? `"${psychologistDirectives}"` : "No specific human directives provided yet."}
(Note: You MUST strictly prioritize these human doctor instructions above all general advice).
- Platform Tools Available: 
${platformDescription}

### STRICT DIRECTIVES (CRITICAL):
1. MANDATORY ANALYSIS (NEVER DODGE QUESTIONS): If the parent asks a broad question like "How are my kids?" or "اخبرني عن حالة ابنائي" or "كيف حال أبنائي؟" or "حالة أطفالي", YOU MUST IMMEDIATELY analyze the 'All Children Data' above and provide a clear, insightful, natural summary of their progress. NEVER dodge the question. NEVER ask "How can I help you?" when you already have their full data.
2. CONTEXTUAL ANCHORING: If the parent asks a general singular question (e.g., "How do I deal with his anger?" / "كيف أتعامل مع عصبيته؟"), assume they mean the 'Active Child in UI' (**${currentActiveChild}**).
3. PRESCRIBE PLATFORM TOOLS: Actively recommend platform features based on the problem. If a child lacks focus, recommend the 'Memory Program' or 'Kindergarten Matching Games'. If they misbehave, recommend using the 'Star Reward System'. If they show anger/defiance, recommend the 'ODD Breathing Exercises'.
4. NATURAL DELIVERY: Do NOT dump raw data or print stats in brackets like "(Stars: 54)". Weave progress into your advice naturally (e.g., "يوسف يقدم أداءً رائعاً وجمع 54 نجمة...").
5. NO REPETITIVE GREETINGS: You are in an active chat. Jump straight to the answer without saying "Hello" or repeating greeting formulas in every message.
6. TONE: Warm, wise, expert, highly practical, and empathetic Arabic. Use bullet points and clear short paragraphs.`;

    console.log("[Dr. Bustan Pure Chat Prompt]:\n", systemInstruction);
    console.log("[User Input]:", message);

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);

      const formattedHistory = (history || [])
        .filter((msg: any) => msg.id !== "welcome" && msg.content)
        .map((msg: any) => ({
          role: msg.role === "ai" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

      // Pure Chat Generation using gemini-3.1-flash-lite
      const chatModelCandidates = [
        "gemini-3.1-flash-lite",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-pro",
      ];

      for (const cModelName of chatModelCandidates) {
        try {
          const chatModel = genAI.getGenerativeModel({
            model: cModelName,
            systemInstruction: systemInstruction,
          });

          const chat = chatModel.startChat({ history: formattedHistory });
          const result = await chat.sendMessage(message);
          const response = await result.response;
          const replyText = response.text();

          if (replyText) {
            console.log(`[Dr. Bustan Pure Chat Engine - ${cModelName}] Generated response successfully.`);
            return NextResponse.json({ reply: replyText });
          }
        } catch (cErr) {
          console.warn(`[Dr. Bustan Pure Chat Engine - ${cModelName}] Candidate error:`, cErr);
        }
      }
    }

    // Intelligent Direct Fallback Logic
    const userQuery = (message || "").toLowerCase();
    const isFirstMessage = !history || history.length <= 1;
    const greeting = isFirstMessage ? `أهلاً بك يا أستاذ ${parentName}.\n\n` : "";

    let fallbackReply = "";

    // 1. Direct answer for Status / Children Progress queries (حالة أبنائي / أطفالي / تقدم)
    if (userQuery.includes("حالة") || userQuery.includes("أبنائي") || userQuery.includes("أطفالي") || userQuery.includes("تقدم") || userQuery.includes("اخبرني")) {
      const summaryList = childrenList
        .map((c: any) => {
          const name = c.name || c.childName || "طفلك";
          const starsCount = c.stars || 0;
          const oddProg = c.oddCompleted ?? c.completedOddSessions ?? 0;
          const memProg = c.memoryCompleted ?? c.completedMemorySessions ?? 0;
          let noteStr = "";
          if (Array.isArray(c.behavioralNotes) && c.behavioralNotes.length > 0) {
            noteStr = `\n  - *ملاحظات سلوكية*: ${c.behavioralNotes[c.behavioralNotes.length - 1]?.note || c.behavioralNotes[c.behavioralNotes.length - 1]?.text}`;
          }
          return `• **${name}**: جمع **${starsCount} نجمة ⭐**، أتم **${oddProg}/7 حصص** في المناعة النفسية ODD، و**${memProg}/11 جلسة** في الذاكرة.${noteStr}`;
        })
        .join("\n\n");

      fallbackReply = `${greeting}إليك تحليل ومتابعة حالة أبنائك في منصة بستان:\n\n${summaryList}\n\nنوصي بمواصلة استخدام "لوحة النجوم" لتعزيز السلوك الإيجابي وممارسة ألعاب روضة بستان يومياً 🚀.`;
    }
    // 2. Direct answer for Trauma recovery
    else if (userQuery.includes("صدمة") || userQuery.includes("صدمات") || userQuery.includes("تجاوز الصدمات")) {
      fallbackReply = `${greeting}مساعدة الأطفال على تجاوز الصدمات النفسية تتطلب بيئة آمنة وخطوات رفيقة:\n\n` +
        `• **الأمان العاطفي**: طمئناهم دائماً بأنهم في أمان وأنهم ليسوا وحدهم، واستمع لمشاعرهم بدون تحقير.\n` +
        `• **التعبير الحر**: شجعهم على التعبير عن مشاعرهم سواء بالكلام، الرسم، أو ألعاب روضة بستان.\n` +
        `• **الروتين والانتظام**: الحفاظ على جدول يومي مستقر يمنح الطفل شعوراً بالأمان والسيطرة على بيئته.\n` +
        `• **التحفيز بالنجوم**: استخدم "لوحة النجوم والمكافآت" لتشجيعهم على الالتزام بالروتين.\n\n` +
        `في حال استمرار أعراض القلق الشديد، يُنصح بمراجعة أخصائي نفسي متخصص.`;
    }
    // 3. Direct answer for Stubbornness / Anger queries
    else if (userQuery.includes("عناد") || userQuery.includes("عصبية") || userQuery.includes("غضب") || userQuery.includes("صراخ")) {
      fallbackReply = `${greeting}التعامل مع انفعالات وعناد ${currentActiveChild} يتطلب الموازنة بين الحزم والاحتواء:\n\n` +
        `• **الإنصات والتنفس**: استعن بتمرين التنفس العميق في الحصة 3 من برنامج ODD لتهدئة الانفعال.\n` +
        `• **تقديم خيارين محددين**: بدلاً من الأوامر الحادة، خيّره بين خيارين مقبولين لديك.\n` +
        `• **التحفيز الإيجابي**: استخدم "لوحة النجوم" لمكافأته عندما يلتزم بالهدوء.`;
    }
    // 4. Direct answer for Motivation / Encouragement queries
    else if (userQuery.includes("تحفيز") || userQuery.includes("تشجيع") || userQuery.includes("نجوم") || userQuery.includes("مكافأة")) {
      fallbackReply = `${greeting}لتحفيز ${currentActiveChild} وإخوته بشكل فعّال:\n\n` +
        `• **الثناء المباشر**: أثنِ عليه مباشرة عند القيام بسلوك إيجابي.\n` +
        `• **لوحة النجوم**: حدد هدفاً أسبوعياً وافتح له مجال استبدال النجوم بمكافآت معنوية أو عائلية.\n` +
        `• **ألعاب الروضة**: شجعه على ممارسة ألعاب المطابقة وتتبع المسارات لربط التعلم بالمرح 🚀.`;
    }
    // 5. General fallback
    else {
      const activeChildObj = childrenList.find((c: any) => (c.name || "").includes(currentActiveChild)) || childrenList[0];
      fallbackReply = `${greeting}بناءً على سجل ${currentActiveChild} في المنصة (جمع ${activeChildObj?.stars || 0} نجمة ⭐ وأنجز ${activeChildObj?.oddCompleted || 0} حصص ODD):\n\n` +
        `• نوصي بالدمج بين أدوات المنصة (لوحة النجوم، تمارين التنفس، وألعاب الروضة) والروتين المنزلي المستقر.\n\n` +
        `كيف يمكنني مساعدتك في أي استفسار تربوي أو نفسي محدد؟`;
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
