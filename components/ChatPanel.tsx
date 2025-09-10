import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import Spinner from './Spinner';

interface ChatPanelProps {
  orgId: Id<"organizations">;
}

// A simple markdown to HTML converter
const formatMessage = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400">$1</strong>') // Bold
        .replace(/\* /g, '<br />&bull; ') // Bullet points
        .replace(/(\d+\.)/g, '<br /><strong class="text-indigo-400">$1</strong>') // Numbered lists
        .replace(/(\r\n|\n\r|\r|\n)/g, '<br />'); // New lines
}

const ChatPanel: React.FC<ChatPanelProps> = ({ orgId }) => {
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createThread = useAction(api.agent.createThread);
  const runAgent = useAction(api.agent.run);
  const suggestNextAction = useAction(api.agent.suggest);
  
  const messages = useQuery(api.agent.messages, threadId ? { threadId } : "skip");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!threadId) {
      createThread({ orgId }).then(setThreadId);
    }
  }, [createThread, orgId, threadId]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
        e.preventDefault();
    }
    const messageContent = (typeof e === 'string') ? e : userInput;
    const trimmedInput = messageContent.trim();
    if (!trimmedInput || !threadId || messages?.isThinking) return;

    setUserInput('');
    await runAgent({ threadId, message: trimmedInput });
  };
  
  const handleSuggestAction = async () => {
    if (isSuggesting || !threadId || messages?.isThinking) return;
    setIsSuggesting(true);
    try {
      const suggestion = await suggestNextAction({ threadId });
      setUserInput(suggestion);
    } catch (error) {
      console.error("Failed to get suggestion:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const isLoading = messages?.isThinking ?? true;

  return (
    <div className="bg-gray-800 rounded-xl border border-indigo-500/20 shadow-lg flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
      <div className="p-4 border-b border-indigo-500/20">
        <h3 className="text-xl font-semibold text-white">AI Business Consultant</h3>
        <p className="text-sm text-gray-400">Your partner in growth</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.history?.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-md lg:max-w-lg p-3 rounded-lg shadow ${
                message.role === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-sm p-3 rounded-lg bg-gray-700 text-gray-300 flex items-center space-x-2">
                <Spinner size="sm" />
                <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-indigo-500/20 bg-gray-800/50">
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Ask about your business..."
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 pr-28 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
            rows={2}
            disabled={isLoading}
          />
          <div className="absolute bottom-2.5 right-3 flex items-center space-x-2">
             <button
                type="button"
                onClick={handleSuggestAction}
                disabled={isLoading || isSuggesting}
                className="p-2 text-indigo-400 hover:text-white hover:bg-gray-700 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Suggest a question"
                title="Suggest a question"
              >
               {isSuggesting ? <Spinner size="sm" /> : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
               )}
             </button>
            <button
              type="submit"
              disabled={!userInput.trim() || isLoading}
              className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;