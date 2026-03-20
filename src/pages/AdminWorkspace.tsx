import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  FileBadge,
  FileSpreadsheet,
  FolderPlus,
  Landmark,
  Receipt,
  Sparkles,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AuthUser } from "@/services/authService";
import {
  createFinancialDocument,
  createInvestment,
  createProject,
  createTaxDocument,
  createTransaction,
  listAdminUsers,
  uploadFile,
} from "@/services/adminContentService";
import { ApiFinancialDocument, ApiTaxDocument, listFinancialDocuments, listTaxDocuments } from "@/services/documentsService";
import { ApiProject, listProjects } from "@/services/projectsService";
import { ApiTransaction, listTransactions } from "@/services/transactionsService";

type ProjectStatus = "active" | "funded" | "exited";
type TransactionType = "investment" | "distribution" | "return";
type TransactionStatus = "completed" | "pending" | "processing";

const emptyProjectForm = {
  title: "",
  description: "",
  location: "",
  targetRaise: "",
  targetIrr: "",
  status: "active" as ProjectStatus,
};

const emptyInvestmentForm = {
  amount: "",
  date: new Date().toISOString().slice(0, 10),
};

const emptyTransactionForm = {
  investmentName: "",
  type: "distribution" as TransactionType,
  amount: "",
  status: "completed" as TransactionStatus,
  date: new Date().toISOString().slice(0, 10),
};

const emptyTaxForm = {
  name: "",
  asset: "--",
  year: String(new Date().getFullYear()),
  sharedDate: new Date().toISOString().slice(0, 10),
  url: "#",
};

const emptyFinancialForm = {
  name: "",
  asset: "--",
  category: "Quarterly Update",
  year: String(new Date().getFullYear()),
  sharedDate: new Date().toISOString().slice(0, 10),
  url: "#",
};

