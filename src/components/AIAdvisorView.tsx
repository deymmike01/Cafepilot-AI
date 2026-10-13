import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Percent,
  Layers,
  CheckCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { CalculatedRecipe, Ingredient, BusinessProfile } from '../types';
import { askCafePilotAdvisor, AdvisorResponse } from '../services/advisor';

interface AIAdvisorViewProps {
  recipes: CalculatedRecipe[];
  ingredients: Ingredient[];
  business: BusinessProfile;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isAiPowered?: boolean;
  modelName?: string;
  timestamp: string;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({
  recipes,
  ingredients,
  business,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `### Kumusta, ${business.ownerName || 'Partner'}! ☕\n\nI am **CaféPilot Advisor**, your beverage menu margin and costing consultant for **${business.name}**.\n\nI analyze your live recipes, ingredient costs, and packaging expenses to provide actionable recommendations.\n\n**Select a question below or ask me anything:**`,
      isAiPowered: true,
      modelName: 'CaféPilot Engine',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetQuestions = [
    'What are my total overheads (rent, electricity & water bills, employee rates) and break-even cups?',
    'Which drinks have the lowest gross profit and should be reviewed first?',
    'What happens to my margins if dairy milk prices increase by 10%?',
    'What selling prices would give me a 25% target cost across my drinks?',
    'Which ingredients affect the largest number of recipes on my menu?',
    'Should I include overheads in my drink costing or use direct cost only?',
    'Suggest new high-margin beverage concepts using ingredients I already stock.',
  ];

  const handleSendPrompt = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response: AdvisorResponse = await askCafePilotAdvisor(
        text,
        recipes,
        ingredients,
        business
      );

      const assistantMsg: Message = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        isAiPowered: response.isAiPowered,
        modelName: response.modelName,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `### Advisory System Notice\n\nUnable to generate response: ${err.message || 'Network error'}. Using offline fallback.`,
        isAiPowered: false,
        modelName: 'Offline Fallback',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              CaféPilot Advisor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AI-assisted beverage operations, menu engineering, and recipe sensitivity analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live Data Sync: {recipes.length} Recipes</span>
          </span>
        </div>
      </div>

      {/* Financial Disclaimer Banner */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Operational & Accounting Boundary: </span>
          All calculations reflect <strong>Gross Profit</strong> (Selling Price minus Direct Recipe & Packaging Costs).
          Never mistake gross profit for net profit; operational expenses (rent, labor, power, ice delivery, taxes) are not yet deducted.
        </div>
      </div>

      {/* Preset Quick Analysis Buttons */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-700 block">
          Recommended Quick Analysis Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(q)}
              disabled={isLoading}
              className="text-xs text-left bg-white hover:bg-stone-50 border border-stone-200 text-slate-700 hover:text-amber-900 px-3 py-1.5 rounded-xl transition shadow-2xs hover:border-amber-400 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Container */}
      <div className="bg-white border border-stone-200/90 rounded-2xl shadow-2xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-800 text-white rounded-tr-xs'
                      : 'bg-stone-50 text-slate-900 border border-stone-200/90 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-200/70 text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-amber-900">
                        CaféPilot Advisor
                      </span>
                      <span className="font-mono text-slate-400">
                        {msg.modelName || 'Gemini 3.8 Flash'}
                      </span>
                    </div>
                  )}

                  <div className="whitespace-pre-line prose-xs">
                    {msg.text}
                  </div>

                  <div
                    className={`mt-2 text-[10px] text-right font-mono ${
                      isUser ? 'text-amber-200' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-200" />
              </div>
              <div className="flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-xl border border-stone-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-800" />
                <span>Analyzing recipe formulas and menu margins...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputPrompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask CaféPilot Advisor (e.g. 'What if coffee beans rise by 15%?')..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs transition disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
