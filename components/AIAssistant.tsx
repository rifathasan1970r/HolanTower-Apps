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
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-[90vh] sm:h-[600px] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold">স্মার্ট এআই অ্যাসিস্ট্যান্ট</h3>
                  <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-bold">Hollan Tower Assistant</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold uppercase">
                      {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                      {msg.role === 'user' ? 'আপনি' : 'এআই অ্যাসিস্ট্যান্ট'}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                    <RefreshCw size={16} className="animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'ENTER' && handleSend()}
                  placeholder="আপনার প্রশ্নটি লিখুন..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-2 font-medium">
                এআই অ্যাসিস্ট্যান্ট ভুল তথ্য দিতে পারে। গুরুত্বপূর্ণ তথ্যের জন্য এডমিনের সাথে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
