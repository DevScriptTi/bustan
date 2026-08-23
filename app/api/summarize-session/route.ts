import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, collection, query, where, getDocs } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, childName, messages = [] } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ success: true, note: "NO_UPDATE" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let summaryNote = "NO_UPDATE";

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const systemInstruction = `You are a clinical supervisor reviewing a counselor's chat transcript.
Read this chat transcript between a parent and an AI counselor regarding the child (${childName || "الطفل"}).
Extract any NEW behavioral patterns, progress, or issues mentioned during the chat.
Summarize them into a concise, professional clinical note (1-2 sentences in Arabic).
If there are NO new significant behavioral updates or issues mentioned, strictly return 'NO_UPDATE'.
Do NOT include markdown titles or extra greetings.`;

      const transcriptText = messages
        .map((m: any) => `${m.role === "user" ? "Parent" : "Counselor"}: ${m.content}`)
        .join("\n");

      const candidateModels = [
        "gemini-3.6-flash",
        "gemini-2.0-flash",
        "gemini-1.5-pro",
        "gemini-pro",
      ];

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
          });

          const result = await model.generateContent(`Transcript for child (${childName}):\n${transcriptText}`);
          const response = await result.response;
          const textResult = response.text()?.trim();

          if (textResult && textResult !== "NO_UPDATE" && !textResult.includes("NO_UPDATE")) {
            summaryNote = textResult;
            console.log(`[Gemini Session Summarizer - ${modelName}] Generated clinical summary: ${summaryNote}`);
            break;
          }
        } catch (mErr) {
          console.warn(`[Session Summarizer - ${modelName}] Candidate error:`, mErr);
        }
      }
    }

    // Database Action: Save summary to child's behavioralNotes in Firestore if valid note
    if (summaryNote !== "NO_UPDATE") {
      try {
        let targetDocRef = null;
        if (childId) {
          targetDocRef = doc(db, "children", childId);
        } else if (childName) {
          const q = query(collection(db, "children"), where("name", "==", childName));
          const snap = await getDocs(q);
          if (!snap.empty) {
            targetDocRef = snap.docs[0].ref;
          }
        }

        if (targetDocRef) {
          await updateDoc(targetDocRef, {
            behavioralNotes: arrayUnion({
              date: new Date().toISOString(),
              note: summaryNote,
              author: "ai_agent",
            }),
          });
          console.log(`[Session Summarizer Firestore] Saved clinical note: ${summaryNote}`);
        }
      } catch (dbErr) {
        console.error("Firestore Update Error in /api/summarize-session:", dbErr);
      }
    }

    return NextResponse.json({ success: true, note: summaryNote });
  } catch (error) {
    console.error("Fatal error in /api/summarize-session:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنهاء الجلسة وتحليل البيانات." },
      { status: 500 }
    );
  }
}
