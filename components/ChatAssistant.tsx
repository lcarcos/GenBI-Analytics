import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X } from 'lucide-react';
import { FactTransaction } from '../types';
import { queryGenBIStream, Message } from '../services/geminiService';

interface ChatAssistantProps {
  data: FactTransaction[];
  onClose?: () => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ data, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your GenBI assistant. I'm connected live to your database. What would you like to analyze today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    // Adiciona o placeholder vazio que será preenchido pelo stream
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    let currentResponse = '';

    await queryGenBIStream(newMessages, data, (chunk) => {
      if (isLoading) setIsLoading(false);
      currentResponse += chunk;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: currentResponse };
        return updated;
      });
    });

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border-none">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
             <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold flex items-center gap-2">AI Assistant <Sparkles className="w-4 h-4 text-amber-300" /></span>
            <span className="text-[10px] text-indigo-200 uppercase tracking-widest block font-medium">Connected to Database</span>
          </div>
        </div>
        {onClose && (
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
              <X className="w-5 h-5 text-indigo-100 group-hover:text-white" />
           </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              {m.role === 'assistant' && m.content === '' && isLoading && (
                <div className="flex items-center gap-2 text-indigo-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium italic">GenBI is thinking...</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask GenBI about your data..."
            className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant;
