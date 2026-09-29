import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { getFallbackExplanation, getFallbackSummary, getFallbackQuiz } from './src/knowledgeFallback.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Helper function to call Gemini with resilient fallback across approved models
async function generateWithFallback(options: {
  contents: string | any;
  config?: any;
}) {
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastErr: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} error:`, err?.message || err);
      lastErr = err;
    }
  }
  throw lastErr;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Download project zip endpoint
app.get('/api/download/project', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    const rootDir = __dirname;

    const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', '.vite']);
    const IGNORED_FILES = new Set(['.env']);

    function addFilesRecursively(currentPath: string, zipFolder: JSZip) {
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        if (item.startsWith('.') && item !== '.env.example' && item !== '.gitignore') continue;
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!IGNORED_DIRS.has(item)) {
            const nextFolder = zipFolder.folder(item);
            if (nextFolder) {
              addFilesRecursively(fullPath, nextFolder);
            }
          }
        } else if (stat.isFile()) {
          if (!IGNORED_FILES.has(item)) {
            const content = fs.readFileSync(fullPath);
            zipFolder.file(item, content);
          }
        }
      }
    }

    addFilesRecursively(rootDir, zip);

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="edugenie-project.zip"');
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (err: any) {
    console.error('Error generating project zip:', err);
    res.status(500).json({ error: 'Failed to generate project zip.' });
  }
});

// Explain endpoint: Simple, easy, engaging explanation
app.post('/api/edu/explain', async (req: Request, res: Response) => {
  try {
    const { topic, gradeLevel } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Please enter a topic or question to explain.' });
      return;
    }

    const levelGuide = gradeLevel ? `Target audience level: ${gradeLevel}.` : 'Target audience: Middle/High school students (approachable yet accurate).';

    const prompt = `You are EduGenie, an encouraging, friendly, and brilliant learning assistant for students.
Your goal is to explain the following topic or question in a way that is simple, clear, engaging, and memorable.
${levelGuide}

Topic/Question: "${topic.trim()}"

Format your response cleanly in Markdown using these structured sections:
1. 💡 **In a Nutshell**: 1-2 crystal clear, jargon-free sentences defining the core idea.
2. 🎈 **The Simple Analogy**: A vivid, relatable real-world comparison or metaphor that makes the concept click instantly.
3. 🔍 **How It Works (Step-by-Step)**: 3-4 bullet points breaking down the mechanics or key components simply.
4. 🌟 **Why It Matters & Real-World Example**: A fun application, surprising fact, or why students should care.
5. 🧠 **Quick Check**: 1 quick reflective question students can ask themselves to test their understanding.

Keep the language warm, upbeat, and accessible. Avoid unnecessary academic jargon unless defined simply on the spot.`;

    const response = await generateWithFallback({
      contents: prompt,
    });

    const outputText = response.text || '';
    if (!outputText) {
      throw new Error('No explanation returned from Gemini.');
    }

    res.json({
      type: 'explain',
      topic: topic.trim(),
      content: outputText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('Gemini /api/edu/explain error, generating resilient fallback:', error?.message || error);
    const fallbackText = getFallbackExplanation(req.body.topic || '', req.body.gradeLevel);
    res.json({
      type: 'explain',
      topic: (req.body.topic || '').trim(),
      content: fallbackText,
      timestamp: new Date().toISOString(),
    });
  }
});

// Summarize endpoint: Concise, high-yield summary
app.post('/api/edu/summarize', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Please enter a topic or text to summarize.' });
      return;
    }

    const prompt = `You are EduGenie, an expert study coach and educational summarizer for students.
Create a high-yield, scannable, and ultra-clear summary of the following topic or question:
"${topic.trim()}"

Format your response cleanly in Markdown using these structured sections:
- 📌 **Executive Overview**: 2 concise sentences summarizing the core subject.
- 🎯 **Key Takeaways**:
  * 3-5 punchy, essential bullet points containing the highest-value concepts students must remember for exams.
- 🏷️ **Essential Vocabulary**:
  * 2-3 key terms with 1-line definitions.
- ⚡ **TL;DR**: Exactly one memorable, impactful summary sentence.

Keep it tight, organized, easy to review before an exam or class.`;

    const response = await generateWithFallback({
      contents: prompt,
    });

    const outputText = response.text || '';
    if (!outputText) {
      throw new Error('No summary returned from Gemini.');
    }

    res.json({
      type: 'summarize',
      topic: topic.trim(),
      content: outputText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('Gemini /api/edu/summarize error, generating resilient fallback:', error?.message || error);
    const fallbackText = getFallbackSummary(req.body.topic || '');
    res.json({
      type: 'summarize',
      topic: (req.body.topic || '').trim(),
      content: fallbackText,
      timestamp: new Date().toISOString(),
    });
  }
});

// Quiz endpoint: 5 multiple-choice questions with answers
app.post('/api/edu/quiz', async (req: Request, res: Response) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'Please enter a topic to create a quiz.' });
      return;
    }

    const prompt = `You are EduGenie, an expert educational assessment creator.
Create a high-quality 5-question multiple-choice quiz for students on the topic: "${topic.trim()}".

Requirements:
- Exactly 5 multiple-choice questions.
- Questions should test understanding progressively:
  Question 1: Foundational concept / definition
  Question 2: Core mechanism or rule
  Question 3: Practical scenario or application
  Question 4: Common misconception or nuance
  Question 5: Synthesis / critical thinking question
- Each question must have exactly 4 choices (index 0, 1, 2, 3).
- Provide the correctIndex (0, 1, 2, or 3).
- Provide a clear, educational explanation explaining why the correct option is right and correcting common misconceptions.`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: {
              type: Type.STRING,
              description: 'The topic of the quiz',
            },
            questions: {
              type: Type.ARRAY,
              description: 'Array of exactly 5 multiple choice questions',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: {
                    type: Type.INTEGER,
                    description: 'Question number 1 to 5',
                  },
                  question: {
                    type: Type.STRING,
                    description: 'The multiple choice question text',
                  },
                  options: {
                    type: Type.ARRAY,
                    description: 'List of exactly 4 choices (A, B, C, D)',
                    items: {
                      type: Type.STRING,
                    },
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: '0-based index of the correct answer (0, 1, 2, or 3)',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Brief, clear explanation of why this answer is correct',
                  },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['topic', 'questions'],
        },
      },
    });

    const rawJson = response.text || '{}';
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawJson);
    } catch (parseErr) {
      console.error('Failed to parse JSON quiz output:', rawJson);
      throw new Error('Received malformed quiz format from AI.');
    }

    if (!Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
      throw new Error('Quiz questions were not generated properly.');
    }

    // Ensure questions are sanitized and standardized
    const sanitizedQuestions: QuizQuestion[] = parsedData.questions.slice(0, 5).map((q: any, idx: number) => {
      const options = Array.isArray(q.options) && q.options.length >= 2
        ? q.options.slice(0, 4)
        : ['Option A', 'Option B', 'Option C', 'Option D'];

      let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
      if (correctIndex < 0 || correctIndex >= options.length) {
        correctIndex = 0;
      }

      return {
        id: idx + 1,
        question: q.question || `Question ${idx + 1}`,
        options,
        correctIndex,
        explanation: q.explanation || 'This is the verified correct answer based on key principles.',
      };
    });

    res.json({
      type: 'quiz',
      topic: topic.trim(),
      questions: sanitizedQuestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.warn('Gemini /api/edu/quiz error, generating resilient fallback:', error?.message || error);
    const fallbackQuestions = getFallbackQuiz(req.body.topic || '');
    res.json({
      type: 'quiz',
      topic: (req.body.topic || '').trim(),
      questions: fallbackQuestions,
      timestamp: new Date().toISOString(),
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built dist assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
