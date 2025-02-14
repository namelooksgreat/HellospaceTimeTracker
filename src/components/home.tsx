import React, { useState, Suspense, lazy, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { showSuccess } from "@/lib/utils/toast";
import { EditTimeEntryDialog } from "./EditTimeEntryDialog";
import { useHomeData } from "@/lib/hooks/useHomeData";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "./ui/skeleton";
import { usePerformanceTracking } from "@/hooks/usePerformanceTracking";
import { handleError } from "@/lib/utils/error-handler";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  getProjects,
  getTimeEntries,
  deleteTimeEntry,
  getCustomers,
} from "@/lib/api";
import type { Project, Customer, TimeEntry as TimeEntryType } from "@/types";
import TimeEntryComponent from "./TimeEntry";

// Lazy load components
const TimeTracker = lazy(() => import("@/components/TimeTracker"));
const ReportsPage = lazy(() => import("@/components/reports/ReportsPage"));
const ProfilePage = lazy(() => import("@/components/profile/ProfilePage"));

function Home() {
  usePerformanceTracking("Home");
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<"timer" | "reports" | "profile">(
    "timer",
  );

  const { projects, customers, timeEntries, loading, fetchTimeEntriesData } =
    useHomeData(session);

  const handleDeleteTimeEntry = async (id: string) => {
    try {
      await deleteTimeEntry(id);
      await fetchTimeEntriesData();
    } catch (error) {
      handleError(error, "Home");
    }
  };

  const [selectedEntry, setSelectedEntry] = useState<TimeEntryType | null>(
    null,
  );
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      duration: number;
      hourlyRate?: number;
      currency?: string;
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
          })
          .eq("id", selectedEntry.id);

        if (entryError) throw entryError;

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
        setShowEditDialog(false);
        await fetchTimeEntriesData();
      } catch (error) {
        handleError(error, "Home");
      }
    },
    [selectedEntry, fetchTimeEntriesData],
  );

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  const LoadingFallback = () => (
    <div className="space-y-4 p-4">
      <Skeleton className="h-[300px] w-full rounded-xl bg-card/50" />
      <Skeleton className="h-[400px] w-full rounded-xl bg-card/50" />
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
                      {timeEntries.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-muted-foreground">
                            Recent Entries
                          </div>
                          {timeEntries.slice(0, 2).map((entry) => (
                            <TimeEntryComponent
                              key={entry.id}
                              taskName={entry.task_name}
                              projectName={entry.project?.name || ""}
                              duration={entry.duration}
                              startTime={entry.start_time}
                              createdAt={entry.created_at}
                              projectColor={entry.project?.color || "#94A3B8"}
                              onDelete={() => handleDeleteTimeEntry(entry.id)}
                              onEdit={() => {
                                setSelectedEntry(entry);
                                setShowEditDialog(true);
                              }}
                            />
                          ))}
                        </div>
                      )}
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
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              entry={selectedEntry}
              projects={projects}
              customers={customers}
              onSave={handleEditEntry}
            />
          )}
        </main>
      </div>
    </MainLayout>
  );
}

export default Home;
