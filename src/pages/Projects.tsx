import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiProject, listProjects } from "@/services/projectsService";

export default function Projects() {
  const { selectedCompany: _selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await listProjects();
        if (mounted) setProjects(items);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load projects");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">View all projects from MongoDB through your Node.js service.</p>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading projects...</div>}

      {error && !loading && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-sm text-muted-foreground">No projects found.</div>
      )}

      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project._id} className="overflow-hidden">
            <div className="p-6 flex gap-6 items-start">
              <div className="w-48 flex-shrink-0">
                <div className="h-36 w-full rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                  {project.images?.[0] ? (
                    <img src={project.images[0]} alt={project.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-xs text-muted-foreground">No thumbnail available</div>
                  )}
                </div>
              </div>

              <div className="flex-1 relative">
                <div className="absolute right-0 top-0">
                  <Button variant="outline" size="sm" className="capitalize">
                    {project.status}
                  </Button>
                </div>

                <CardHeader className="p-0 pb-2">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                </CardHeader>

                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex gap-2">
                    <div className="w-36 font-medium">Project Location:</div>
                    <div className="flex-1 text-foreground">{project.location || "--"}</div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-36 font-medium">Description:</div>
                    <div className="flex-1 text-foreground">{project.description || "--"}</div>
                  </div>
                </div>

                <div className="border-t mt-4 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Target Raise</div>
                    <div className="font-semibold">${(project.targetRaise || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Raised</div>
                    <div className="font-semibold">${(project.currentRaised || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Target IRR</div>
                    <div className="font-semibold">{project.targetIrr ? `${project.targetIrr}%` : "--"}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
