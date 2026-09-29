import React, { useState, useEffect, useRef } from 'react';
import {
  Lightbulb,
  FileText,
  Award,
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Printer,
  History,
  Trash2,
  BookOpen,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Download,
  FolderDown,
  Terminal,
  CheckCircle
} from 'lucide-react';
import { FormattedContent } from './components/FormattedContent';
import { QuizCard } from './components/QuizCard';
import { QuizQuestion } from './types';

interface HistoryItem {
  id: string;
  topic: string;
  type: 'explain' | 'summarize' | 'quiz';
  content?: string;
  questions?: QuizQuestion[];
  timestamp: string;
}

const SAMPLE_TOPICS = [
  { label: '🌿 Photosynthesis', text: 'Photosynthesis: How plants convert sunlight into food' },
  { label: '⚡ Newton\'s Laws', text: 'Newton\'s 3 Laws of Motion explained simply' },
  { label: '🧬 DNA Structure', text: 'The structure of DNA and how genes work' },
  { label: '🌌 Black Holes', text: 'What happens inside a black hole?' },
  { label: '📐 Pythagorean Theorem', text: 'Pythagorean Theorem: a² + b² = c² and real-world uses' },
  { label: '🏰 French Revolution', text: 'Key causes and consequences of the French Revolution' },
  { label: '💻 Algorithms', text: 'What is an algorithm and how do computers use them?' },
];

