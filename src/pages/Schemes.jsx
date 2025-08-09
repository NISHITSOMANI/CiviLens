import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FakeSchemeDetector from '@/components/FakeSchemeDetector';
import { 
  Search, 
  Filter, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Play,
  CheckCircle,
  AlertCircle,
  MapPin,
  Users,
  IndianRupee,
  Shield,
  Zap
} from 'lucide-react';

const Schemes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const schemes = [
    {
      id: 1,
      title: 'Pradhan Mantri Awas Yojana',
      summary: 'Housing for All scheme providing affordable housing to economically weaker sections and low-income groups.',
      category: 'Housing',
      state: 'All India',
      targetAudience: 'EWS/LIG families',
      budget: '₹12,000 Cr',
      predictionScore: 85,
      status: 'active',
      trend: 'up',
      beneficiaries: '2.5M+',
      successRate: 78
    },
    {
      id: 2,
      title: 'Swachh Bharat Mission',
      summary: 'Clean India campaign aimed at eliminating open defecation and improving solid waste management.',
      category: 'Sanitation',
      state: 'All India',
      targetAudience: 'All citizens',
      budget: '₹62,000 Cr',
      predictionScore: 92,
      status: 'active',
      trend: 'up',
      beneficiaries: '600M+',
      successRate: 88
    },
    {
      id: 3,
      title: 'PM Kisan Samman Nidhi',
      summary: 'Direct income support to farmers providing ₹6,000 per year to eligible farmer families.',
      category: 'Agriculture',
      state: 'All India',
      targetAudience: 'Small & marginal farmers',
      budget: '₹75,000 Cr',
      predictionScore: 79,
      status: 'active',
      trend: 'down',
      beneficiaries: '11.7M+',
      successRate: 72
    },
    {
      id: 4,
      title: 'Ayushman Bharat',
      summary: 'National Health Protection Scheme providing health insurance coverage up to ₹5 lakh per family.',
      category: 'Healthcare',
      state: 'All India',
      targetAudience: 'Poor & vulnerable families',
      budget: '₹6,400 Cr',
      predictionScore: 88,
      status: 'active',
      trend: 'up',
      beneficiaries: '500M+',
      successRate: 81
    },
    {
      id: 5,
      title: 'Digital India Mission',
      summary: 'Initiative to transform India into a digitally empowered society and knowledge economy.',
      category: 'Technology',
      state: 'All India',
      targetAudience: 'All citizens',
      budget: '₹1,13,000 Cr',
      predictionScore: 76,
      status: 'active',
      trend: 'up',
      beneficiaries: '1.3B+',
      successRate: 69
    },
    {
      id: 6,
      title: 'Beti Bachao Beti Padhao',
      summary: 'Campaign to save and educate girl children, addressing declining child sex ratio.',
      category: 'Women & Child',
      state: 'All India',
      targetAudience: 'Girl children & families',
      budget: '₹280 Cr',
      predictionScore: 73,
      status: 'active',
      trend: 'down',
      beneficiaries: '25M+',
      successRate: 65
    }
  ];

  const categories = ['All', 'Housing', 'Sanitation', 'Agriculture', 'Healthcare', 'Technology', 'Women & Child', 'Education', 'Employment'];
  const states = ['All', 'All India', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'West Bengal'];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scheme.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'all' || selectedState === 'All' || scheme.state === selectedState;
    const matchesCategory = selectedCategory === 'all' || selectedCategory === 'All' || scheme.category === selectedCategory;
    
    return matchesSearch && matchesState && matchesCategory;
  });

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Government <span className="text-gradient">Scheme Explorer</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover and analyze government schemes with AI-powered insights and fraud detection
              </p>
            </div>
            <Badge variant="secondary" className="animate-pulse-glow">
              <Shield className="w-4 h-4 mr-2" />
              AI-Powered Fraud Detection
            </Badge>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="explore" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="explore" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Explore Schemes
            </TabsTrigger>
            <TabsTrigger value="detector" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Fraud Detector
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <Input
                        placeholder="Search schemes by name, description, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state.toLowerCase()} value={state.toLowerCase()}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.toLowerCase()} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <Card key={scheme.id} className="card-hover group cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="mb-2">
                    {scheme.category}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    {scheme.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <Badge variant={getScoreBadgeVariant(scheme.predictionScore)}>
                      {scheme.predictionScore}% Success
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {scheme.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {scheme.summary}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{scheme.state}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{scheme.beneficiaries}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{scheme.budget}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{scheme.successRate}% Rate</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Target: {scheme.targetAudience}</span>
                    <span className={`font-medium ${getScoreColor(scheme.predictionScore)}`}>
                      {scheme.predictionScore}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scheme.predictionScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {filteredSchemes.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No schemes found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="detector" className="space-y-6">
            <FakeSchemeDetector />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Schemes;