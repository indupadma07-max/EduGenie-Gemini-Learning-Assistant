import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, RotateCcw, Eye, EyeOff, Award, HelpCircle, Sparkles } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuizCardProps {
  topic: string;
  questions: QuizQuestion[];
}

export const QuizCard: React.FC<QuizCardProps> = ({ topic, questions }) => {
  // Store user answers: mapping questionId -> selectedOptionIndex (0-3)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  // Calculate score
  const correctCount = questions.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;

  // Trigger celebratory confetti when user finishes all 5 questions
  useEffect(() => {
    if (allAnswered && !hasCelebrated) {
      setHasCelebrated(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
    }
  }, [allAnswered, hasCelebrated]);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    // Only allow selecting once per question unless retaken
    if (selectedAnswers[questionId] !== undefined) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowAllAnswers(false);
    setHasCelebrated(false);
  };

  const getOptionLabel = (idx: number) => {
    return ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header Banner & Controls */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-amber-800 text-xs md:text-sm font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-600" />
            5-Question Knowledge Check
          </div>
          <h3 className="text-base md:text-lg font-bold text-slate-800 mt-0.5">
            Test yourself on: <span className="text-amber-900 font-extrabold">{topic}</span>
          </h3>
          <p className="text-xs md:text-sm text-slate-600 mt-0.5">
            Answered: <span className="font-semibold text-slate-900">{answeredCount}/{totalQuestions}</span>
            {answeredCount > 0 && (
              <span className="ml-2 font-medium text-emerald-700">
                • Current Score: {correctCount}/{answeredCount} ({Math.round((correctCount / answeredCount) * 100)}%)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Toggle Study Mode / Answers */}
          <button
            type="button"
            onClick={() => setShowAllAnswers((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-xl border border-amber-300 bg-white hover:bg-amber-100/50 text-amber-900 transition-colors shadow-2xs"
            title="Toggle showing all answers directly"
          >
            {showAllAnswers ? (
              <>
                <EyeOff className="w-4 h-4 text-amber-600" />
                <span>Hide Answer Key</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Show Answer Key</span>
              </>
            )}
          </button>

          {/* Reset / Retake */}
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Retake</span>
            </button>
          )}
        </div>
      </div>

      {/* Completion Banner */}
      {allAnswered && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-2xl">
              {correctCount === 5 ? '🏆' : correctCount >= 3 ? '🎉' : '📚'}
            </div>
            <div>
              <h4 className="text-lg font-bold">
                {correctCount === 5
                  ? 'Perfect Score! 5 out of 5!'
                  : correctCount >= 4
                  ? 'Great Job! 4 out of 5!'
                  : correctCount === 3
                  ? 'Good Effort! 3 out of 5!'
                  : 'Quiz Complete! Keep Practicing!'}
              </h4>
              <p className="text-emerald-100 text-xs md:text-sm">
                You got {correctCount} of {totalQuestions} correct ({Math.round((correctCount / totalQuestions) * 100)}%). Review the explanations below to solidify your understanding.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetQuiz}
            className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* 5 Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const isAnswered = selectedAnswers[q.id] !== undefined;
          const userChoice = selectedAnswers[q.id];
          const isUserCorrect = userChoice === q.correctIndex;
          const displayCorrect = showAllAnswers || isAnswered;

          return (
            <div
              key={q.id || qIndex}
              className={`rounded-2xl border transition-all p-5 md:p-6 bg-white shadow-2xs ${
                isAnswered
                  ? isUserCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Question Number & Title */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-bold text-sm flex-shrink-0 mt-0.5">
                    {qIndex + 1}
                  </span>
                  <h4 className="text-base md:text-lg font-semibold text-slate-900 leading-snug">
                    {q.question}
                  </h4>
                </div>

                {isAnswered && (
                  <div className="flex-shrink-0">
                    {isUserCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Multiple Choice Options A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {q.options.map((optText, optIdx) => {
                  const isThisSelected = userChoice === optIdx;
                  const isThisCorrect = q.correctIndex === optIdx;

                  let optionStyle =
                    'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800 hover:border-slate-300';
                  let badgeStyle = 'bg-white border-slate-200 text-slate-600';

                  if (isAnswered) {
                    if (isThisCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-500';
                      badgeStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                    } else if (isThisSelected) {
                      optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400';
                      badgeStyle = 'bg-rose-600 text-white border-rose-600 font-bold';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50/40 text-slate-400 opacity-60';
                      badgeStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                    }
                  } else if (showAllAnswers) {
                    if (isThisCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                      badgeStyle = 'bg-emerald-600 text-white border-emerald-600';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 w-full ${optionStyle} ${
                        !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs border flex-shrink-0 transition-colors mt-0.5 ${badgeStyle}`}
                      >
                        {getOptionLabel(optIdx)}
                      </span>
                      <span className="flex-1 text-sm leading-relaxed">{optText}</span>
                      {displayCorrect && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      )}
                      {isThisSelected && !isThisCorrect && (
                        <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card (Shows immediately when answered or when in Study Mode) */}
              {displayCorrect && (
                <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs md:text-sm text-slate-700 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Correct Answer: Option {getOptionLabel(q.correctIndex)}</span>
                  </div>
                  <p className="leading-relaxed text-slate-600 pl-5">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
