import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { chatAPI, projectsAPI } from '../../services/api';
import ProjectSettings from './ProjectSettings';
import ProtectedRoute from '../ProtectedRoute';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load project details + chat history
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsAPI.get(projectId!),
    enabled: !!projectId,
  });

  const { data: history } = useQuery({
    queryKey: ['chatHistory', projectId],
    queryFn: () => chatAPI.history(projectId!),
    enabled: !!projectId,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // Load initial history
  useEffect(() => {
    if (history?.data) {
      setMessages(history.data[0]?.messages || []);  // Latest chat
    }
  }, [history]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !projectId) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setCurrentResponse('');

    try {
      const streamResponse = await chatAPI.sendStream(projectId!, userMessage.content);
      const reader = streamResponse.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setCurrentResponse(prev => prev + chunk);
      }

      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'user',
          content: userMessage.content,
          timestamp: userMessage.timestamp,
        },
        {
          role: 'assistant',
          content: currentResponse,
          timestamp: new Date(),
        },
      ]);
      setCurrentResponse('');
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({ queryKey: ['chatHistory', projectId] });
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100">
        {/* Header */}
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app")}
              className="p-2 hover:bg-slate-800 rounded-xl transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="font-semibold text-lg">{project?.data?.name}</h1>
              <p className="text-xs text-slate-500">
                {project?.data?.prompts?.length || 0} prompts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {project?.data && (
              <>
                <button
                  className="p-2 hover:bg-slate-800/50 rounded-xl transition-all text-slate-400 hover:text-sky-400"
                  title="Project settings"
                  onClick={() => setShowSettings(true)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>

                {showSettings && (
                  <ProjectSettings
                    project={project.data}
                    onClose={() => setShowSettings(false)}
                  />
                )}
              </>
            )}

            <div className="w-px h-6 bg-slate-700" />
            <span className="text-xs text-slate-500">{user?.email}</span>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
              <div className="w-24 h-24 bg-slate-900/50 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Ready to chat</h3>
              <p className="text-sm">
                Send a message to start your conversation
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3xl rounded-3xl px-4 py-3 shadow-lg ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-sm"
                      : "bg-slate-900/70 border border-slate-800/50 backdrop-blur-sm rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`text-xs opacity-75 mt-1 block ${
                      msg.role === "user" ? "text-sky-100" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-3xl bg-slate-900/70 border border-slate-800/50 backdrop-blur-sm rounded-bl-sm px-4 py-3 shadow-lg">
                <p className="whitespace-pre-wrap">{currentResponse}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <div className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-pulse" />
                  <span>Typing…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t border-slate-800 p-4 px-6 bg-slate-950/50"
        >
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full rounded-2xl bg-slate-950/70 border border-slate-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 resize-none"
                disabled={isStreaming}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e as unknown as FormEvent);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="group rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 p-3 text-white shadow-lg hover:shadow-sky-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};

export default ChatInterface;