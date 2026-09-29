import React from 'react';

interface FormattedContentProps {
  content: string;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ content }) => {
  // Split lines and parse blocks cleanly
  const lines = content.split('\n');

  const renderFormattedLine = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Replace *italic* or `code`
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={idx} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={idx} className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-sm font-mono font-medium">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const blocks: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === 'ul') {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="my-3 space-y-2 pl-2">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start text-slate-700 leading-relaxed text-sm md:text-base">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-2 mr-3 flex-shrink-0" />
              <div className="flex-1">{renderFormattedLine(item)}</div>
            </li>
          ))}
        </ul>
      );
    } else {
      blocks.push(
        <ol key={`list-${blocks.length}`} className="my-3 space-y-2 pl-2">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="flex items-start text-slate-700 leading-relaxed text-sm md:text-base">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs mr-3 flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">{renderFormattedLine(item)}</div>
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Markdown Headers: ###, ##, #
    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h3 key={`h3-${i}`} className="text-lg md:text-xl font-bold text-slate-900 mt-6 mb-2 flex items-center gap-2">
          {renderFormattedLine(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h2 key={`h2-${i}`} className="text-xl md:text-2xl font-bold text-slate-900 mt-7 mb-3 pb-1 border-b border-slate-200">
          {renderFormattedLine(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      blocks.push(
        <h1 key={`h1-${i}`} className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-8 mb-4">
          {renderFormattedLine(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      continue;
    }

    // Bullet lists: - or *
    if (/^[-*]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[-*]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Numbered lists: 1. or 2.
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      continue;
    }

    // Callout detection: e.g. 💡 In a Nutshell or 🎈 The Simple Analogy or ⚡ TL;DR
    if (trimmed.startsWith('💡') || trimmed.startsWith('🎈') || trimmed.startsWith('⚡') || trimmed.startsWith('📌')) {
      flushList();
      const isAnalogy = trimmed.startsWith('🎈');
      const isTLDR = trimmed.startsWith('⚡');
      const isNutshell = trimmed.startsWith('💡');
      
      const bgColor = isAnalogy
        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
        : isTLDR
        ? 'bg-purple-50/70 border-purple-200 text-purple-900'
        : isNutshell
        ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
        : 'bg-emerald-50/70 border-emerald-200 text-emerald-900';

      blocks.push(
        <div key={`callout-${i}`} className={`my-4 p-4 rounded-xl border ${bgColor} shadow-sm leading-relaxed text-sm md:text-base`}>
          {renderFormattedLine(trimmed)}
        </div>
      );
      continue;
    }

    // Standard paragraph
    flushList();
    blocks.push(
      <p key={`p-${i}`} className="my-2.5 text-slate-700 leading-relaxed text-sm md:text-base">
        {renderFormattedLine(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{blocks}</div>;
};
