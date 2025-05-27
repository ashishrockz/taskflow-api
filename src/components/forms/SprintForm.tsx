import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface SprintFormProps {
  projectId: string;
  onSuccess?: () => void;
}

const SprintForm = ({ projectId, onSuccess }: SprintFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const sprintData = {
      sprintName: formData.get("sprintName") as string,
      sprintType: formData.get("sprintType") as string,
      projectId,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/sprint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sprintData),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
        setIsOpen(false);
        onSuccess?.();
        (e.target as HTMLFormElement).reset();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create sprint");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Sprint</DialogTitle>
          <DialogDescription>
            Add a new sprint to organize your work iterations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sprintName">Sprint Name</Label>
            <Input
              id="sprintName"
              name="sprintName"
              placeholder="Enter sprint name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sprintType">Sprint Type</Label>
            <Select name="sprintType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select sprint type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="release">Release</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Sprint"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SprintForm;