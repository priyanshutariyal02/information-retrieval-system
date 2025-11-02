import React from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types/chat';


interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg
          ${isUser
            ? 'bg-gradient-to-br from-primary-500 to-blue-600'
            : 'bg-gradient-to-br from-purple-500 to-pink-600'
          }`}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>
      
      <div className="flex-1 group">
        <div
          className={`rounded-2xl p-4 shadow-md relative
            ${isUser
              ? 'bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/30 dark:to-blue-900/30 border border-primary-100 dark:border-primary-800'
              : 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700'
            }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none
                          prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                          prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-relaxed prose-p:my-2
                          prose-ul:my-2 prose-ul:text-gray-800 dark:prose-ul:text-gray-200
                          prose-ol:my-2 prose-ol:text-gray-800 dark:prose-ol:text-gray-200
                          prose-li:my-1
                          prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
                          prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:bg-gray-100 dark:prose-code:bg-dark-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                          prose-pre:bg-gray-100 dark:prose-pre:bg-dark-700 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-dark-600
                          prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom list rendering
                  ul: ({ children }) => (
                    <ul className="space-y-1 list-disc list-inside">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-1 list-decimal list-inside">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  // Custom paragraph rendering
                  p: ({ children }) => (
                    <p className="text-sm mb-2 last:mb-0">{children}</p>
                  ),
                  // Custom code block
                  code: ({ inline, children }: any) => {
                    if (inline) {
                      return <code className="text-xs">{children}</code>;
                    }
                    return (
                      <pre className="text-xs p-3 rounded-lg overflow-x-auto">
                        <code>{children}</code>
                      </pre>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 rounded-lg
                       opacity-0 group-hover:opacity-100 transition-all duration-200
                       hover:bg-gray-100 dark:hover:bg-dark-700"
              title="Copy message"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 px-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
