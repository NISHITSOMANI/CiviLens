import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Download
} from 'lucide-react';

const Regions = () => {
  const [selectedState, setSelectedState] = useState('maharashtra');

  const statesData = {
    maharashtra: {
      name: 'Maharashtra',
      schemes: 45,
      totalBeneficiaries: '12.5M',
      avgSentiment: 72,
      complaints: 1247,
      successRate: 78,
      topSchemes: [
        { name: 'Pradhan Mantri Awas Yojana', beneficiaries: '2.1M', sentiment: 75, votes: { up: 1250, down: 320 } },
        { name: 'Ayushman Bharat', beneficiaries: '8.2M', sentiment: 82, votes: { up: 2100, down: 180 } },
        { name: 'PM Kisan Samman Nidhi', beneficiaries: '1.8M', sentiment: 68, votes: { up: 890, down: 410 } }
      ],
      recentUpdates: [
        'Housing allocation increased by 15% in rural areas',
        'New telemedicine centers operational in 12 districts',
        'Digital payment adoption up by 23%'
      ],
      demographics: {
        rural: 55,
        urban: 45
      }
    },
    karnataka: {
      name: 'Karnataka',
      schemes: 38,
      totalBeneficiaries: '9.8M',
      avgSentiment: 68,
      complaints: 892,
      successRate: 75,
      topSchemes: [
        { name: 'Digital India Mission', beneficiaries: '6.2M', sentiment: 71, votes: { up: 1680, down: 290 } },
        { name: 'Swachh Bharat Mission', beneficiaries: '5.5M', sentiment: 88, votes: { up: 1950, down: 125 } },
        { name: 'Skill Development Program', beneficiaries: '850K', sentiment: 65, votes: { up: 720, down: 380 } }
      ],
      recentUpdates: [
        'Tech park employment schemes showing positive results',
        'Sanitation coverage reaches 95% in urban areas',
        'Farmer training programs expanded to 8 new districts'
      ],
      demographics: {
        rural: 62,
        urban: 38
      }
    },
    tamilnadu: {
      name: 'Tamil Nadu',
      schemes: 42,
      totalBeneficiaries: '11.2M',
      avgSentiment: 65,
      complaints: 1089,
      successRate: 73,
      topSchemes: [
        { name: 'Public Distribution System', beneficiaries: '7.8M', sentiment: 79, votes: { up: 2250, down: 380 } },
        { name: 'Educational Support Scheme', beneficiaries: '2.9M', sentiment: 72, votes: { up: 1120, down: 220 } },
        { name: 'Healthcare Mission', beneficiaries: '9.1M', sentiment: 68, votes: { up: 1450, down: 520 } }
      ],
      recentUpdates: [
        'Free tablet distribution to students completed',
        'Primary healthcare centers upgraded in coastal areas',
        'Nutrition program coverage expanded'
      ],
      demographics: {
        rural: 65,
        urban: 35
      }
    }
  };

  const allStates = Object.keys(statesData);
  const currentData = statesData[selectedState];

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

  const getVoteRatio = (votes) => {
    const total = votes.up + votes.down;
    return total > 0 ? (votes.up / total * 100).toFixed(1) : 0;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Regional <span className="text-gradient">Insights Dashboard</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Explore scheme performance, public sentiment, and civic engagement by state
          </p>
        </div>

        {/* State Selector */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Select State/Region</h3>
                  <p className="text-sm text-muted-foreground">Choose a state to view detailed insights</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {allStates.map(state => (
                      <SelectItem key={state} value={state}>
                        {statesData[state].name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center card-hover">
            <CardContent className="p-6">
              <FileText className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold">{currentData.schemes}</div>
              <div className="text-sm text-muted-foreground">Active Schemes</div>
            </CardContent>
          </Card>

          <Card className="text-center card-hover">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mx-auto mb-3 text-success" />
              <div className="text-2xl font-bold">{currentData.totalBeneficiaries}</div>
              <div className="text-sm text-muted-foreground">Total Beneficiaries</div>
            </CardContent>
          </Card>

          <Card className="text-center card-hover">
            <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 mx-auto mb-3 text-warning" />
              <div className={`text-2xl font-bold ${getSentimentColor(currentData.avgSentiment)}`}>
                {currentData.avgSentiment}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Sentiment</div>
            </CardContent>
          </Card>

          <Card className="text-center card-hover">
            <CardContent className="p-6">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 text-accent" />
              <div className="text-2xl font-bold">{currentData.complaints}</div>
              <div className="text-sm text-muted-foreground">Complaints</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
              <CardDescription>Rural vs Urban distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Rural Population</span>
                    <span className="text-sm text-muted-foreground">{currentData.demographics.rural}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentData.demographics.rural}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Urban Population</span>
                    <span className="text-sm text-muted-foreground">{currentData.demographics.urban}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentData.demographics.urban}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-success" />
                <span>Success Rate</span>
              </CardTitle>
              <CardDescription>Overall scheme performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-success mb-2">{currentData.successRate}%</div>
                <p className="text-sm text-muted-foreground">
                  Based on beneficiary satisfaction and completion rates
                </p>
                <div className="mt-4 w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-success h-3 rounded-full transition-all duration-500"
                    style={{ width: `${currentData.successRate}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Latest developments in {currentData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {currentData.recentUpdates.map((update, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>{update}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Schemes with Civic Voting */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Schemes with Civic Voting</CardTitle>
            <CardDescription>
              Schemes ranked by performance and public voting in {currentData.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.topSchemes.map((scheme, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{scheme.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {scheme.beneficiaries} beneficiaries
                        </span>
                        <Badge variant={getSentimentBadge(scheme.sentiment)}>
                          {scheme.sentiment}% sentiment
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Civic Voting */}
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4 text-success" />
                          <span className="text-sm">{scheme.votes.up}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <ThumbsDown className="w-4 h-4 text-destructive" />
                          <span className="text-sm">{scheme.votes.down}</span>
                        </Button>
                      </div>
                      
                      {/* Vote Ratio */}
                      <div className="text-right">
                        <div className="text-sm font-medium">{getVoteRatio(scheme.votes)}% positive</div>
                        <div className="text-xs text-muted-foreground">civic rating</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Bar */}
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-muted-foreground w-16">Performance</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scheme.sentiment}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium w-10">{scheme.sentiment}%</span>
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

export default Regions;