import React from 'react';

// Helper to parse inline markdown like **bold** and *italic*
const parseInlineFormatting = (text: string): React.ReactNode => {
  // Split text by markdown delimiters, keeping the delimiters
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-neutral-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
};

// A more capable markdown parser that handles headers, lists, and inline formatting
const RichMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-bold text-neutral-100 mt-4 flex items-center">{parseInlineFormatting(line.substring(4))}</h3>);
      i++;
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-bold text-neutral-100 flex items-center">{parseInlineFormatting(line.substring(3))}</h2>);
      i++;
    } else if (line.startsWith('* ')) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && lines[i].startsWith('* ')) {
        listItems.push(
          <li key={i} className="flex items-start">
            <span className="mr-3 mt-1 text-yellow-400">∙</span>
            <span>{parseInlineFormatting(lines[i].substring(2))}</span>
          </li>
        );
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="list-none space-y-2 mt-2">{listItems}</ul>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-3"></div>); // Paragraph break
      i++;
    } else {
      elements.push(<p key={i}>{parseInlineFormatting(line)}</p>);
      i++;
    }
  }

  return <div className="space-y-4 text-neutral-300 leading-relaxed">{elements}</div>;
};


interface TransactionSummaryModalProps {
  isOpen: boolean;
  summary: string;
  isLoading: boolean;
  onClose: () => void;
}

export const TransactionSummaryModal: React.FC<TransactionSummaryModalProps> = ({
  isOpen,
  summary,
  isLoading,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click is on the backdrop itself and not while loading
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-200 mb-4">Transaction Summary</h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-neutral-400">
              <svg className="animate-spin h-8 w-8 text-yellow-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Generating secure transaction summary...</p>
            </div>
          ) : (
            <RichMarkdown text={summary} />
          )}
        </div>
        <div className="px-6 py-4 bg-neutral-900/50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full bg-yellow-400 text-neutral-900 font-bold py-2.5 rounded-lg hover:bg-yellow-300 transition-colors duration-200 disabled:bg-neutral-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};