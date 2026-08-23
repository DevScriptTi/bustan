import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, username, phoneNumber, fullName } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "المستخدم غير محدد" },
        { status: 400 }
      );
    }

    const trimmedUsername = (username || "").trim().toLowerCase();
    const trimmedPhone = (phoneNumber || "").trim();
    const trimmedName = (fullName || "").trim();

    if (trimmedUsername) {
      // 1. Query entire users collection for duplicate username
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", trimmedUsername));
      const querySnapshot = await getDocs(q);

      const existingDoc = querySnapshot.docs.find((d) => d.id !== uid);
      if (existingDoc) {
        return NextResponse.json(
          { error: "اسم المستخدم هذا محجوز مسبقاً، يرجى اختيار اسم آخر." },
          { status: 400 }
        );
      }
    }

    // 2. Update user profile in Firestore
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      username: trimmedUsername,
      phoneNumber: trimmedPhone,
      fullName: trimmedName,
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث الملف الشخصي بنجاح",
    });
  } catch (error: any) {
    console.error("Error updating psychologist profile:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث البيانات" },
      { status: 500 }
    );
  }
}
