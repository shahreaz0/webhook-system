"use client";

import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/web/components/ui/button";
import { useActiveApp } from "@/web/lib/active-app-context";
import { ApplicationCard } from "./components/application-card";
import { CreateApplicationForm } from "./components/create-application-form";
import { useGetApplicationList } from "./hooks/use-get-application-list";

export default function ApplicationsPage() {
  const { activeApp } = useActiveApp();
  const [creating, setCreating] = useState(false);

  // Fetch applications list using the custom query hook
  const { data: applications = [], isLoading } = useGetApplicationList();

  function handleToggleCreating() {
    setCreating((prev) => !prev);
  }

  function renderApplicationsContent() {
    if (isLoading) {
      return (
        <div className="py-12 text-center font-mono text-muted-foreground text-xs">
          Querying applications list...
        </div>
      );
    }

    if (applications.length === 0) {
      return (
        <div className="flex h-[40vh] flex-col items-center justify-center border border-border border-dashed p-8 text-center dark:border-input">
          <FolderKanban className="mb-4 size-10 stroke-1 text-muted-foreground" />
          <h3 className="font-semibold text-sm">No applications found</h3>
          <p className="mt-1 max-w-sm text-muted-foreground text-xs">
            Create an application to begin configuring subscribers and event
            types.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applications.map((app) => (
          <ApplicationCard
            app={app}
            isActive={activeApp?.id === app.id}
            key={app.id}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl tracking-tight">
            Applications Manager
          </h2>
          <p className="text-muted-foreground text-xs">
            Isolate event spaces, event definitions, and subscribers into
            separate sandbox containers.
          </p>
        </div>
        <Button onClick={handleToggleCreating}>
          {creating ? "Cancel" : "New Application"}
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Creation Modal Form Panel */}
      {creating && <CreateApplicationForm />}

      {/* Applications Grid */}
      {renderApplicationsContent()}
    </div>
  );
}
