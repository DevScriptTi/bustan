# منصة بستان (Bustan Platform) - Pediatric Mental Health Therapy and Evaluation

Bustan is a pediatric mental health therapy and evaluation platform focused on **Memory** and **ODD (Oppositional Defiant Disorder)**.

---

## 📋 Project Memory & Core Rules

> [!IMPORTANT]
> **Always refer to this README before generating new components.**

### 1. Technology Stack
* **Framework**: Next.js (App Router with TypeScript)
* **Styling**: Tailwind CSS (Tailwind v4 theme configurations in CSS)
* **Backend & Database**: Firebase (Authentication & Firestore Database)

### 2. Design Rules & Aesthetics
* **Language & Direction**: Default to Arabic with Right-to-Left (RTL) layout (`lang="ar" dir="rtl"`).
* **Typography**: Cairo Google Font (`font-sans`).
* **Color Palette**: Calming, soft pastel tones suited for children:
  * **Mint Green (`mint-*`)**: Calming, positive behavior theme.
  * **Sky Blue (`sky-*`)**: Cognitive, memory and focus training.
  * **Pale Yellow / Cream (`cream-*`)**: Warm highlights.
  * **Lavender (`lavender-*`)** & **Coral (`peach-*`)**: Playful sub-themes.
* **Responsiveness**: Fully responsive layout optimized for Tablets and Mobile devices.
* **Feel**: Premium, interactive, playful, clean, and welcoming interfaces. Avoid plain colors or placeholders.

### 3. User Flow
1. **Landing Page (`/`)**: Parent enters a 10-character 'Activation Key'.
2. **Register Page (`/register`)**: Parent signs up (Email, Password, First Name, Last Name) after validation.
3. **Parent Dashboard (`/dashboard`)**: Parent manages children profiles, views statistics, and starts therapy sessions.
4. **Therapy Hub (`/therapy`)**: Child accesses interactive Memory training or ODD behavior scenarios.

---

## 🛠️ Getting Started

### Installation
```bash
npm install
```

### Development Server
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
