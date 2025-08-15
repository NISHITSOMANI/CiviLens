import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Zap,
  Loader2
} from 'lucide-react';
import { listSchemes, searchSchemes, categories as schemeCategories } from '@/services/api/schemes';

const Schemes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch schemes using React Query
  const { data: schemesData, isLoading, isError, error } = useQuery({
    queryKey: ['schemes', searchQuery, selectedState, selectedCategory],
    queryFn: async () => {
      if (searchQuery) {
        // Use search API when there's a search query
        return await searchSchemes({ query: searchQuery, state: selectedState, category: selectedCategory });
      } else {
        // Use list API when there's no search query
        return await listSchemes({ state: selectedState, category: selectedCategory });
      }
    },
    keepPreviousData: true // Keep previous data while fetching new data
  });

  // Extract schemes from the response
  const schemes = schemesData?.data?.results || [];

  // Use static categories and states for now (could be fetched from API in future)
  const categories = ['All', 'Housing', 'Sanitation', 'Agriculture', 'Healthcare', 'Technology', 'Women & Child', 'Education', 'Employment'];
  const states = ['All', 'All India', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'West Bengal'];

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

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading schemes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error loading schemes</h3>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'Failed to load schemes. Please try again later.'}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

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
              {schemes && schemes.length > 0 ? (
                schemes.map((scheme) => (
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
                          <Badge variant={getScoreBadgeVariant(scheme.prediction_score)}>
                            {scheme.prediction_score}% Success
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
                          <span className="text-muted-foreground">{scheme.success_rate}% Rate</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Target: {scheme.target_audience}</span>
                          <span className={`font-medium ${getScoreColor(scheme.prediction_score)}`}>
                            {scheme.prediction_score}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${scheme.prediction_score}%` }}
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
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No schemes found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No schemes match your search criteria' : 'No schemes available at the moment'}
                  </p>
                </div>
              )}
            </div>
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