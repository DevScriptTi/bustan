# 📋 BUSTAN_RULES.md — منصة بستان: Source of Truth for AI Generations

This file is the **definitive style and architecture guide** for the Bustan (بستان) platform.
All AI-generated code **MUST** conform to these rules without exception.

---

## 🌐 Global UI Rules

| Rule | Value |
|---|---|
| **Direction** | `dir="rtl"` on all page wrappers |
| **Language** | Arabic (`lang="ar"` on `<html>`) — already set in `app/layout.tsx` |
| **Font** | Cairo (Google Fonts) — already configured in `app/layout.tsx` |
| **Color palette** | Pastel only — use `sky`, `mint`, `cream`, `peach`, `lavender` custom tokens from `globals.css` |
| **Touch targets** | Minimum `py-4 px-6` on all interactive buttons for child-friendly touch areas |
| **Transitions** | All interactive elements must have `transition-all` or `transition-colors` |

---

## 🗂️ Project Structure

```
app/
├── page.tsx                         # Activation key landing page
├── register/page.tsx                # Parent registration
├── dashboard/page.tsx               # Parent dashboard (child profiles)
├── assessment/
│   ├── memory/page.tsx              # Memory assessment
│   └── odd/page.tsx                 # ODD behavioral assessment
└── therapy/
    ├── page.tsx                     # Therapy hub (selector)
    ├── memory/
    │   ├── layout.tsx               # Memory session stepper (sessions 1–11)
    │   └── session-[1-11]/page.tsx  # Cognitive memory exercises
    └── odd/
        ├── layout.tsx               # ODD session stepper (sessions 1–8)
        └── session-[1-8]/page.tsx   # ODD behavioral exercises
```

---

## 🧩 Standardized Components (CRITICAL — Do NOT Deviate)

### 1. Persistent Exit Button
**Every session page MUST have this link as the first child of the main wrapper.**

```tsx
<Link
  href="/dashboard"
  className="absolute top-6 left-6 px-4 py-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-lg flex items-center gap-2 transition-colors font-medium z-50"
>
  <span>🏠 خروج للرئيسية</span>
</Link>
```

- Must be inside a `relative`-positioned wrapper (add `relative` to outer div if missing).
- Must be visible and interactive at **ALL** activity steps.
- `Link` must be imported from `"next/link"`.

---

### 2. Standardized Restart Button (End Screen)
**Every session end/success screen MUST use this exact button.**

```tsx
<button
  onClick={handleResetSession}
  className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-full shadow-md transition-all flex items-center justify-center gap-2 text-lg"
>
  <span>🔄 إعادة الحصة</span>
</button>
```

- The handler must be named `handleResetSession` (or `handleRestart` if context demands).
- This button appears **only on the end/success screen**, not during the activity.
- The existing rose-colored header restart buttons are **separate** from this rule — they are activity-level resets and use `bg-amber-400` as well for consistency.

---

### 3. Header Restart Button (In-Session)
**The in-session restart buttons in the header area must use this pattern:**

```tsx
{/* Desktop */}
<button
  onClick={handleResetSession}
  className="hidden sm:flex px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-full shadow-md transition-all items-center gap-2 text-base"
>
  <span>🔄 إعادة الحصة</span>
</button>

{/* Mobile */}
<button
  onClick={handleResetSession}
  className="w-full sm:hidden flex justify-center px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-full shadow-md transition-all items-center gap-2 text-base"
>
  <span>🔄 إعادة الحصة</span>
</button>
```

---

## 🎨 Memory Program Color Theme
- Primary: `sky` (sky-500, sky-700, sky-900)
- Accent: `green` for success states
- Background cards: `bg-white` with `border-sky-100`

## 🛡️ ODD Program Color Theme
- Primary: `indigo` and `mint`
- Accent: `peach` and `cream` for option cards
- Background: `bg-white` with `border-indigo-50`

---

## 🔒 Locked Session Navigation
- In `layout.tsx` steppers, **future sessions must appear as locked** (🔒 icon, `opacity-60 cursor-not-allowed`).
- Completed sessions (session number < current) appear in green with a ✓ checkmark and are clickable `Link` components.
- The current session is highlighted with a `scale-105` pill and matching program color.

---

