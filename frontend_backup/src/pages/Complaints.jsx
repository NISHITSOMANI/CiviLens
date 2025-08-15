import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';
import { createComplaint, listComplaints } from '@/services/api/complaints';

const Complaints = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    region: '',
    issue: '',
    topic: '',
    urgency: '3',
    description: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch complaints using React Query
  const { data: complaintsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => listComplaints(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const complaints = complaintsData?.data || [];

  const topics = [
    'Housing', 'Healthcare', 'Agriculture', 'Sanitation', 'Education', 
    'Employment', 'Digital Services', 'Transportation', 'Women & Child Welfare', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        region: formData.region,
        issue: formData.issue,
        topic: formData.topic,
        urgency: parseInt(formData.urgency),
        description: formData.description
      };

      const response = await createComplaint(payload);
      
      if (response.success) {
        toast({
          title: "Complaint submitted successfully!",
          description: "Your complaint has been registered and will be reviewed by relevant authorities.",
        });
        
        // Reset form
        setFormData({
          region: '',
          issue: '',
          topic: '',
          urgency: '3',
          description: ''
        });
        
        // Invalidate and refetch complaints
        queryClient.invalidateQueries(['complaints']);
      } else {
        toast({
          variant: "destructive",
          title: "Submission failed",
          description: response.error?.message || "Please try again later.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    if (urgency >= 4) return 'bg-destructive';
    if (urgency === 3) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-success';
      case 'in-progress': return 'bg-primary';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return CheckCircle;
      case 'in-progress': return Clock;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Submit <span className="text-gradient">Public Complaints</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Report issues with government schemes and track community feedback
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Complaint Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Submit New Complaint</span>
              </CardTitle>
              <CardDescription>
                Help us improve government schemes by reporting issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region/Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="region"
                      placeholder="Enter your city and state"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Issue Category</Label>
                  <Select value={formData.topic} onValueChange={(value) => setFormData(prev => ({ ...prev, topic: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map(topic => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Low (General inquiry)</SelectItem>
                      <SelectItem value="2">2 - Minor (Delayed service)</SelectItem>
                      <SelectItem value="3">3 - Medium (Service issue)</SelectItem>
                      <SelectItem value="4">4 - High (Urgent attention needed)</SelectItem>
                      <SelectItem value="5">5 - Critical (Emergency)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue">Issue Title</Label>
                  <Input
                    id="issue"
                    placeholder="Brief title describing your issue"
                    value={formData.issue}
                    onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about your complaint, including scheme name, timeline, and specific issues faced..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Complaints */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Community Complaints</CardTitle>
              <CardDescription>
                Anonymous complaints from the community (personal details removed)
              </CardDescription>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {complaints.map((complaint) => {
                  const StatusIcon = getStatusIcon(complaint.status);
                  return (
                    <div key={complaint.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {complaint.topic}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getUrgencyColor(complaint.urgency)}`}></div>
                          <span className="text-xs text-muted-foreground">Urgency: {complaint.urgency}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(complaint.status).replace('bg-', 'text-')}`} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {complaint.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-2 line-clamp-2">
                        {complaint.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{complaint.region}</span>
                        </div>
                        <span>{complaint.timestamp}</span>
                      </div>
                      
                      {complaint.scheme && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {complaint.scheme}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Total Complaints</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">823</div>
              <div className="text-sm text-muted-foreground">Resolved Issues</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-warning">298</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-muted-foreground">126</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Complaints;