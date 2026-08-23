import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { childId, childName, rawText, parentName = "فوزي جعفري" } = body;

    if (!rawText || !rawText.trim()) {
      return NextResponse.json(
        { error: "لم يتم تقديم ملاحظة سلوكية لتحديثها." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let summaryNote = rawText.trim();

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const systemInstruction = `You are "Dr. Bustan" (د. بستان), an expert pediatric psychologist and clinical analyzer for the Bustan Platform.
Your task is to analyze the parent's raw behavioral update about the child (${childName || "الطفل"}), and summarize it into a concise, professional, actionable clinical note in Arabic (max 2-3 sentences).
Focus on:
1. Main behavioral issue / change (e.g. anger, isolation, refusal of chores, progress in breathing).
2. Recommended psychological focus for future sessions.
Do NOT include greetings or markdown titles. Just the clear Arabic clinical note summary.`;

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

          const result = await model.generateContent(`ملاحظة الوالد/الوالدة (${parentName}) حول ${childName || "الطفل"}:\n"${rawText}"`);
          const response = await result.response;
          const textResult = response.text();

          if (textResult) {
            summaryNote = textResult.trim();
            console.log(`[Gemini State Analyzer - ${modelName}] Generated summary: ${summaryNote}`);
            break;
          }
        } catch (mErr) {
          console.warn(`[State Analyzer - ${modelName}] Candidate failed:`, mErr);
        }
      }
    }

    // Server-side Firebase Firestore update
    if (childId) {
      try {
        const childRef = doc(db, "children", childId);
        await updateDoc(childRef, {
          behavioralNotes: arrayUnion({
            date: new Date().toISOString(),
            note: summaryNote,
            author: "ai_agent",
          }),
        });
        console.log(`[Firestore State Update] Appended note to child ID (${childId}): ${summaryNote}`);
      } catch (dbErr) {
        console.error("Firestore Update Error in /api/update-state:", dbErr);
      }
    }

    return NextResponse.json({ success: true, summary: summaryNote });
  } catch (error) {
    console.error("Fatal error in /api/update-state:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع أثناء تحديث حالة الطفل." },
      { status: 500 }
    );
  }
}
