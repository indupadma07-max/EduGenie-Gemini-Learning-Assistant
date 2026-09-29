# EduGenie - AI Learning Assistant for Students

EduGenie is a Google Gemini powered educational companion for students to get simple explanations, concise study summaries, and interactive 5-question quizzes on any topic.

## 🚀 Features

- **Explain**: Converts complex concepts into simple definitions, real-world analogies, step-by-step guides, and quick comprehension checks.
- **Summarize**: Produces high-yield exam takeaways, key vocabulary, and a 1-line TL;DR.
- **Quiz**: Creates interactive 5-question multiple-choice quizzes with instant feedback, score calculation, explanations, and confetti celebrations.
- **Accessibility & Study Tools**:
  - Text-to-speech audio reader (Listen).
  - One-click copy to clipboard.
  - Print study guide / cheat sheet.
  - Local history tracking.
- **Responsive Design**: Works seamlessly on mobile phones, tablets, and desktop computers.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, Vite middleware
- **AI Model**: Google Gemini API (`@google/genai`)

## 💻 How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Setup
1. Unzip the project folder and open a terminal in the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and paste your Gemini API key:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
   ```

### 3. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```
