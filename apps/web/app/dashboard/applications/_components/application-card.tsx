"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
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
} from "@/web/components/ui/alert-dialog";
import { Button } from "@/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/web/components/ui/card";
import { CopyButton } from "@/web/components/ui/copy-button";
import type { Application } from "@/web/lib/types";
import { cn } from "@/web/lib/utils";
import { useDeleteApplication } from "../_hooks/use-delete-application";
import { useUpdateActiveApp } from "../_hooks/use-update-active-app";
import { useApplicationsStore } from "../store";

interface ApplicationCardProps {
  app: Application;
  isActive: boolean;
}

export function ApplicationCard({ app, isActive }: ApplicationCardProps) {
  const deleteMutation = useDeleteApplication();
  const updateActiveApp = useUpdateActiveApp();
  const {
    setIsUpsertApplicationDialogOpen,
    setApplicationMutationType,
    setSelectedApplication,
  } = useApplicationsStore();

  const handleEdit = () => {
    setIsUpsertApplicationDialogOpen(true);
    setApplicationMutationType("edit");
    setSelectedApplication(app);
  };

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between transition-all duration-200",
        isActive ? "border-primary bg-primary/2" : "hover:border-border-hover"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="truncate">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="truncate">ID: {app.id}</span>
              <CopyButton
                successMessage="Copied application ID!"
                title="Copy Application ID"
                value={app.id}
              />
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
              className="h-5 px-2 font-bold font-mono text-[9px]"
              onClick={() => updateActiveApp.mutate(app)}
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
      <CardFooter className="flex justify-end border-border/50 border-t pt-3 dark:border-input/50">
        <div className="flex items-center gap-1">
          <Button
            className="h-7 w-7 text-muted-foreground hover:bg-muted"
            onClick={handleEdit}
            size="icon"
            title="Edit Application"
            variant="ghost"
          >
            <Pencil className="size-3.5" />
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
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(app.id)}
                  variant="destructive"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}
