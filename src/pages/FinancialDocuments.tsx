import { useEffect, useState } from "react";
import { Download, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiFinancialDocument, listFinancialDocuments } from "@/services/documentsService";

export default function FinancialDocuments() {
  const [viewBy, setViewBy] = useState<"all" | "investment">("investment");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Lakes at Renaissance", "Princeton Parc"]));
  const [financialDocuments, setFinancialDocuments] = useState<ApiFinancialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadFinancialDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await listFinancialDocuments();
        if (mounted) setFinancialDocuments(items);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load financial documents");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadFinancialDocuments();

    return () => {
      mounted = false;
    };
  }, []);

  const toggle = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const projects = [...new Set(financialDocuments.map((d) => d.projectName))];

  const grouped = projects.reduce((acc, project) => {
    acc[project] = financialDocuments.filter((d) => d.projectName === project);
    return acc;
  }, {} as Record<string, typeof financialDocuments>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Financial Documents</h1>
        <p className="text-sm text-muted-foreground mt-1">Balance sheets, P&L statements, newsletters and communications.</p>
      </div>

      <Tabs value={viewBy} onValueChange={(v) => setViewBy(v as "all" | "investment")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">View by:</span>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="investment">Investment</TabsTrigger>
            </TabsList>
          </div>
        </div>
      </Tabs>

      {loading && <div className="text-sm text-muted-foreground">Loading financial documents...</div>}

      {error && !loading && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {!loading && !error && Object.entries(grouped).map(([project, docs]) => (
          <Card key={project} className="overflow-hidden">
            <button
              onClick={() => toggle(project)}
              className="flex w-full items-center gap-2 bg-card px-6 py-4 text-left hover:bg-secondary/30 transition-colors"
            >
              {expandedSections.has(project) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <h3 className="text-base font-semibold text-foreground">{project}</h3>
            </button>

            {expandedSections.has(project) && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t bg-secondary/30">
                      <th className="px-6 py-3 text-left font-medium text-muted-foreground">Name ↕</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Investing Entity ↕</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Asset ↕</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type ↕</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Year ↕</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Shared ↕</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc) => (
                      <tr key={doc._id} className="border-t hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-accent" />
                            <a href={doc.url} className="text-link text-sm">{doc.name}</a>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{doc.investingEntity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{doc.asset}</td>
                        <td className="px-4 py-3 text-foreground">{doc.category}</td>
                        <td className="px-4 py-3 text-foreground">{doc.year}</td>
                        <td className="px-4 py-3 text-right text-foreground">{doc.sharedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t">
                      <td colSpan={6} className="px-6 py-3 text-center">
                        <button className="text-link text-sm">View all</button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Card>
        ))}

        {!loading && !error && Object.keys(grouped).length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">No financial documents found.</Card>
        )}
      </div>
    </div>
  );
}
