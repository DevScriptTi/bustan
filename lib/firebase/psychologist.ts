import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  or,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

export interface ChildBehavioralNote {
  date: string;
  note: string;
  author?: "parent" | "ai_agent";
}

export type ReviewStatus = "none" | "pending" | "accepted" | "rejected";

export interface SpecialistChildData {
  id: string;
  name: string;
  parentId: string;
  parentName: string;
  parentEmail?: string;
  stars: number;
  memoryEvalDone: boolean;
  needsMemoryTherapy: boolean;
  completedMemorySessions: number;
  totalMemorySessions: number;
  oddEvalDone: boolean;
  needsOddTherapy: boolean;
  completedOddSessions: number;
  totalOddSessions: number;
  behavioralNotes: ChildBehavioralNote[];
  latestNote?: ChildBehavioralNote | null;
  oddAlertLevel: "LOW" | "MEDIUM" | "HIGH";
  reviewStatus: ReviewStatus;
  assignedPsychologistId?: string;
  pendingReviewWith?: string;
  pendingReviewWithName?: string;
  psychologistDirectives?: string;
  createdAt?: any;
}

/**
 * Real-time listener scoped ONLY to children assigned to or requested of the current psychologist.
 * Respects patient privacy by preventing fetching of unassigned/unrequested children.
 */
export function subscribePsychologistChildren(
  psychologistUid: string,
  onUpdate: (children: SpecialistChildData[]) => void
): Unsubscribe {
  if (!psychologistUid) {
    onUpdate([]);
    return () => {};
  }

  const parentCache = new Map<string, { name: string; email: string }>();

  const childrenQuery = query(
    collection(db, "children"),
    or(
      where("assignedPsychologistId", "==", psychologistUid),
      where("pendingReviewWith", "==", psychologistUid)
    )
  );

  const unsubscribe = onSnapshot(
    childrenQuery,
    async (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }

      const results: SpecialistChildData[] = [];

      for (const childDoc of snapshot.docs) {
        const data = childDoc.data();
        const parentId = data.parentId || "";

        let parentName = "غير محدد";
        let parentEmail = "";

        if (parentId) {
          if (parentCache.has(parentId)) {
            const cached = parentCache.get(parentId)!;
            parentName = cached.name;
            parentEmail = cached.email;
          } else {
            try {
              const userSnap = await getDoc(doc(db, "users", parentId));
              if (userSnap.exists()) {
                const uData = userSnap.data();
                parentName = uData.fullName || uData.name || "والد الطفل";
                parentEmail = uData.email || "";
                parentCache.set(parentId, { name: parentName, email: parentEmail });
              }
            } catch (e) {
              console.warn("Could not fetch parent details:", parentId, e);
            }
          }
        }

        const notes: ChildBehavioralNote[] = Array.isArray(data.behavioralNotes) ? data.behavioralNotes : [];
        const latestNote = notes.length > 0 ? notes[notes.length - 1] : null;

        const oddCompleted = data.completedOddSessions ?? data.oddCompleted ?? 0;
        const memoryCompleted = data.completedMemorySessions ?? data.memoryCompleted ?? 0;

        let oddAlertLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
        if (data.needsOddTherapy && oddCompleted < 3) {
          oddAlertLevel = "HIGH";
        } else if (data.needsOddTherapy) {
          oddAlertLevel = "MEDIUM";
        }

        results.push({
          id: childDoc.id,
          name: data.name || "طفل",
          parentId: parentId,
          parentName: parentName,
          parentEmail: parentEmail,
          stars: data.stars || 0,
          memoryEvalDone: !!data.memoryEvalDone,
          needsMemoryTherapy: !!data.needsMemoryTherapy,
          completedMemorySessions: memoryCompleted,
          totalMemorySessions: 11,
          oddEvalDone: !!data.oddEvalDone,
          needsOddTherapy: !!data.needsOddTherapy,
          completedOddSessions: oddCompleted,
          totalOddSessions: 7,
          behavioralNotes: notes,
          latestNote: latestNote,
          oddAlertLevel: oddAlertLevel,
          reviewStatus: (data.reviewStatus as ReviewStatus) || "none",
          assignedPsychologistId: data.assignedPsychologistId || "",
          pendingReviewWith: data.pendingReviewWith || "",
          pendingReviewWithName: data.pendingReviewWithName || "",
          psychologistDirectives: data.psychologistDirectives || "",
          createdAt: data.createdAt,
        });
      }

      onUpdate(results);
    },
    (error) => {
      console.error("Error in real-time psychologist children listener:", error);
      onUpdate([]);
    }
  );

  return unsubscribe;
}
