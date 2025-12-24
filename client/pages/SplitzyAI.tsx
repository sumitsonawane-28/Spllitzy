import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Send, Users, DollarSign, FileText } from "lucide-react";

const examplePrompts = [
  "Split $120 dinner between 4 people with 20% tip",
  "We spent $350 on groceries. I paid $200, Alex paid $150. How to split?",
  "Calculate rent split: $2000 total, 2 people, one has larger room"
];

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export default function SplitzyAI() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: "Hi! I'm Splitzy, your AI expense splitting assistant. I can help you split bills, calculate tips, and divide expenses fairly. What would you like to split?"
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Let me calculate that for you. The split would be $30 per person, including a 20% tip.",
        "Based on your input, here's the breakdown: You owe $75 and Alex owes $100.",
        "For a fair split considering the larger room, the breakdown would be $1200 and $800 respectively."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [
        ...prev, 
        { role: 'ai' as const, content: randomResponse }
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Splitzy AI
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div 
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'ai' 
                  ? 'bg-gray-100 dark:bg-gray-800' 
                  : 'bg-purple-100 dark:bg-purple-900/50'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {examplePrompts.map((prompt, i) => (
            <Card 
              key={i} 
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              onClick={() => handleExampleClick(prompt)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {i === 0 ? <DollarSign className="h-4 w-4" /> : 
                   i === 1 ? <Users className="h-4 w-4" /> : 
                   <FileText className="h-4 w-4" />}
                  Example {i + 1}
                </CardTitle>
                <CardDescription className="text-xs">
                  {prompt}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to split any expense..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
