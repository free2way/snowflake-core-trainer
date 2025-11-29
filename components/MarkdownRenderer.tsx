import React from 'react';

interface Props {
  content: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  const processLine = (line: string, index: number) => {
    // Headers
    if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-snow-800">{line.replace('### ', '')}</h3>;
    if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-snow-900 border-b pb-1">{line.replace('## ', '')}</h2>;
    if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-snow-900">{line.replace('# ', '')}</h1>;

    // List items
    if (line.trim().startsWith('- ')) {
       return <li key={index} className="ml-4 list-disc text-slate-700 mb-1">{parseInline(line.replace('- ', ''))}</li>;
    }
    if (line.trim().match(/^\d+\. /)) {
        return <li key={index} className="ml-4 list-decimal text-slate-700 mb-1">{parseInline(line.replace(/^\d+\. /, ''))}</li>
    }

    // Empty lines
    if (!line.trim()) return <div key={index} className="h-2"></div>;

    // Code blocks are handled by the split logic below, but inline lines:
    return <p key={index} className="mb-2 text-slate-700 leading-relaxed">{parseInline(line)}</p>;
  };

  const parseInline = (text: string) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-slate-200 text-pink-600 px-1 rounded font-mono text-sm">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Split content by code blocks first
  const sections = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="markdown-content">
      {sections.map((section, secIndex) => {
        if (section.startsWith('```')) {
          // Extract language and code
          const lines = section.split('\n');
          const code = lines.slice(1, -1).join('\n'); // Remove first (```lang) and last (```)
          return (
            <div key={secIndex} className="bg-slate-900 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto shadow-sm">
              <pre className="font-mono text-sm code-scroll">
                {code}
              </pre>
            </div>
          );
        } else {
          // Regular text processing
          return (
            <div key={secIndex}>
              {section.split('\n').map((line, i) => processLine(line, i))}
            </div>
          );
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;
