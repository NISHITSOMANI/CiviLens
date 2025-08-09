import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Image, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Mic,
  Globe,
  Brain
} from 'lucide-react';

const PolicyUpload = () => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, processing, complete
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF document or image file (JPG, PNG).",
      });
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setUploadState('processing');
          processFile(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const processFile = async (file) => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis result
    const mockResult = {
      title: "Pradhan Mantri Digital Health Mission",
      objective: "To develop digital health infrastructure and promote digital health services across India",
      targetAudience: "All citizens of India, with focus on rural and underserved populations",
      region: "All India",
      budget: "₹3,000 Crores",
      timeline: "2021-2026",
      departments: ["Ministry of Health and Family Welfare", "National Health Authority"],
      keyFeatures: [
        "Digital Health IDs for all citizens",
        "Health Records digitization",
        "Telemedicine services",
        "AI-powered diagnostics",
        "Health data analytics"
      ],
      eligibility: "All Indian citizens can register for digital health services",
      predictionScore: 82,
      riskFactors: [
        "Digital literacy challenges in rural areas",
        "Privacy and security concerns",
        "Infrastructure requirements"
      ],
      successFactors: [
        "Government backing and funding",
        "Private sector partnerships",
        "Growing smartphone penetration"
      ],
      languages: ['English', 'Hindi', 'Telugu'],
      extractedText: "The Pradhan Mantri Digital Health Mission aims to create a comprehensive digital health ecosystem...",
      infographicGenerated: true
    };

    setAnalysisResult(mockResult);
    setUploadState('complete');
    
    toast({
      title: "Analysis complete!",
      description: "The document has been successfully processed and analyzed.",
    });
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const downloadInfographic = () => {
    toast({
      title: "Infographic downloaded",
      description: "The policy infographic has been saved to your downloads.",
    });
  };

  const playAudioSummary = (language) => {
    toast({
      title: `Playing summary in ${language}`,
      description: "Audio playback started. This feature uses text-to-speech technology.",
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Policy <span className="text-gradient">Document Analyzer</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload government documents for AI-powered analysis, OCR extraction, and multilingual summaries
          </p>
        </div>

        {/* Upload Area */}
        {uploadState === 'idle' && (
          <Card 
            className={`mb-8 border-2 border-dashed transition-all duration-300 ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload Policy Document</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    <Badge variant="outline">PDF</Badge>
                    <Badge variant="outline">JPG</Badge>
                    <Badge variant="outline">PNG</Badge>
                    <Badge variant="outline">OCR Support</Badge>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild>
                    <label className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      Choose PDF Document
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                  </Button>
                  <Button variant="outline" asChild>
                    <label className="cursor-pointer">
                      <Image className="w-4 h-4 mr-2" />
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {(uploadState === 'uploading' || uploadState === 'processing') && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  {uploadState === 'uploading' ? (
                    <Upload className="w-6 h-6 text-primary" />
                  ) : (
                    <Brain className="w-6 h-6 text-primary animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {uploadState === 'uploading' ? 'Uploading Document...' : 'Analyzing with AI...'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {uploadState === 'uploading' 
                      ? 'Please wait while we upload your document' 
                      : 'OCR extraction, NLP analysis, and summary generation in progress'}
                  </p>
                </div>
                {uploadState === 'uploading' && (
                  <div className="w-full max-w-xs mx-auto">
                    <Progress value={uploadProgress} className="mb-2" />
                    <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                  </div>
                )}
                {uploadState === 'processing' && (
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {uploadState === 'complete' && analysisResult && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-gradient">{analysisResult.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Analysis completed with {analysisResult.predictionScore}% confidence score
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {analysisResult.predictionScore}%
                    </Badge>
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Budget</h4>
                    <p className="font-semibold">{analysisResult.budget}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Timeline</h4>
                    <p className="font-semibold">{analysisResult.timeline}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Region</h4>
                    <p className="font-semibold">{analysisResult.region}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button onClick={downloadInfographic}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Infographic
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary and Key Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Objective & Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed mb-4">{analysisResult.objective}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Target Audience</h5>
                      <p className="text-sm text-muted-foreground">{analysisResult.targetAudience}</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-sm mb-2">Implementing Departments</h5>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.departments.map((dept, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Risk and Success Factors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <span>Risk Factors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Success Factors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.successFactors.map((factor, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Multilingual Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Multilingual Audio Summary</span>
                </CardTitle>
                <CardDescription>
                  Listen to policy summary in different languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {analysisResult.languages.map((language, index) => (
                    <Button 
                      key={index} 
                      variant="outline" 
                      onClick={() => playAudioSummary(language)}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      Play in {language}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upload Another */}
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadState('idle');
                  setAnalysisResult(null);
                  setUploadProgress(0);
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Another Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicyUpload;