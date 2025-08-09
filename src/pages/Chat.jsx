import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Send, Mic, Heart, Briefcase, Baby, Home, Utensils, GraduationCap } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm CiviLens AI Assistant. I can help you discover government schemes based on your needs. You can type your questions or use the life event buttons below to get started.",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const lifeEvents = [
    { icon: Baby, label: 'Had a baby', color: 'bg-primary' },
    { icon: Briefcase, label: 'Lost job', color: 'bg-destructive' },
    { icon: Heart, label: 'Getting married', color: 'bg-accent' },
    { icon: Home, label: 'Need housing', color: 'bg-secondary' },
    { icon: Utensils, label: 'Food security', color: 'bg-warning' },
    { icon: GraduationCap, label: 'Student support', color: 'bg-success' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(message);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('baby') || message.includes('child')) {
      return `Great! Here are some schemes for new parents and children:

📋 **Pradhan Mantri Matru Vandana Yojana**
- ₹5,000 financial assistance for pregnant women
- Target: First-time mothers
- Coverage: All India

👶 **Janani Suraksha Yojana**  
- Cash assistance for institutional delivery
- Free healthcare for mothers and newborns
- Success Rate: 84%

🍼 **Integrated Child Development Services (ICDS)**
- Nutrition support for children under 6
- Pre-school education and health checkups
- Community-based program

Would you like detailed information about any of these schemes?`;
    }
    
    if (message.includes('job') || message.includes('employment') || message.includes('work')) {
      return `I understand you're looking for employment support. Here are relevant schemes:

💼 **Pradhan Mantri Kaushal Vikas Yojana (PMKVY)**
- Free skill training programs
- Job placement assistance
- Success Rate: 73%

🏭 **Mahatma Gandhi NREGA**
- Guaranteed 100 days of wage employment
- Rural areas focus
- ₹200-300 daily wages

💻 **Digital India - Digital Literacy**
- Free digital skills training
- Online job opportunities
- Certificate programs

Would you like help finding training centers near you?`;
    }
    
    if (message.includes('housing') || message.includes('home')) {
      return `Here are housing schemes that might help you:

🏠 **Pradhan Mantri Awas Yojana (PMAY)**
- Affordable housing for all
- Subsidy up to ₹2.67 lakh
- Success Rate: 78%

🏘️ **Credit Linked Subsidy Scheme**
- Interest subsidy on home loans
- For EWS, LIG, and MIG categories
- Up to 20 years benefit

🏗️ **Affordable Housing in Partnership**
- Private-public partnership
- Reduced property costs
- Multiple payment options

What's your current housing situation? I can provide more specific guidance.`;
    }
    
    if (message.includes('agriculture') || message.includes('farmer') || message.includes('crop')) {
      return `Here are agricultural support schemes:

🌾 **PM Kisan Samman Nidhi**
- ₹6,000 per year direct transfer
- For small and marginal farmers
- Success Rate: 72%

🚜 **Pradhan Mantri Fasal Bima Yojana**
- Crop insurance scheme
- Premium subsidy by government
- Coverage for natural disasters

💧 **Pradhan Mantri Krishi Sinchayee Yojana**
- Irrigation support
- Water conservation
- Micro-irrigation promotion

Are you a farmer or interested in starting agriculture?`;
    }
    
    return `I'd be happy to help you find relevant government schemes! Here are some ways I can assist:

🔍 **Search by Category:**
- Healthcare schemes
- Education support
- Employment programs
- Housing assistance
- Agricultural benefits

📍 **Location-based Help:**
Tell me your state/district for local schemes

💡 **Life Situation:**
Describe your current situation for personalized recommendations

What specific area would you like to explore?`;
  };

  const handleLifeEvent = (event) => {
    handleSendMessage(event.label);
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };

      recognition.start();
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">AI Assistant</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Get personalized scheme recommendations through intelligent conversation
          </p>
        </div>

        {/* Life Events */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Start: Life Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {lifeEvents.map((event, index) => {
                const Icon = event.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center space-y-2 hover:scale-105 transition-transform"
                    onClick={() => handleLifeEvent(event)}
                  >
                    <div className={`w-8 h-8 rounded-lg ${event.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-center">{event.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Chat Container */}
        <Card className="h-96 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium">CiviLens AI</div>
                <div className="text-xs text-muted-foreground">Online • Government Scheme Expert</div>
              </div>
            </div>
          </CardHeader>
          
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' ? 'bg-secondary' : 'bg-primary'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg px-3 py-2 ${
                      message.type === 'user' 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="whitespace-pre-line text-sm">
                        {message.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about government schemes, eligibility, or application process..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={startVoiceInput}>
                <Mic className="w-4 h-4" />
              </Button>
              <Button onClick={() => handleSendMessage()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              💡 Tip: Try asking "What schemes are available for students?" or "How do I apply for housing assistance?"
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;