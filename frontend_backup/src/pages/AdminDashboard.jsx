import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Schemes', value: '247', change: '+12', icon: FileText },
    { label: 'Active Users', value: '12.5K', change: '+8%', icon: Users },
    { label: 'Complaints', value: '1,089', change: '-5%', icon: AlertTriangle },
    { label: 'Success Rate', value: '78%', change: '+3%', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground">Monitor and analyze government scheme performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <Badge variant="outline" className="mt-1">{stat.change}</Badge>
                    </div>
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">High complaint volume detected</p>
                    <p className="text-xs text-muted-foreground">Housing scheme in Maharashtra</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sentiment improvement noted</p>
                    <p className="text-xs text-muted-foreground">Digital India initiatives</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Administrative tools and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Monitor Feed
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;