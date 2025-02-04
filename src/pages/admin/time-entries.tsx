import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TimeEntriesTable } from "@/components/admin/TimeEntriesTable";
import { getTimeEntries, deleteTimeEntry, updateTimeEntry } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function TimeEntriesPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await getTimeEntries();
      setEntries(data);
    } catch (error) {
      console.error("Error loading time entries:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load time entries",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTimeEntry(id);
      toast({
        title: "Success",
        description: "Time entry deleted successfully",
      });
      loadEntries();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete time entry",
      });
    }
  };

  const handleEdit = async (entry) => {
    try {
      await updateTimeEntry(entry.id, {
        task_name: entry.task_name,
        project_id: entry.project_id,
        duration: entry.duration,
        start_time: entry.start_time,
      });
      toast({
        title: "Success",
        description: "Time entry updated successfully",
      });
      loadEntries();
    } catch (error) {
      console.error("Error updating time entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update time entry",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <TimeEntriesTable
          entries={entries}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  );
}
