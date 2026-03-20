import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Building2, DollarSign, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiProject, listProjects } from "@/services/projectsService";
import { listFinancialDocuments, listTaxDocuments } from "@/services/documentsService";

export default function Dashboard() {
  const { selectedCompany: _selectedCompany } = useOutletContext<{ selectedCompany: string }>();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        const [projectItems, taxDocs, financialDocs] = await Promise.all([
          listProjects(),
          listTaxDocuments(),
          listFinancialDocuments(),
        ]);

        if (mounted) {
          setProjects(projectItems);
          setDocumentsCount(taxDocs.length + financialDocs.length);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  const totalInvested = useMemo(
    () => projects.reduce((sum, p) => sum + (p.currentRaised || 0), 0),
    [projects]
  );

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === "active").length,
    [projects]
  );

  const stats = [
    { label: "Total Invested", value: `$${totalInvested.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
    { label: "Active Projects", value: activeProjects, icon: TrendingUp, color: "text-success" },
    { label: "Entities", value: projects.length, icon: Building2, color: "text-foreground" },
    { label: "Documents", value: documentsCount, icon: FileText, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back. Here's an overview of your investments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-start gap-4 p-6">
              <div className={`rounded-lg bg-secondary p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-xl font-bold leading-tight text-foreground break-words">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Investments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Current Investments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading investments...</p>}

          {!loading && projects.length === 0 && (
            <p className="text-sm text-muted-foreground">No investments found.</p>
          )}

          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project._id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between rounded-md bg-secondary/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.description || "--"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${(project.currentRaised || 0).toLocaleString()}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      project.status === "active"
                        ? "bg-success/10 text-success"
                        : project.status === "funded"
                          ? "bg-muted text-muted-foreground"
                          : "bg-accent/10 text-accent"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
