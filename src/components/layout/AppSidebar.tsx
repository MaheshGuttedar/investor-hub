import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  FileText,
  BarChart3,
  MessageSquare,
  User,
  UserCheck,
  BriefcaseBusiness,
  ChevronDown,
  Building2,
  LogOut,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
//import { companies } from "@/data/mockData";
import { listPendingUsers } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

type SidebarNavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  chip?: number;
};

const navItems: SidebarNavItem[] = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderKanban, label: "My Projects" },
  { to: "/transactions", icon: Receipt, label: "Transactions" },
  { to: "/tax-documents", icon: FileText, label: "Tax Documents" },
  { to: "/financial-documents", icon: BarChart3, label: "Financial Documents" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/profile", icon: User, label: "My Profile" },
];

interface AppSidebarProps {
  selectedCompany: string;
  onCompanyChange: (companyId: string) => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function AppSidebar({ selectedCompany, onCompanyChange, collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, role, signOut } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  //const currentCompany = companies.find((c) => c.id === selectedCompany) || companies[0];

  useEffect(() => {
    if (role !== "admin" || !token) {
      setPendingCount(0);
      return;
    }

    let mounted = true;

    const loadPendingCount = async () => {
      try {
        const users = await listPendingUsers(token);
        if (mounted) {
          setPendingCount(users.length);
        }
      } catch {
        if (mounted) {
          setPendingCount(0);
        }
      }
    };

    loadPendingCount();
    const intervalId = window.setInterval(loadPendingCount, 15000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [role, token]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "??";

  const displayName = user?.name || user?.email || "User";
  const adminNavItems: SidebarNavItem[] = role === "admin"
    ? [
        { to: "/admin/workspace", icon: BriefcaseBusiness, label: "Admin Workspace" },
        { to: "/admin/approvals", icon: UserCheck, label: "Admin Approvals", chip: pendingCount },
      ]
    : [];

  return (
    <>
    {/* Toggle button visible when sidebar is collapsed */}
    {collapsed && (
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 rounded-md bg-sidebar p-2 text-sidebar-foreground shadow-lg hover:bg-sidebar-accent transition-colors"
        title="Open sidebar"
      >
        <PanelLeft className="h-5 w-5" />
      </button>
    )}
    <aside className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ${collapsed ? "-translate-x-full" : "translate-x-0"}`}>
      {/* Logo + toggle */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-7 w-7 text-accent" />
          <span className="text-lg font-bold tracking-tight">Company </span>
        </div>
        <button
          onClick={onToggle}
          className="rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

       
      {/* <div className="px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-md bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors">
            <span className="truncate text-left">{currentCompany.name}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem
              onClick={() => onCompanyChange("all")}
              className={selectedCompany === "all" ? "bg-accent" : ""}
            >
              All Companies
            </DropdownMenuItem>
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => onCompanyChange(company.id)}
                className={selectedCompany === company.id ? "bg-accent" : ""}
              >
                {company.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {[...navItems, ...adminNavItems].map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 truncate">{item.label}</span>
              {typeof item.chip === "number" && (
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
                  {item.chip}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs text-sidebar-muted capitalize">{role === "user" ? "Investor" : (role || "Investor")}</p>
                {role === "admin" && (
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
