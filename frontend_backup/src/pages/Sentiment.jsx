import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Frown, 
  Meh, 
  Smile, 
  Download,
  MapPin,
  Calendar,
  Users,
  MessageSquare
} from 'lucide-react';

const Sentiment = () => {
  const [selectedScheme, setSelectedScheme] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  const sentimentData = {
    overall: {
      positive: 68,
      neutral: 22,
      negative: 10
    },
    emotions: [
      { name: 'Joy', value: 45, color: 'bg-success', icon: Smile },
      { name: 'Trust', value: 23, color: 'bg-primary', icon: Heart },
      { name: 'Neutral', value: 22, color: 'bg-muted-foreground', icon: Meh },
      { name: 'Concern', value: 7, color: 'bg-warning', icon: Frown },
      { name: 'Anger', value: 3, color: 'bg-destructive', icon: Frown }
    ],
    regions: [
      { name: 'Maharashtra', sentiment: 72, trend: 'up', complaints: 234 },
      { name: 'Karnataka', sentiment: 68, trend: 'up', complaints: 189 },
      { name: 'Tamil Nadu', sentiment: 65, trend: 'down', complaints: 156 },
      { name: 'Gujarat', sentiment: 78, trend: 'up', complaints: 98 },
      { name: 'Uttar Pradesh', sentiment: 58, trend: 'down', complaints: 445 },
      { name: 'West Bengal', sentiment: 62, trend: 'up', complaints: 267 }
    ],
    topTopics: [
      'healthcare access',
      'housing allocation',
      'subsidy disbursement',
      'application process',
      'document verification',
      'implementation delay',
      'beneficiary selection',
      'digital services'
    ],
    schemes: [
      { name: 'Pradhan Mantri Awas Yojana', sentiment: 75, mentions: 12500 },
      { name: 'Ayushman Bharat', sentiment: 82, mentions: 8900 },
      { name: 'PM Kisan Samman Nidhi', sentiment: 68, mentions: 15600 },
      { name: 'Swachh Bharat Mission', sentiment: 88, mentions: 6700 },
      { name: 'Digital India', sentiment: 71, mentions: 9200 }
    ]
  };

  const getSentimentColor = (score) => {
    if (score >= 75) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getSentimentBadge = (score) => {
    if (score >= 75) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Public <span className="text-gradient">Sentiment Dashboard</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Real-time analysis of public opinion and emotional response to government schemes
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedScheme} onValueChange={setSelectedScheme}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select Scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schemes</SelectItem>
                  {sentimentData.schemes.map(scheme => (
                    <SelectItem key={scheme.name} value={scheme.name}>
                      {scheme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {sentimentData.regions.map(region => (
                    <SelectItem key={region.name} value={region.name}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overall Sentiment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smile className="w-5 h-5 text-success" />
                <span>Positive</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{sentimentData.overall.positive}%</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                +5% from last week
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Meh className="w-5 h-5 text-muted-foreground" />
                <span>Neutral</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">{sentimentData.overall.neutral}%</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingDown className="w-4 h-4 mr-1" />
                -2% from last week
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Frown className="w-5 h-5 text-destructive" />
                <span>Negative</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{sentimentData.overall.negative}%</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingDown className="w-4 h-4 mr-1" />
                -3% from last week
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Emotion Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Emotion Breakdown</span>
              </CardTitle>
              <CardDescription>
                Detailed emotional analysis from social media and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentData.emotions.map((emotion, index) => {
                  const Icon = emotion.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{emotion.name}</span>
                          <span className="text-sm text-muted-foreground">{emotion.value}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`${emotion.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${emotion.value}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Mentioned Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Trending Topics</span>
              </CardTitle>
              <CardDescription>
                Most discussed topics in public feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sentimentData.topTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                    #{topic}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" size="sm">
                  View Word Cloud
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Sentiment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Regional Sentiment Analysis</span>
            </CardTitle>
            <CardDescription>
              State-wise sentiment scores and complaint volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentimentData.regions.map((region, index) => (
                <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{region.name}</h4>
                    <div className="flex items-center space-x-2">
                      {region.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <Badge variant={getSentimentBadge(region.sentiment)}>
                        {region.sentiment}%
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {region.complaints} complaints this week
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${region.sentiment}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scheme Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Scheme Sentiment Ranking</span>
            </CardTitle>
            <CardDescription>
              Top performing schemes by public sentiment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentimentData.schemes.map((scheme, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{scheme.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center space-x-4">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {scheme.mentions.toLocaleString()} mentions
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${getSentimentColor(scheme.sentiment)}`}>
                      {scheme.sentiment}%
                    </span>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scheme.sentiment}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sentiment;