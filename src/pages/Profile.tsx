import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { listProjects } from "@/services/projectsService";
import { listTransactions } from "@/services/transactionsService";

export default function Profile() {
  const { user } = useAuth();
  const [projectNamesByEntity, setProjectNamesByEntity] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let mounted = true;

    const loadEntityProjectMap = async () => {
      try {
        const [projects, transactions] = await Promise.all([listProjects(), listTransactions()]);
        const validProjectNames = new Set(projects.map((project) => project.title));

        const map = transactions.reduce<Record<string, Set<string>>>((acc, tx) => {
          if (!tx.entity) return acc;
          if (!validProjectNames.has(tx.projectName)) return acc;
          if (!acc[tx.entity]) acc[tx.entity] = new Set<string>();
          acc[tx.entity].add(tx.projectName);
          return acc;
        }, {});

        const normalized = Object.entries(map).reduce<Record<string, string[]>>((acc, [entity, names]) => {
          acc[entity] = Array.from(names).sort((a, b) => a.localeCompare(b));
          return acc;
        }, {});

        if (mounted) {
          setProjectNamesByEntity(normalized);
        }
      } catch {
        if (mounted) {
          setProjectNamesByEntity({});
        }
      }
    };

    loadEntityProjectMap();

    return () => {
      mounted = false;
    };
  }, []);

  const entities = useMemo(() => user?.entities || [], [user?.entities]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">View your account information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              Email (Primary Key)
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Contact Admin to change your email address.</p>
                </TooltipContent>
              </Tooltip>
            </label>
            <Input value={user?.email || "--"} disabled className="bg-muted" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Name</label>
            <Input value={user?.name || "--"} disabled className="bg-muted" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Phone</label>
            <Input value={user?.phone || "--"} disabled className="bg-muted" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Address</label>
            <Input value="--" disabled className="bg-muted" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Member Since</label>
            <Input value="--" disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Associated Entities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entities.length === 0 && (
              <div className="rounded-md border bg-secondary/20 p-4 text-sm text-muted-foreground">
                No associated entities found for this user.
              </div>
            )}

            {entities.map((entity) => {
              const names = projectNamesByEntity[entity] || [];
              return (
                <div key={entity} className="flex items-center justify-between rounded-md border bg-secondary/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{entity}</p>
                    <p className="text-xs text-muted-foreground">{names.length} project(s)</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {names.length === 0 ? (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        No mapped projects yet
                      </span>
                    ) : (
                      names.map((name) => (
                        <span key={`${entity}-${name}`} className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                          {name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