## ✅ Session Page Checklist (Before Submitting Any Session)
- [ ] `dir="rtl"` on the main page wrapper
- [ ] Outer wrapper has `relative` positioning
- [ ] Exit button (`🏠 خروج للرئيسية`) is the first child inside the wrapper
- [ ] Header has h1 title + amber restart button (desktop + mobile variants)
- [ ] End/success screen has the amber `🔄 إعادة الحصة` button
- [ ] All interactive buttons have `py-4` or larger touch target
- [ ] `Link` is imported from `"next/link"` if used
- [ ] No hardcoded non-pastel colors (no plain red/blue/green without context)
- [ ] `<h1>` uses `text-slate-800 text-center`
- [ ] Activity `<h2>` uses `text-teal-600`

---

## 🎨 Typography Color System (Strict)

> [!IMPORTANT]
> These rules are **non-negotiable**. Mismatched heading colors were a recurring bug — this section locks them permanently.

### Heading Colors

| Element | Class | Notes |
|---|---|---|
| **Main Session Title `<h1>`** | `text-slate-800 text-center` | Always centered; replaces any `text-sky-900`, `text-indigo-700`, `text-sky-700` |
| **Activity Subtitle `<h2>`** | `text-teal-600` | For in-session activity labels only |
| **Success/End-Screen `<h2>`** | Keep as-is (`text-sky-800`, etc.) | These are celebratory headers, not activity titles |

### Correct Examples

```tsx
{/* ✅ Correct h1 */}
<h1 className="text-3xl font-bold mb-6 text-slate-800 text-center">الحصة 1: تحديد هوية الكلمة</h1>

{/* ✅ Correct activity h2 */}
<h2 className="text-2xl font-semibold mb-4 text-teal-600">النشاط 1: التعرف على الكلمة</h2>

{/* ❌ Wrong — never use these on session titles */}
<h1 className="text-sky-900 ...">  ← banned
<h1 className="text-indigo-700 ...">  ← banned
<h2 className="text-sky-700 ...">  ← banned on activity subtitles
```

### Brand Color Reference

| Purpose | Color | Token |
|---|---|---|
| Platform logo | Teal | `text-teal-700` |
| Session titles `h1` | Dark Slate | `text-slate-800` |
| Activity subtitles `h2` | Teal | `text-teal-600` |
| In-session restart button | Amber | `bg-amber-400` |
| Next session button | Teal | `bg-teal-500` |
| Dashboard return button | Sky | `bg-sky-200` |

---

## 🏗️ Session Architecture (No DRY Violations)

> [!CAUTION]
> Violating these rules will make backend integration (progress tracking, analytics) impossible to implement cleanly.

### Rule

- You **MUST NEVER** hardcode success screens, session titles, or routing buttons inside individual `page.tsx` files.
- **ALL** session `page.tsx` files **MUST** wrap their interactive content inside the `<SessionContainer>` component.

### Component Location

```
components/therapy/SessionContainer.tsx
```

### Required Props

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | The `<h1>` session title (e.g. "الحصة 1: تحديد هوية الكلمة") |
| `activityTitle` | `string` | The `<h2>` activity subtitle (e.g. "النشاط 1: التعرف على الكلمة") |
| `isCompleted` | `boolean` | Drives the success screen — set to `true` when all activities are done |
| `onRestart` | `() => void` | Callback wired to the session's state reset function |
| `nextSessionPath` | `string` | Route string for the "Next Session" button (e.g. `"/therapy/memory/session-2"`) |
| `children` | `ReactNode` | The actual interactive game JSX |

### Usage Pattern

```tsx
// ✅ Correct — page.tsx only contains game logic + SessionContainer
export default function Session1() {
  const [isCompleted, setIsCompleted] = useState(false);
  const handleRestart = () => setIsCompleted(false);

  return (
    <SessionContainer
      title="الحصة 1: تحديد هوية الكلمة"
      activityTitle="النشاط 1: التعرف على الكلمة"
      isCompleted={isCompleted}
      onRestart={handleRestart}
      nextSessionPath="/therapy/memory/session-2"
    >
      {/* Game JSX here */}
    </SessionContainer>
  );
}

// ❌ Wrong — never put success screens or routing in page.tsx directly
const renderSuccess = () => (
  <div>... hardcoded success UI ...</div>  // ← banned
);
```

### Backend Integration Note

The `SessionContainer` component contains a commented-out `useEffect` that is the **designated hook point** for the future backend API call to save session progress. When the API is ready, only `SessionContainer.tsx` needs to be modified — **zero changes to any `page.tsx` file**.
