import { useState, Suspense, lazy, useCallback, memo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { showSuccess } from "@/lib/utils/toast";
import { toast } from "sonner";
import { EditTimeEntryDialog } from "./EditTimeEntryDialog";
import { useDialogStore } from "@/store/dialogStore";
import { useHomeData } from "@/lib/hooks/useHomeData";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "./ui/skeleton";
import { TimeTrackerSkeleton } from "./skeletons/TimeTrackerSkeleton";
import { TimeEntrySkeleton } from "./skeletons/TimeEntrySkeleton";
import { usePerformanceTracking } from "@/hooks/usePerformanceTracking";
import { handleError } from "@/lib/utils/error-handler";
import { ErrorBoundary } from "./ErrorBoundary";
import { useNavigationStore } from "@/store/navigationStore";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import type { Project, Customer, TimeEntry as TimeEntryType } from "@/types";
import TimeEntryComponent from "./TimeEntry";

// Lazy load components
const TimeTracker = lazy(() => import("@/components/TimeTracker"));
const ReportsPage = lazy(() => import("./reports/ReportsPage"));
const ProfilePage = lazy(() => import("./profile/ProfilePage"));

function Home() {
  usePerformanceTracking("Home");
  const { session } = useAuth();
  const { activeTab, setActiveTab } = useNavigationStore();

  const {
    projects = [],
    customers = [],
    timeEntries = [],
    loading = false,
    fetchTimeEntriesData,
  } = useHomeData(session) || {};

  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const handleDeleteTimeEntry = async (id: string) => {
    setEntryToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;

    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", entryToDelete);

      if (error) throw error;

      // Refresh data after deletion
      if (fetchTimeEntriesData) {
        await fetchTimeEntriesData();
      }
      toast.success("Time entry deleted successfully");
      setEntryToDelete(null);
    } catch (error) {
      handleError(error, "Home");
      toast.error("Failed to delete time entry");
    }
  };

  const [selectedEntry, setSelectedEntry] = useState<TimeEntryType | null>(
    null,
  );
  const { setEditTimeEntryDialog } = useDialogStore();

  const handleEditEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      duration: number;
      hourlyRate?: number;
      currency?: string;
      startTime?: string;
      tags?: string[];
    }) => {
      if (!selectedEntry) return;

      try {
        // Update time entry
        const { error: entryError } = await supabase
          .from("time_entries")
          .update({
            task_name: data.taskName,
            project_id: data.projectId || null,
            description: data.description,
            duration: data.duration,
            start_time: data.startTime,
          })
          .eq("id", selectedEntry.id);

        if (entryError) throw entryError;

        // Handle tags if provided
        if (data.tags && Array.isArray(data.tags)) {
          // First delete existing tags
          const { error: deleteTagsError } = await supabase
            .from("time_entry_tags")
            .delete()
            .eq("time_entry_id", selectedEntry.id);

          if (deleteTagsError) throw deleteTagsError;

          // Then insert new tags if any
          if (data.tags.length > 0) {
            const tagEntries = data.tags.map((tagId) => ({
              time_entry_id: selectedEntry.id,
              tag_id: tagId,
              created_at: new Date().toISOString(),
            }));

            const { error: insertTagsError } = await supabase
              .from("time_entry_tags")
              .insert(tagEntries);

            if (insertTagsError) throw insertTagsError;
          }
        }

        // Update customer rate if user is admin and rate data is provided
        if (
          session?.user?.user_metadata?.role === "admin" &&
          data.customerId &&
          data.hourlyRate !== undefined &&
          data.currency
        ) {
          const { error: rateError } = await supabase
            .from("customer_rates")
            .upsert({
              customer_id: data.customerId,
              hourly_rate: data.hourlyRate,
              currency: data.currency,
              updated_at: new Date().toISOString(),
            });

          if (rateError) throw rateError;
        }

        showSuccess("Time entry updated successfully");
        setEditTimeEntryDialog(false, null);
        if (fetchTimeEntriesData) {
          await fetchTimeEntriesData();
        }
      } catch (error) {
        handleError(error, "Home");
      }
    },
    [selectedEntry, fetchTimeEntriesData, session?.user?.user_metadata?.role],
  );

  useEffect(() => {
    // Initial fetch
    if (fetchTimeEntriesData) {
      fetchTimeEntriesData();

      // Set up a polling interval as a fallback for realtime
      const intervalId = setInterval(() => {
        fetchTimeEntriesData();
      }, 5000); // Poll every 5 seconds for more responsive updates

      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [fetchTimeEntriesData]);

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  const LoadingFallback = () => (
    <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6 pb-20 animate-in fade-in-50 duration-500">
      <TimeTrackerSkeleton />
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <TimeEntrySkeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="min-h-[100dvh] bg-gradient-to-b from-background via-background/95 to-background/90">
        <main className="container max-w-5xl mx-auto px-4 py-6 space-y-6 pb-20 animate-in fade-in-50 duration-500">
          {loading ? (
            <LoadingFallback />
          ) : (
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <div className="space-y-6">
                  {activeTab === "timer" && (
                    <div className="space-y-6">
                      <TimeTracker
                        projects={projects}
                        customers={customers}
                        availableTags={[
                          { value: "bug", label: "Bug" },
                          { value: "feature", label: "Feature" },
                          { value: "documentation", label: "Documentation" },
                          { value: "design", label: "Design" },
                          { value: "testing", label: "Testing" },
                        ]}
                        onTimeEntrySaved={fetchTimeEntriesData}
                      />

                      {/* Recent Time Entries */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          Recent Entries
                        </div>
                        <div className="space-y-3">
                          {timeEntries.slice(0, 2).map((entry) => (
                            <TimeEntryComponent
                              key={entry.id}
                              taskName={entry.task_name}
                              projectName={entry.project?.name || ""}
                              duration={entry.duration}
                              startTime={entry.start_time}
                              projectColor={entry.project?.color || "#94A3B8"}
                              tags={entry.tags || []}
                              onEdit={() => {
                                setSelectedEntry(entry);
                                setEditTimeEntryDialog(true, entry.id);
                              }}
                              onDelete={() => handleDeleteTimeEntry(entry.id)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "reports" && (
                    <ReportsPage
                      entries={timeEntries}
                      projects={projects}
                      customers={customers}
                      onDeleteEntry={handleDeleteTimeEntry}
                    />
                  )}
                  {activeTab === "profile" && <ProfilePage />}
                </div>
              </Suspense>
            </ErrorBoundary>
          )}

          {selectedEntry && (
            <EditTimeEntryDialog
              entry={selectedEntry}
              projects={projects}
              customers={customers}
              onSave={handleEditEntry}
            />
          )}

          <AlertDialog
            open={!!entryToDelete}
            onOpenChange={(open) => !open && setEntryToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this time entry? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={handleConfirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  type="button"
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </MainLayout>
  );
}

export default memo(Home);
