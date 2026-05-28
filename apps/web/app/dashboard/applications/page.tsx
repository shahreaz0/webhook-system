"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ExternalLink,
  FolderKanban,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useActiveApp } from "@/lib/active-app-context";
import { apiClient } from "@/lib/fetch-client";
import { cn } from "@/lib/utils";

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const { activeApp, setActiveApp, refreshApplications } = useActiveApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications list using TanStack Query
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: apiClient.getApplications,
  });

  // Create application mutation
  const createMutation = useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => apiClient.createApplication(name, description),
    onSuccess: async () => {
      setName("");
      setDescription("");
      setCreating(false);
      await refreshApplications();
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create application.");
    },
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteApplication(id),
    onSuccess: async () => {
      await refreshApplications();
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      return;
    }
    createMutation.mutate({ name, description });
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
        {applications.map((app) => {
          const isActive = activeApp?.id === app.id;
          return (
            <Card
              className={`group relative flex flex-col justify-between transition-all duration-200 ${
                isActive
                  ? "border-primary bg-primary/2"
                  : "hover:border-border-hover"
              }`}
              key={app.id}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="truncate">
                    <div className="truncate font-mono text-[10px] text-muted-foreground">
                      ID: {app.id}
                    </div>
                    <CardTitle className="mt-1 truncate font-semibold text-sm">
                      {app.name}
                    </CardTitle>
                  </div>
                  {isActive ? (
                    <span className="flex items-center gap-1 border border-primary/20 bg-primary/10 px-2 py-0.5 font-bold font-mono text-[9px] text-primary">
                      <Check className="size-2.5" />
                      ACTIVE
                    </span>
                  ) : (
                    <Button
                      className="h-5 px-2 font-bold font-mono text-[9px] opacity-0 transition-all group-hover:opacity-100"
                      onClick={() => setActiveApp(app)}
                      variant="outline"
                    >
                      ACTIVATE
                    </Button>
                  )}
                </div>
                <CardDescription className="mt-2 line-clamp-2 h-8 text-[11px] leading-relaxed">
                  {app.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 font-mono text-[10px] text-muted-foreground">
                Registered: {new Date(app.createdAt).toLocaleDateString()}
              </CardContent>
              <CardFooter className="flex justify-between border-border/50 border-t pt-3 dark:border-input/50">
                <Button
                  className={cn(
                    "h-7 px-2 font-bold font-mono text-[10px]",
                    isActive
                      ? "pointer-events-none text-primary hover:text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  disabled={isActive}
                  onClick={() => setActiveApp(app)}
                  variant="ghost"
                >
                  <ExternalLink className="size-3" />
                  Open Console
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        size="icon"
                        title="Delete Application"
                        variant="ghost"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Application</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this application? All
                        subscribers and webhooks will be deleted!
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(app.id)}
                        variant="destructive"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          );
        })}
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
        <Button onClick={() => setCreating(!creating)}>
          {creating ? "Cancel" : "New Application"}
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Creation Modal Form Panel */}
      {creating && (
        <Card className="fade-in slide-in-from-top-2 animate-in border-primary/20 bg-primary/5 duration-200 dark:bg-primary/5">
          <form onSubmit={handleCreate}>
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 font-semibold text-sm">
                <Sparkles className="size-4 text-primary" />
                Configure New Application Space
              </CardTitle>
              <CardDescription>
                Define a name and description for your integration module.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
                  {error}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    className="font-semibold text-foreground/80 text-xs"
                    htmlFor="appName"
                  >
                    Application Name
                  </label>
                  <Input
                    id="appName"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Stripe Sync Platform"
                    required
                    value={name}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className="font-semibold text-foreground/80 text-xs"
                    htmlFor="appDesc"
                  >
                    Description
                  </label>
                  <Input
                    id="appDesc"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Syncs transactions and card charges"
                    value={description}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button disabled={createMutation.isPending} type="submit">
                {createMutation.isPending ? "Creating..." : "Save Application"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Applications Grid */}
      {renderApplicationsContent()}
    </div>
  );
}
