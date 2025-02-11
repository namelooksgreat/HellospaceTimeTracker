import { useState, useCallback, useEffect } from "react";
import { getProjects, getCustomers } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { EditTimeEntryDialog } from "../EditTimeEntryDialog";
import { updateTimeEntry } from "@/lib/api";
import { handleError } from "@/lib/utils/error-handler";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DailyReport } from "./DailyReport";
import { WeeklyReport } from "./WeeklyReport";
import { ProjectsReport } from "./ProjectsReport";
import { BarChart2, Calendar, PieChart, Clock, DollarSign } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import type { TimeEntry } from "@/types";

interface ReportsPageProps {
  entries: TimeEntry[];
  onDeleteEntry?: (id: string) => void;
  projects?: Array<{
    id: string;
    name: string;
    color: string;
    customer_id: string;
  }>;
  customers?: Array<{ id: string; name: string }>;
}

export default function ReportsPage({
  entries: initialEntries,
  onDeleteEntry,
  projects = [],
  customers = [],
}: ReportsPageProps) {
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const handleEditEntry = useCallback(
    async (data: {
      taskName: string;
      projectId: string;
      customerId: string;
      description: string;
      duration: number;
    }) => {
      if (!selectedEntry) return;

      try {
        await updateTimeEntry(selectedEntry.id, {
          task_name: data.taskName,
          project_id: data.projectId || null,
          description: data.description,
        });

        // Refresh entries
        const { data: updatedEntries, error } = await supabase
          .from("time_entries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEntries(updatedEntries);
        setShowEditDialog(false);
      } catch (error) {
        handleError(error, "ReportsPage");
      }
    },
    [selectedEntry],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedEntry || !onDeleteEntry) return;
    onDeleteEntry(selectedEntry.id);
    setShowDeleteDialog(false);
  }, [selectedEntry, onDeleteEntry]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <BarChart2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Time Reports</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-14 p-1.5 bg-muted/50 dark:bg-muted/30 rounded-xl ring-1 ring-border transition-all duration-300 ease-in-out grid grid-cols-3 gap-1">
          <TabsTrigger
            value="daily"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Daily</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Weekly</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all hover:bg-accent/50 active:scale-95 touch-none"
          >
            <div className="flex items-center justify-center gap-1.5">
              <PieChart className="h-4 w-4" />
              <span>Projects</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent
            value="daily"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <DailyReport
              entries={entries}
              onDeleteEntry={(id) => {
                const entry = entries.find((e) => e.id === id);
                if (entry) {
                  setSelectedEntry(entry);
                  setShowDeleteDialog(true);
                }
              }}
              onEditEntry={(id) => {
                const entry = entries.find((e) => e.id === id);
                if (entry) {
                  setSelectedEntry(entry);
                  setShowEditDialog(true);
                }
              }}
            />
          </TabsContent>

          <TabsContent
            value="weekly"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <WeeklyReport entries={entries} />
          </TabsContent>

          <TabsContent
            value="projects"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <ProjectsReport entries={entries} />
          </TabsContent>
        </div>
      </Tabs>

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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
