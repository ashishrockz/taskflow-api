import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Bug, CheckSquare, Clock, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import IssueForm from "@/components/forms/IssueForm";

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

interface Sprint {
  _id: string;
  sprintName: string;
  sprintType: string;
  projectId: string;
}

const SprintDetail = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();

  const { data: sprint, isLoading: sprintLoading } = useQuery({
    queryKey: ['sprint', sprintId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sprint/${sprintId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch sprint');
      return response.json();
    },
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ['issues', sprintId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/issue/${sprintId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch issues');
      return response.json();
    },
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

  if (sprintLoading) {
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
              <BreadcrumbLink onClick={() => navigate(`/projects/${sprint?.projectId}`)} className="cursor-pointer">
                Project
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{sprint?.sprintName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Sprint Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{sprint?.sprintName}</h1>
              <Badge variant="outline">{sprint?.sprintType}</Badge>
            </div>
            <p className="text-gray-600">Sprint Board</p>
          </div>
          {sprintId && sprint?.projectId && (
            <IssueForm sprintId={sprintId} projectId={sprint.projectId} />
          )}
        </div>

        {/* Issues Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Issues</h2>
          
          {issuesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : issues?.length > 0 ? (
            <div className="space-y-4">
              {issues.map((issue: Issue) => (
                <Card 
                  key={issue._id}
                  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                  onClick={() => navigate(`/issues/${issue._id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(issue.issueType)}
                          <span className="text-sm text-gray-500">{issue.customId}</span>
                          <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                          {issue.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{issue.Summary}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Assigned to: {issue.assignedTo}</span>
                          {issue.subIssues && issue.subIssues.length > 0 && (
                            <span>{issue.subIssues.length} sub-issues</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(issue.status)}
                        <Badge variant="secondary" className="text-xs">
                          {issue.status}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No issues yet</h3>
                <p className="text-gray-600 mb-4">Create your first issue to start tracking work</p>
                {sprintId && sprint?.projectId && (
                  <IssueForm sprintId={sprintId} projectId={sprint.projectId} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SprintDetail;