import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Bug, CheckSquare, Clock, AlertCircle, User } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SubIssueForm from "@/components/forms/SubIssueForm";

interface Issue {
  _id: string;
  customId: string;
  title: string;
  Summary: string;
  status: "Open" | "In Progress" | "Closed";
  issueType: "Task" | "Bug";
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  sprintId: string;
  projectId: string;
  subIssues?: string[];
}

interface SubIssue {
  _id: string;
  customId: string;
  title: string;
  summary: string;
  subissueType: "SubTask" | "Bug";
  status: "Open" | "In Progress" | "Closed";
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  parentIssue: string;
  projectId: string;
  sprintId: string;
}

const IssueDetail = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();

  // First, get the issue to find the sprintId
  const { data: issue, isLoading: issueLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      // We need to find the issue by searching through sprints
      // For now, let's try a direct approach - this might need adjustment based on actual API
      const sprintsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sprint`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!sprintsResponse.ok) throw new Error('Failed to fetch sprints');
      const sprints = await sprintsResponse.json();
      
      // Search through sprints to find the issue
      for (const sprint of sprints) {
        try {
          const issuesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issue/${sprint._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (issuesResponse.ok) {
            const issues = await issuesResponse.json();
            const foundIssue = issues.find((issue: Issue) => issue._id === issueId);
            if (foundIssue) {
              return foundIssue;
            }
          }
        } catch (error) {
          // Continue searching
        }
      }
      
      throw new Error('Issue not found');
    },
  });

  const { data: subIssues, isLoading: subIssuesLoading } = useQuery({
    queryKey: ['subissues', issueId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/subissue/issue/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch sub-issues');
      return response.json();
    },
    enabled: !!issueId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Closed': return <CheckSquare className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Bug' ? <Bug className="h-4 w-4 text-red-500" /> : <CheckSquare className="h-4 w-4 text-blue-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (issueLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard')} className="cursor-pointer">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/projects/${issue?.projectId}`)} className="cursor-pointer">
                Project
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate(`/sprints/${issue?.sprintId}`)} className="cursor-pointer">
                Sprint
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{issue?.customId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Issue Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {issue && getTypeIcon(issue.issueType)}
                <span className="text-lg text-gray-500">{issue?.customId}</span>
                <Badge className={`${issue ? getPriorityColor(issue.priority) : ''}`}>
                  {issue?.priority}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{issue?.title}</h1>
              <p className="text-gray-600 text-lg">{issue?.Summary}</p>
            </div>
            <div className="flex items-center space-x-2">
              {issue && getStatusIcon(issue.status)}
              <Badge variant="secondary">
                {issue?.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Assigned to: {issue?.assignedTo}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Type: {issue?.issueType}</span>
            </div>
          </div>
        </div>

        {/* Sub-Issues Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Sub-Issues</h2>
            {issueId && <SubIssueForm issueId={issueId} />}
          </div>
          
          {subIssuesLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : subIssues?.length > 0 ? (
            <div className="space-y-4">
              {subIssues.map((subIssue: SubIssue) => (
                <Card key={subIssue._id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(subIssue.subissueType)}
                          <span className="text-sm text-gray-500">{subIssue.customId}</span>
                          <Badge className={`text-xs ${getPriorityColor(subIssue.priority)}`}>
                            {subIssue.priority}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {subIssue.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{subIssue.summary}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Assigned to: {subIssue.assignedTo}</span>
                          <span>Type: {subIssue.subissueType}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(subIssue.status)}
                        <Badge variant="secondary" className="text-xs">
                          {subIssue.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sub-issues yet</h3>
                <p className="text-gray-600 mb-4">Break down this issue into smaller tasks</p>
                {issueId && <SubIssueForm issueId={issueId} />}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default IssueDetail;