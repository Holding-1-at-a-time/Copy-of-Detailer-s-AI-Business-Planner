
import React from 'react';
import Spinner from './Spinner';

interface InsightCardProps {
  insight: string;
  isLoading: boolean;
}

// A simple markdown to HTML converter
const formatInsight = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400">$1</strong>') // Bold
        .replace(/(\r\n|\n\r|\r|\n)/g, '<br />') // New lines
        .replace(/(\d+\.)/g, '<br /><strong class="text-indigo-400">$1</strong>') // Numbered lists
        .replace(/- /g, '<br />&bull; '); // Bullet points
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, isLoading }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/20 shadow-lg min-h-[200px] flex items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center">
          <Spinner />
          <p className="mt-2 text-gray-400">Your AI consultant is thinking...</p>
        </div>
      ) : insight ? (
        <div 
          className="text-gray-300 leading-relaxed prose prose-invert"
          dangerouslySetInnerHTML={{ __html: formatInsight(insight) }}
        />
      ) : (
        <p className="text-gray-500">Click "Generate Insights" to get AI-powered advice for your business.</p>
      )}
    </div>
  );
};

export default InsightCard;
