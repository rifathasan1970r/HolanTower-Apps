import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, Bot, User, Sparkles, RefreshCw, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: {
    payments: any[];
    unitsInfo: any;
    parkingUnits: string[];
    externalUnits: any[];
    selectedYear: number;
    summary: any;
  };
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, contextData }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'আসসালামু আলাইকুম! আমি হলান টাওয়ারের স্মার্ট এআই অ্যাসিস্ট্যান্ট। সার্ভিস চার্জ, পার্কিং বা পেমেন্ট সংক্রান্ত যেকোনো তথ্য জানতে আমাকে জিজ্ঞাসা করুন।' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const systemInstruction = `
        You are a helpful AI Assistant for "Hollan Tower", a smart building management app.
        Your goal is to provide information about service charges, parking, and payment status.
        
        CONTEXT DATA (Year ${contextData.selectedYear}):
        - Total Payments Records: ${contextData.payments.length}
        - Parking Units: ${contextData.parkingUnits.join(', ')}
        - External Parking: ${contextData.externalUnits.map(u => u.name + ' (' + u.owner + ')').join(', ')}
        
        MONTHLY SUMMARY:
        ${JSON.stringify(contextData.summary.monthly.map((m: any) => ({ month: m.month, collected: m.collected, due: m.due, paidCount: m.paidUnits.length, dueCount: m.dueUnits.length })))}
        
        UNIT-WISE SUMMARY (Detailed):
        ${JSON.stringify(contextData.summary.unitWise.slice(0, 50))} (Showing first 50 units)
        
        UNITS INFO (Occupancy, Phone, Notes):
        ${JSON.stringify(contextData.unitsInfo)}

        RULES:
        1. Always respond in Bangla (Bengali) unless asked otherwise.
        2. Be polite and professional.
        3. If a user asks about a specific unit (e.g., "5A"), look through the UNIT-WISE SUMMARY and UNITS INFO to give details about their due, paid status, owner name, etc.
        4. If asked about parking, mention which units have parking and details about external parking.
        5. Use the MONTHLY SUMMARY for general building status or specific month stats.
        6. If you don't have specific data, say so politely.
        7. Keep responses concise and easy to read. Use bullet points for lists.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
      });

      const aiText = response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "দুঃখিত, এআই সার্ভারে সমস্যা হচ্ছে। অনুগ্রহ করে পরে চেষ্টা করুন।" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm md:items-end md:justify-end md:p-6 md:bottom-20 md:right-4 md:inset-auto"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[70vh] border border-gray-100 dark:border-slate-700 ring-1 ring-black/5">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-3.5 flex justify-between items-center text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot size={60} />
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                  <Sparkles size={18} className="text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <span className="font-bold text-base block leading-tight tracking-wide">
                      স্মার্ট এআই
                  </span>
                  <span className="text-[10px] text-indigo-100 flex items-center gap-1 opacity-90">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>
                    সক্রিয় আছে
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors active:scale-90 relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-900 space-y-3 custom-scrollbar"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {msg.role === 'model' && (
                     <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-slate-600">
                        <Bot size={14} className="text-white" />
                     </div>
                  )}
                  
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start items-end gap-2">
                   <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                      <Bot size={14} className="text-white" />
                   </div>
                  <div className="bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="এখানে লিখুন..."
                className="flex-1 bg-gray-100 dark:bg-slate-700 border border-transparent focus:bg-white dark:focus:bg-slate-600 focus:border-indigo-200 dark:focus:border-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-400 text-gray-700 dark:text-slate-200"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center"
              >
                <Send size={18} className={isLoading ? 'hidden' : 'block'} />
                {isLoading && (
                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block"></span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
