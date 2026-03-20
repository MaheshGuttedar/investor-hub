import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <main className={`flex-1 p-8 transition-[margin] duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Outlet context={{ selectedCompany }} />
      </main>
    </div>
  );
}
