import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";

export interface ChildActivity {
  id: string;
  type: "memory" | "odd" | "star";
  title: string;
  timestamp: string;
}

export const recordSessionCompletion = async (
  childId: string,
  sessionType: "memory" | "odd",
  sessionTitle: string,
  earnedStars: number = 0,
  sessionNumber: number = 1
) => {
  if (!childId) return;

  const childRef = doc(db, "children", childId);
  const sessionIncrementField =
    sessionType === "memory" ? "completedMemorySessions" : "completedOddSessions";

  try {
    const childSnap = await getDoc(childRef);
    const currentProgress = childSnap.exists()
      ? childSnap.data()?.[sessionIncrementField] || 0
      : 0;

    const isNewProgress = sessionNumber > currentProgress;

    if (isNewProgress) {
      const newActivity: ChildActivity = {
        id: Date.now().toString(),
        type: sessionType,
        title: `تم إنهاء ${sessionTitle}`,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(childRef, {
        [sessionIncrementField]: sessionNumber,
        stars: increment(earnedStars),
        activities: arrayUnion(newActivity),
      });
    } else {
      // Replay mode: Do not advance progress, award 1 star practice reward
      const replayActivity: ChildActivity = {
        id: Date.now().toString(),
        type: sessionType,
        title: `إعادة ${sessionTitle}`,
        timestamp: new Date().toISOString(),
      };

      await updateDoc(childRef, {
        stars: increment(1),
        activities: arrayUnion(replayActivity),
      });
    }
  } catch (error) {
    console.error("Error recording session completion:", error);
  }
};
