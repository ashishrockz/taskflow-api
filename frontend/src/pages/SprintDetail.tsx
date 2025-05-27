import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SprintDetail = () => {
  const { sprintId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Sprint Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sprint ID: {sprintId}</p>
          <p className="text-gray-600">Issue board and sprint management coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SprintDetail;