export default function App() {
  const [topic, setTopic] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('Middle / High School');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<'explain' | 'summarize' | 'quiz' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active result state
  const [activeResult, setActiveResult] = useState<{
    type: 'explain' | 'summarize' | 'quiz';
    topic: string;
    content?: string;
    questions?: QuizQuestion[];
    timestamp: string;
  } | null>(null);

  // History state in localStorage
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('edugenie_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const answerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync history with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edugenie_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Clean up speech synthesis when unmounting or switching result
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!activeResult) return;

    let textToRead = '';
    if (activeResult.type === 'quiz') {
      textToRead = `Here is a 5-question quiz on ${activeResult.topic}. ${
        activeResult.questions
          ?.map((q, i) => `Question ${i + 1}: ${q.question}`)
          .join('. ')
      }`;
    } else {
      // Strip markdown symbols for clean audio reading
      textToRead = (activeResult.content || '')
        .replace(/[#*`~]/g, '')
        .replace(/💡|🎈|🔍|🌟|🧠|📌|🎯|⚡/g, '');
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopy = () => {
    if (!activeResult) return;
    let fullText = '';
    if (activeResult.type === 'quiz' && activeResult.questions) {
      fullText = `EduGenie Quiz: ${activeResult.topic}\n\n` +
        activeResult.questions
          .map(
            (q, i) =>
              `${i + 1}. ${q.question}\n` +
              q.options.map((opt, oIdx) => `   ${['A', 'B', 'C', 'D'][oIdx]}) ${opt}`).join('\n') +
              `\nAnswer: ${['A', 'B', 'C', 'D'][q.correctIndex]}\nExplanation: ${q.explanation}\n`
          )
          .join('\n');
    } else {
      fullText = `EduGenie ${activeResult.type === 'explain' ? 'Explanation' : 'Summary'}: ${activeResult.topic}\n\n${activeResult.content}`;
    }

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const executeAction = async (actionType: 'explain' | 'summarize' | 'quiz') => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError('Please type a question or topic first in the box above.');
      textareaRef.current?.focus();
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingAction(actionType);

    // Cancel speech if reading previous result
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const endpoint =
        actionType === 'explain'
          ? '/api/edu/explain'
          : actionType === 'summarize'
          ? '/api/edu/summarize'
          : '/api/edu/quiz';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: trimmedTopic,
          gradeLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong while processing your request.');
      }

      const newResult = {
        type: actionType,
        topic: trimmedTopic,
        content: data.content,
        questions: data.questions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setActiveResult(newResult);

      // Add to history (limit to last 20)
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        topic: trimmedTopic,
        type: actionType,
        content: data.content,
        questions: data.questions,
        timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };

      setHistory((prev) => [newHistoryItem, ...prev.filter((h) => h.topic !== trimmedTopic || h.type !== actionType)].slice(0, 20));

      // Smooth scroll down to answer area
      setTimeout(() => {
        answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error('Action error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter triggers "Explain"
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeAction('explain');
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setTopic(item.topic);
    setActiveResult({
      type: item.type,
      topic: item.topic,
      content: item.content,
      questions: item.questions,
      timestamp: item.timestamp,
    });
    setShowHistoryModal(false);
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDownloadZip = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/api/download/project';
    link.download = 'edugenie-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-sm text-white shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
                  EduGenie
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                The smart AI learning assistant for students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                title="View recent explanations & quizzes"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Recent ({history.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors shadow-2xs"
              title="Download project files (.ZIP)"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download App</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>For all grades & subjects</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 w-full flex-1">
        {/* Hero Banner / Instructions */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-800 text-xs sm:text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Ask anything • Learn simply • Test your knowledge</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What would you like to learn today?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
            Type any question, homework topic, or concept. Choose <span className="font-semibold text-indigo-600">Explain</span>, <span className="font-semibold text-emerald-600">Summarize</span>, or get a <span className="font-semibold text-amber-600">5-Question Quiz</span>!
          </p>
        </div>

        {/* Input Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 transition-all hover:shadow-md">
          {/* Grade level / audience selector */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <label htmlFor="topic-input" className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Your Question or Topic</span>
            </label>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="hidden sm:inline">Level:</span>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-2.5 py-1 rounded-lg border-0 cursor-pointer text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Elementary School">Elementary School</option>
                <option value="Middle / High School">Middle / High School</option>
                <option value="High School AP / Honors">High School AP / Honors</option>
                <option value="College / In-depth">College / In-depth</option>
              </select>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              id="topic-input"
              ref={textareaRef}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., How does photosynthesis work? What caused World War I? Explain Ohm's law..."
              rows={3}
              className="w-full text-slate-900 placeholder:text-slate-400 bg-slate-50/70 hover:bg-slate-50 focus:bg-white rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none p-4 text-base resize-none transition-all"
            />
            {topic && (
              <button
                type="button"
                onClick={() => setTopic('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded-md bg-white border border-slate-200 transition-colors shadow-2xs"
                title="Clear input"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick topic suggestion pills */}
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs no-scrollbar">
            <span className="text-slate-500 font-medium flex-shrink-0 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Try:
            </span>
            {SAMPLE_TOPICS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(item.text)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200/80 transition-colors cursor-pointer text-xs"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* The 3 Required Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            {/* 1. Explain Button */}
            <button
              type="button"
              disabled={loading}
              onClick={() => executeAction('explain')}
              className={`group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl font-bold transition-all shadow-sm ${
                loadingAction === 'explain'
                  ? 'bg-indigo-700 text-white ring-2 ring-indigo-400 ring-offset-2'
                  : 'bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] text-white shadow-indigo-100 hover:shadow-indigo-200'
              } ${loading && loadingAction !== 'explain' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2 text-base sm:text-lg">
                <Lightbulb className={`w-5 h-5 ${loadingAction === 'explain' ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                <span>{loadingAction === 'explain' ? 'Explaining...' : 'Explain'}</span>
              </div>
              <span className="text-[11px] font-normal text-indigo-100/90 mt-0.5">
                Simple & easy to understand
              </span>
            </button>

            {/* 2. Summarize Button */}
            <button
              type="button"
              disabled={loading}
              onClick={() => executeAction('summarize')}
              className={`group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl font-bold transition-all shadow-sm ${
                loadingAction === 'summarize'
                  ? 'bg-emerald-700 text-white ring-2 ring-emerald-400 ring-offset-2'
                  : 'bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white shadow-emerald-100 hover:shadow-emerald-200'
              } ${loading && loadingAction !== 'summarize' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className={`w-5 h-5 ${loadingAction === 'summarize' ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                <span>{loadingAction === 'summarize' ? 'Summarizing...' : 'Summarize'}</span>
              </div>
              <span className="text-[11px] font-normal text-emerald-100/90 mt-0.5">
                Short bulleted key takeaways
              </span>
            </button>

            {/* 3. Quiz Button */}
            <button
              type="button"
              disabled={loading}
              onClick={() => executeAction('quiz')}
              className={`group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl font-bold transition-all shadow-sm ${
                loadingAction === 'quiz'
                  ? 'bg-amber-700 text-white ring-2 ring-amber-400 ring-offset-2'
                  : 'bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-white shadow-amber-100 hover:shadow-amber-200'
              } ${loading && loadingAction !== 'quiz' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-2 text-base sm:text-lg">
                <Award className={`w-5 h-5 ${loadingAction === 'quiz' ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                <span>{loadingAction === 'quiz' ? 'Creating Quiz...' : 'Quiz'}</span>
              </div>
              <span className="text-[11px] font-normal text-amber-100/90 mt-0.5">
                5 Multiple-choice questions
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center justify-between mt-3 text-[11px] text-slate-400 px-1">
            <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border text-slate-600 font-mono">Ctrl+Enter</kbd> to Explain</span>
            <span>Accurate, safe, student-ready Gemini models</span>
          </div>
        </div>

        {/* Loading State Animation */}
        {loading && (
          <div className="mt-8 bg-white rounded-3xl border border-indigo-100 p-8 shadow-sm text-center animate-in fade-in">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-4 animate-bounce">
              <Sparkles className="w-7 h-7 text-indigo-600 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {loadingAction === 'explain' && 'EduGenie is simplifying your topic...'}
              {loadingAction === 'summarize' && 'Distilling key takeaways & highlights...'}
              {loadingAction === 'quiz' && 'Crafting 5 multiple-choice questions & answers...'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Using Google Gemini 3.8 to format the perfect learning material for your topic.
            </p>

            <div className="max-w-xs mx-auto mt-6">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-500 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </div>
        )}

        {/* ANSWER AREA: Shown clearly below the text box */}
        {!loading && activeResult && (
          <div ref={answerRef} className="mt-8 scroll-mt-20">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Result Header & Actions Bar */}
              <div className="bg-slate-50/90 border-b border-slate-200/80 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {activeResult.type === 'explain' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                      Explanation
                    </span>
                  )}
                  {activeResult.type === 'summarize' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Summary
                    </span>
                  )}
                  {activeResult.type === 'quiz' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      5-Question Quiz
                    </span>
                  )}

                  <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                    {activeResult.topic}
                  </h3>
                </div>

                {/* Toolbar buttons: Audio, Copy, Regenerate, Print */}
                <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto">
                  {/* Read Aloud */}
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      isSpeaking
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                    title={isSpeaking ? 'Stop listening' : 'Read aloud with Text-to-Speech'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden xs:inline">Listen</span>
                      </>
                    )}
                  </button>

                  {/* Copy */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden xs:inline">Copy</span>
                      </>
                    )}
                  </button>

                  {/* Regenerate */}
                  <button
                    type="button"
                    onClick={() => executeAction(activeResult.type)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    title="Generate a fresh response"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden xs:inline">Regenerate</span>
                  </button>

                  {/* Print */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    title="Print study sheet"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden xs:inline">Print</span>
                  </button>
                </div>
              </div>

              {/* Main Content Body */}
              <div className="p-5 sm:p-8">
                {activeResult.type === 'quiz' && activeResult.questions ? (
                  <QuizCard topic={activeResult.topic} questions={activeResult.questions} />
                ) : (
                  <FormattedContent content={activeResult.content || ''} />
                )}
              </div>

              {/* Footer Switcher Buttons */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <span className="font-medium text-slate-500">
                  Try another view on "{activeResult.topic}":
                </span>
                <div className="flex items-center gap-2">
                  {activeResult.type !== 'explain' && (
                    <button
                      type="button"
                      onClick={() => executeAction('explain')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 font-semibold transition-colors flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                      View Explanation
                    </button>
                  )}
                  {activeResult.type !== 'summarize' && (
                    <button
                      type="button"
                      onClick={() => executeAction('summarize')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 font-semibold transition-colors flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      View Summary
                    </button>
                  )}
                  {activeResult.type !== 'quiz' && (
                    <button
                      type="button"
                      onClick={() => executeAction('quiz')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 hover:text-amber-700 border border-slate-200 font-semibold transition-colors flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Take Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Welcome Guide when no result is loaded */}
        {!loading && !activeResult && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-indigo-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 font-bold">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">1. Explain</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Struggling with a concept? Get a simple, conversational breakdown with vivid analogies and intuitive steps.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-emerald-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">2. Summarize</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Short on study time? Generate high-yield bullet points, essential vocabulary, and a memorable TL;DR.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-amber-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-3 font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">3. Quiz</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Test your mastery! Instant 5 multiple-choice questions with real-time feedback, explanations, and score tracking.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* History Modal / Drawer */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-base">Recent Study History</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {history.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">No history yet.</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            item.type === 'explain'
                              ? 'bg-indigo-100 text-indigo-700'
                              : item.type === 'summarize'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs text-slate-400">{item.timestamp}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-1 line-clamp-1">
                        {item.topic}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Download Project Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Download EduGenie</h3>
                  <p className="text-xs text-slate-500">Get the full project code to run on your computer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Primary Download Action */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 p-5 rounded-2xl border border-indigo-200/80 text-center">
                <FolderDown className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-base">Instant ZIP Archive</h4>
                <p className="text-xs text-slate-600 mt-1 mb-4">
                  Download all source code, Express backend, React UI, Gemini configurations, and README.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                  <span>{isDownloading ? 'Packaging ZIP Archive...' : 'Download edugenie-project.zip'}</span>
                </button>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Quick Local Setup (3 steps)
                </h4>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px]">1</span>
                      <span>Extract & install dependencies</span>
                    </div>
                    <pre className="p-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">npm install</pre>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px]">2</span>
                      <span>Configure your Gemini API Key</span>
                    </div>
                    <p className="text-slate-500 text-[11px] mb-1.5">Create a <code>.env</code> file with your key from Google AI Studio:</p>
                    <pre className="p-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">GEMINI_API_KEY="your-api-key"</pre>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center text-[10px]">3</span>
                      <span>Launch your app</span>
                    </div>
                    <pre className="p-2 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto">npm run dev</pre>
                    <p className="text-slate-500 text-[11px] mt-1">Open <code>http://localhost:3000</code> in your browser.</p>
                  </div>
                </div>
              </div>

              {/* AI Studio Tip */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>AI Studio Export:</strong> You can also export this repository directly to your personal GitHub account using the menu at the top of Google AI Studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-400 py-4 border-t border-slate-200/60 max-w-4xl mx-auto w-full px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>EduGenie • Learning Assistant for Students</span>
        </div>
        <div>
          Powered by Google Gemini 3.8 Flash
        </div>
      </footer>
    </div>
  );
}
