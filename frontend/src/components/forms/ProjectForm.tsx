import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectFormProps {
  onSuccess?: () => void;
}

const ProjectForm = ({ onSuccess }: ProjectFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const projectData = {
      name: formData.get("name") as string,
      key: formData.get("key") as string,
      type: formData.get("type") as string,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/project`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        setIsOpen(false);
        onSuccess?.();
        (e.target as HTMLFormElement).reset();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create project");
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
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to organize your work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Project Key</Label>
            <Input
              id="key"
              name="key"
              placeholder="e.g., PROJ"
              required
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Project Type</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;