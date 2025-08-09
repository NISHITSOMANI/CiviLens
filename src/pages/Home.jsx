import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Bot, 
  Upload, 
  MapPin,
  Mic,
  Search,
  TrendingUp,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Play
} from 'lucide-react';

const Home = () => {
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: FileText,
      title: 'Scheme Explorer',
      description: 'Discover and analyze government schemes with AI-powered summaries',
      path: '/schemes',
      color: 'bg-primary'
    },
    {
      icon: BarChart3,
      title: 'Public Sentiment',
      description: 'Real-time sentiment analysis from social media and public feedback',
      path: '/sentiment',
      color: 'bg-secondary'
    },
    {
      icon: MessageSquare,
      title: 'Submit Complaints',
      description: 'Report issues and track government response in your region',
      path: '/complaints',
      color: 'bg-accent'
    },
    {
      icon: Bot,
      title: 'AI Assistant',
      description: 'Get personalized scheme recommendations through smart chat',
      path: '/chat',
      color: 'bg-success'
    },
    {
      icon: Upload,
      title: 'Policy Analyzer',
      description: 'Upload and analyze policy documents with OCR and NLP',
      path: '/upload',
      color: 'bg-warning'
    },
    {
      icon: MapPin,
      title: 'Regional Insights',
      description: 'Explore scheme performance and sentiment by geographic region',
      path: '/regions',
      color: 'bg-destructive'
    }
  ];

  const stats = [
    { label: 'Schemes Analyzed', value: '2,547', icon: FileText },
    { label: 'Public Feedback', value: '125K+', icon: Users },
    { label: 'Success Rate', value: '87%', icon: TrendingUp },
    { label: 'Active Regions', value: '28', icon: MapPin }
  ];

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };

      recognition.start();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-float">
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Government Transparency
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Your AI Watchdog for
            <br />
            Transparent Governance
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            CiviLens uses advanced AI to audit government schemes, analyze public sentiment, 
            and provide real-time insights for better civic engagement.
          </p>

          {/* Voice Search */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search schemes, policies, or ask a question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={startVoiceSearch}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                  isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <Button size="lg" className="animate-pulse-glow">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/schemes">
              <Button size="lg" variant="default">
                Explore Schemes
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="lg" variant="outline">
                <Play className="w-5 h-5 mr-2" />
                Try AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center card-hover">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for <span className="text-gradient">Civic Transparency</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover how CiviLens leverages AI to make government schemes more accessible and accountable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} to={feature.path}>
                  <Card className="h-full card-hover group cursor-pointer">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make Government <span className="text-gradient">More Transparent?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of citizens using CiviLens to track, analyze, and improve government schemes
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="animate-pulse-glow">
                <Shield className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
            </Link>
            <Link to="/schemes">
              <Button size="lg" variant="outline">
                Explore Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;