function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint: string; icon: typeof Building2 }) {
  return (
    <Card className="border-white/50 bg-white/85 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.55)] backdrop-blur">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function RecentList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ id: string; title: string; detail: string; meta: string }>;
}) {
  return (
    <Card className="border-slate-200/80 bg-white/90">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-muted-foreground">
            Nothing published yet.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <span className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {item.meta}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminWorkspace() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [taxDocuments, setTaxDocuments] = useState<ApiTaxDocument[]>([]);
  const [financialDocuments, setFinancialDocuments] = useState<ApiFinancialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [entityInput, setEntityInput] = useState("");

  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [investmentForm, setInvestmentForm] = useState(emptyInvestmentForm);
  const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);
  const [taxForm, setTaxForm] = useState(emptyTaxForm);
  const [financialForm, setFinancialForm] = useState(emptyFinancialForm);
  const [taxFile, setTaxFile] = useState<File | null>(null);
  const [financialFile, setFinancialFile] = useState<File | null>(null);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [users, selectedUserId],
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || null,
    [projects, selectedProjectId],
  );

  const selectedEntity = entityInput.trim();
  const availableEntities = selectedUser?.entities || [];

  const refreshData = async () => {
    const [nextUsers, nextProjects, nextTransactions, nextTaxDocs, nextFinancialDocs] = await Promise.all([
      listAdminUsers(),
      listProjects(),
      listTransactions(),
      listTaxDocuments(),
      listFinancialDocuments(),
    ]);

    setUsers(nextUsers);
    setProjects(nextProjects);
    setTransactions(nextTransactions);
    setTaxDocuments(nextTaxDocs);
    setFinancialDocuments(nextFinancialDocs);

    if (!selectedUserId && nextUsers[0]) {
      setSelectedUserId(nextUsers[0].id);
      setEntityInput(nextUsers[0].entities?.[0] || "");
    }

    if (!selectedProjectId && nextProjects[0]) {
      setSelectedProjectId(nextProjects[0]._id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        await refreshData();
      } catch (err) {
        if (mounted) {
          toast({
            title: "Failed to load admin workspace",
            description: err instanceof Error ? err.message : "Unknown error",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    if (!selectedEntity && selectedUser.entities?.[0]) {
      setEntityInput(selectedUser.entities[0]);
    }
  }, [selectedUser, selectedEntity]);

  const requireContext = ({ needsUser = false, needsProject = false, needsEntity = false } = {}) => {
    if (needsUser && !selectedUser) {
      throw new Error("Select an investor first");
    }
    if (needsProject && !selectedProject) {
      throw new Error("Select a project first");
    }
    if (needsEntity && !selectedEntity) {
      throw new Error("Enter or choose an entity first");
    }
  };

  const runSubmit = async (key: string, action: () => Promise<void>) => {
    try {
      setSubmitting(key);
      await action();
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const recentProjects = projects.slice(0, 3).map((project) => ({
    id: project._id,
    title: project.title,
    detail: project.location || "Location pending",
    meta: project.status,
  }));

  const recentTransactions = transactions.slice(0, 4).map((item) => ({
    id: item._id,
    title: `${item.projectName} • ${item.entity}`,
    detail: `${item.type} • $${item.amount.toLocaleString()}`,
    meta: item.status,
  }));

  const recentDocuments = [...taxDocuments, ...financialDocuments]
    .slice(0, 4)
    .map((item) => ({
      id: item._id,
      title: item.name,
      detail: `${item.projectName} • ${item.investingEntity}`,
      meta: String(item.year),
    }));

  return (
    <div className="space-y-8 pb-10">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(238,242,255,0.78)_36%,_rgba(226,232,240,0.82)_100%)] shadow-[0_30px_90px_-52px_rgba(15,23,42,0.6)]">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-8">
          <div>
            <Badge variant="outline" className="border-slate-300 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-600">
              Admin publishing workspace
            </Badge>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
              Publish investor-ready details 
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Pick the investor, entity, and project once. Then add the exact project details, investment records,
              transactions, and documents the investor should see in their portal.
            </p>

       
          </div>

          <Card className="border-white/60 bg-white/85 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.55)] backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-2 text-slate-900">
                <Sparkles className="h-4 w-4" />
                <CardTitle className="text-lg">Publishing context</CardTitle>
              </div>
              <CardDescription>
                Set the investor context once. The forms below reuse it automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Investor</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={(value) => {
                    setSelectedUserId(value);
                    const nextUser = users.find((user) => user.id === value);
                    setEntityInput(nextUser?.entities?.[0] || "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose investor" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} • {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Entity</Label>
                <Input
                  value={entityInput}
                  onChange={(event) => setEntityInput(event.target.value)}
                  placeholder="APV Retirement LLC"
                />
                {availableEntities.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availableEntities.map((entity) => (
                      <button
                        key={entity}
                        type="button"
                        onClick={() => setEntityInput(entity)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                      >
                        {entity}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-medium text-slate-900">Current target</div>
                <div className="mt-2 space-y-1">
                  <div>Investor: {selectedUser?.name || "Not selected"}</div>
                  <div>Entity: {selectedEntity || "Not selected"}</div>
                  <div>Project: {selectedProject?.title || "Not selected"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Investors" value={users.length} hint="Approved users ready for publishing" icon={Users} />
        <StatCard label="Projects" value={projects.length} hint="Projects currently visible in portal" icon={Building2} />
        <StatCard label="Transactions" value={transactions.length} hint="Records shown on investor accounts" icon={Receipt} />
        <StatCard label="Documents" value={taxDocuments.length + financialDocuments.length} hint="Tax and financial files available" icon={FileSpreadsheet} />
      </section>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading admin workspace...</CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-2">
            <Card className="border-slate-200/80 bg-white/95">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-slate-900" />
                  <CardTitle className="text-xl">Create project details</CardTitle>
                </div>
                <CardDescription>Add the project shell first so it can be reused everywhere else.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Project title</Label>
                    <Input
                      value={projectForm.title}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Leander282"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Location</Label>
                    <Input
                      value={projectForm.location}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, location: event.target.value }))}
                      placeholder="3360 County Road 282, Leander, TX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target raise</Label>
                    <Input
                      type="number"
                      value={projectForm.targetRaise}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, targetRaise: event.target.value }))}
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target IRR</Label>
                    <Input
                      type="number"
                      value={projectForm.targetIrr}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, targetIrr: event.target.value }))}
                      placeholder="16"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Status</Label>
                    <Select
                      value={projectForm.status}
                      onValueChange={(value: ProjectStatus) => setProjectForm((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                        <SelectItem value="exited">Exited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={projectForm.description}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Short project summary investors will understand immediately."
                    />
                  </div>
                </div>

                <Button
                  className="w-full md:w-auto"
                  disabled={submitting === "project"}
                  onClick={() => runSubmit("project", async () => {
                    const response = await createProject({
                      title: projectForm.title.trim(),
                      description: projectForm.description.trim(),
                      location: projectForm.location.trim(),
                      targetRaise: projectForm.targetRaise ? Number(projectForm.targetRaise) : undefined,
                      targetIrr: projectForm.targetIrr ? Number(projectForm.targetIrr) : undefined,
                      status: projectForm.status,
                    }) as { project?: ApiProject };

                    await refreshData();

                    if (response.project?._id) {
                      setSelectedProjectId(response.project._id);
                    }

                    setProjectForm(emptyProjectForm);
                    toast({ title: "Project created", description: "The project is now available in the admin workspace." });
                  })}
                >
                  {submitting === "project" ? "Saving project..." : "Create project"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/95">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-slate-900" />
                  <CardTitle className="text-xl">Assign investment</CardTitle>
                </div>
                <CardDescription>Link the selected investor to the selected project and keep the entity mapping in sync.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Investment amount</Label>
                    <Input
                      type="number"
                      value={investmentForm.amount}
                      onChange={(event) => setInvestmentForm((prev) => ({ ...prev, amount: event.target.value }))}
                      placeholder="12000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Investment date</Label>
                    <Input
                      type="date"
                      value={investmentForm.date}
                      onChange={(event) => setInvestmentForm((prev) => ({ ...prev, date: event.target.value }))}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <div>Investor: <span className="font-medium text-slate-900">{selectedUser?.name || "Choose investor"}</span></div>
                  <div className="mt-1">Entity: <span className="font-medium text-slate-900">{selectedEntity || "Choose entity"}</span></div>
                  <div className="mt-1">Project: <span className="font-medium text-slate-900">{selectedProject?.title || "Choose project"}</span></div>
                </div>

                <Button
                  className="w-full md:w-auto"
                  disabled={submitting === "investment"}
                  onClick={() => runSubmit("investment", async () => {
                    requireContext({ needsUser: true, needsProject: true, needsEntity: true });
                    await createInvestment({
                      userId: selectedUser!.id,
                      projectId: selectedProject!._id,
                      amount: Number(investmentForm.amount),
                      date: investmentForm.date,
                      entity: selectedEntity,
                    });

                    await refreshData();
                    setInvestmentForm(emptyInvestmentForm);
                    toast({ title: "Investment assigned", description: "The investor can now see this project in their portal." });
                  })}
                >
                  {submitting === "investment" ? "Assigning..." : "Assign investment"}
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card className="border-slate-200/80 bg-white/95">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-slate-900" />
                  <CardTitle className="text-xl">Post transaction</CardTitle>
                </div>
                <CardDescription>Add investor-facing money movement for the selected entity and project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Investment label</Label>
                    <Input
                      value={transactionForm.investmentName}
                      onChange={(event) => setTransactionForm((prev) => ({ ...prev, investmentName: event.target.value }))}
                      placeholder="Quarterly distribution"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={transactionForm.type}
                      onValueChange={(value: TransactionType) => setTransactionForm((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="distribution">Distribution</SelectItem>
                        <SelectItem value="return">Return</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={transactionForm.status}
                      onValueChange={(value: TransactionStatus) => setTransactionForm((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={transactionForm.amount}
                      onChange={(event) => setTransactionForm((prev) => ({ ...prev, amount: event.target.value }))}
                      placeholder="3500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={transactionForm.date}
                      onChange={(event) => setTransactionForm((prev) => ({ ...prev, date: event.target.value }))}
                    />
                  </div>
                </div>

                <Button
                  className="w-full md:w-auto"
                  disabled={submitting === "transaction"}
                  onClick={() => runSubmit("transaction", async () => {
                    requireContext({ needsProject: true, needsEntity: true });
                    await createTransaction({
                      projectName: selectedProject!.title,
                      investmentName: transactionForm.investmentName.trim(),
                      type: transactionForm.type,
                      amount: Number(transactionForm.amount),
                      status: transactionForm.status,
                      entity: selectedEntity,
                      date: transactionForm.date,
                    });

                    await refreshData();
                    setTransactionForm(emptyTransactionForm);
                    toast({ title: "Transaction posted", description: "The transaction is now visible in the investor transaction list." });
                  })}
                >
                  {submitting === "transaction" ? "Posting transaction..." : "Post transaction"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/95">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileBadge className="h-5 w-5 text-slate-900" />
                  <CardTitle className="text-xl">Publish tax document</CardTitle>
                </div>
                <CardDescription>Use the same investor context to drop K-1s or other annual tax files into the portal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Document name</Label>
                    <Input
                      value={taxForm.name}
                      onChange={(event) => setTaxForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="2024_APV Retirement LLC_K1.pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={taxForm.year}
                      onChange={(event) => setTaxForm((prev) => ({ ...prev, year: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shared date</Label>
                    <Input
                      type="date"
                      value={taxForm.sharedDate}
                      onChange={(event) => setTaxForm((prev) => ({ ...prev, sharedDate: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset</Label>
                    <Input
                      value={taxForm.asset}
                      onChange={(event) => setTaxForm((prev) => ({ ...prev, asset: event.target.value }))}
                      placeholder="--"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Document URL</Label>
                    <Input
                      value={taxForm.url}
                      onChange={(event) => setTaxForm((prev) => ({ ...prev, url: event.target.value }))}
                      placeholder="#"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Or upload file</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx"
                        onChange={(e) => setTaxFile(e.target.files?.[0] || null)}
                      />
                      {taxFile && (
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">{taxFile.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full md:w-auto"
                  disabled={submitting === "tax"}
                  onClick={() => runSubmit("tax", async () => {
                    requireContext({ needsProject: true, needsEntity: true });

                    let docUrl = taxForm.url.trim() || "#";
                    if (taxFile) {
                      const uploaded = await uploadFile(taxFile);
                      docUrl = uploaded.url;
                    }

                    await createTaxDocument({
                      name: taxForm.name.trim(),
                      investingEntity: selectedEntity,
                      asset: taxForm.asset.trim(),
                      year: Number(taxForm.year),
                      sharedDate: taxForm.sharedDate,
                      projectName: selectedProject!.title,
                      url: docUrl,
                      isNew: true,
                    });

                    await refreshData();
                    setTaxForm(emptyTaxForm);
                    setTaxFile(null);
                    toast({ title: "Tax document published", description: "The investor can now see the file in tax documents." });
                  })}
                >
                  {submitting === "tax" ? "Publishing..." : "Publish tax document"}
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-slate-200/80 bg-white/95">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-slate-900" />
                  <CardTitle className="text-xl">Publish financial document</CardTitle>
                </div>
                <CardDescription>Quarterly updates, statements, and supporting material land here for the investor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Document name</Label>
                    <Input
                      value={financialForm.name}
                      onChange={(event) => setFinancialForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Q1 2026 operating update"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={financialForm.category}
                      onChange={(event) => setFinancialForm((prev) => ({ ...prev, category: event.target.value }))}
                      placeholder="Quarterly Update"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={financialForm.year}
                      onChange={(event) => setFinancialForm((prev) => ({ ...prev, year: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shared date</Label>
                    <Input
                      type="date"
                      value={financialForm.sharedDate}
                      onChange={(event) => setFinancialForm((prev) => ({ ...prev, sharedDate: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Asset</Label>
                    <Input
                      value={financialForm.asset}
                      onChange={(event) => setFinancialForm((prev) => ({ ...prev, asset: event.target.value }))}
                      placeholder="--"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Document URL</Label>
                    <Input
                      value={financialForm.url}
                      onChange={(event) => setFinancialForm((prev) => ({ ...prev, url: event.target.value }))}
                      placeholder="#"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Or upload file</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx"
                        onChange={(e) => setFinancialFile(e.target.files?.[0] || null)}
                      />
                      {financialFile && (
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">{financialFile.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full md:w-auto"
                  disabled={submitting === "financial"}
                  onClick={() => runSubmit("financial", async () => {
                    requireContext({ needsProject: true, needsEntity: true });

                    let docUrl = financialForm.url.trim() || "#";
                    if (financialFile) {
                      const uploaded = await uploadFile(financialFile);
                      docUrl = uploaded.url;
                    }

                    await createFinancialDocument({
                      name: financialForm.name.trim(),
                      investingEntity: selectedEntity,
                      asset: financialForm.asset.trim(),
                      category: financialForm.category.trim(),
                      year: Number(financialForm.year),
                      sharedDate: financialForm.sharedDate,
                      projectName: selectedProject!.title,
                      url: docUrl,
                    });

                    await refreshData();
                    setFinancialForm(emptyFinancialForm);
                    setFinancialFile(null);
                    toast({ title: "Financial document published", description: "The file is now available in the investor portal." });
                  })}
                >
                  {submitting === "financial" ? "Publishing..." : "Publish financial document"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <RecentList
                title="Recent projects"
                description="Latest project details visible to users"
                items={recentProjects}
              />
              <RecentList
                title="Recent transactions"
                description="Most recent ledger items published to accounts"
                items={recentTransactions}
              />
              <RecentList
                title="Recent documents"
                description="Latest tax and financial files"
                items={recentDocuments}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}