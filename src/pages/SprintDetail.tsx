import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Bug, CheckSquare, Clock, AlertCircle, Edit } from "lucide-react";
import Layout from "@/components/layout/Layout";
import IssueForm from "@/components/forms/IssueForm";
import SprintForm from "@/components/forms/SprintForm";

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

const ITEMS_PER_PAGE = 5;

const SprintDetail = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

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

  const { data: allIssues, isLoading: issuesLoading } = useQuery({
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

  // Pagination logic
  const totalPages = Math.ceil((allIssues?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const issues = allIssues?.slice(startIndex, endIndex) || [];

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
          <div className="flex items-center space-x-2">
            <SprintForm 
              sprint={sprint} 
              projectId={sprint?.projectId!}
              trigger={
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Sprint
                </Button>
              }
            />
            {sprintId && sprint?.projectId && (
              <IssueForm sprintId={sprintId} projectId={sprint.projectId} />
            )}
          </div>
        </div>

        {/* Issues Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Issues ({allIssues?.length || 0})
            </h2>
          </div>
          
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
            <>
              <div className="space-y-4">
                {issues.map((issue: Issue) => (
                  <Card 
                    key={issue._id}
                    className="hover:shadow-lg transition-shadow duration-200 group"
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
                          <h3 
                            className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1 cursor-pointer"
                            onClick={() => navigate(`/issues/${issue._id}`)}
                          >
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
                          <IssueForm 
                            issue={issue}
                            sprintId={sprintId!}
                            projectId={sprint?.projectId!}
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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