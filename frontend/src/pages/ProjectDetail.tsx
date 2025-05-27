import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProjectDetail = () => {
  const { projectId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Project ID: {projectId}</p>
          <p className="text-gray-600">Sprint management and project overview coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;