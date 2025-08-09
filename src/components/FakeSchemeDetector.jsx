import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search, 
  Upload, 
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';

const FakeSchemeDetector = ({ onAnalyze }) => {
  const [schemeUrl, setSchemeUrl] = useState('');
  const [schemeText, setSchemeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isFake = Math.random() > 0.7; // 30% chance of being fake
    const legitimacyScore = isFake ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 30) + 70;
    
    setAnalysisResult({
      isLegitimate: !isFake,
      legitimacyScore,
      riskLevel: legitimacyScore > 70 ? 'low' : legitimacyScore > 40 ? 'medium' : 'high',
      redFlags: isFake ? [
        'Unrealistic promises',
        'Lack of official documentation',
        'Suspicious contact details',
        'No government verification'
      ] : [
        'Minor documentation gaps'
      ],
      verificationStatus: !isFake ? 'verified' : 'suspicious',
      lastUpdated: new Date().toLocaleDateString(),
      sourceCredibility: legitimacyScore,
      similarSchemes: 3,
      reportCount: isFake ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 5)
    });
    
    setIsAnalyzing(false);
    if (onAnalyze) onAnalyze();
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (level) => {
    switch (level) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Fake Scheme Detector</CardTitle>
            <CardDescription>
              AI-powered analysis to identify fraudulent government schemes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Scheme URL or Website
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="https://example-scheme.gov.in"
                value={schemeUrl}
                onChange={(e) => setSchemeUrl(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="text-center text-muted-foreground">
            <span>or</span>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Scheme Description/Content
            </label>
            <Textarea
              placeholder="Paste the scheme description, announcement, or any suspicious content here..."
              value={schemeText}
              onChange={(e) => setSchemeText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={(!schemeUrl && !schemeText) || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing with AI...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analyze Scheme
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analysis Results</h3>
              <Badge variant={analysisResult.isLegitimate ? 'default' : 'destructive'}>
                {analysisResult.isLegitimate ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Legitimate
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Suspicious
                  </>
                )}
              </Badge>
            </div>

            {/* Score Card */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Legitimacy Score</span>
                  <span className={`text-2xl font-bold ${getRiskColor(analysisResult.riskLevel)}`}>
                    {analysisResult.legitimacyScore}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      analysisResult.legitimacyScore > 70 ? 'bg-success' : 
                      analysisResult.legitimacyScore > 40 ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${analysisResult.legitimacyScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>High Risk</span>
                  <span>Low Risk</span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${getRiskColor(analysisResult.riskLevel)}`}>
                    {analysisResult.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">Risk Level</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {analysisResult.sourceCredibility}%
                  </div>
                  <div className="text-sm text-muted-foreground">Source Credibility</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {analysisResult.reportCount}
                  </div>
                  <div className="text-sm text-muted-foreground">User Reports</div>
                </CardContent>
              </Card>
            </div>

            {/* Red Flags */}
            {analysisResult.redFlags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-warning" />
                  Identified Issues
                </h4>
                <div className="space-y-2">
                  {analysisResult.redFlags.map((flag, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <span className="text-sm">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Updated: {analysisResult.lastUpdated}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{analysisResult.similarSchemes} Similar Schemes</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
              {!analysisResult.isLegitimate && (
                <Button variant="destructive" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Fake
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FakeSchemeDetector;