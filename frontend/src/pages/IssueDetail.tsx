import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IssueDetail = () => {
  const { issueId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Issue Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Issue ID: {issueId}</p>
          <p className="text-gray-600">Issue details and sub-issues coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueDetail;