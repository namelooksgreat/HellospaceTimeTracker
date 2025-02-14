import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2 } from "lucide-react";
import { TimeEntryDialog } from "../dialogs/TimeEntryDialog";
import { handleError } from "@/lib/utils/error-handler";
import { showSuccess } from "@/lib/utils/toast";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TimeEntry } from "@/types";
import { formatDuration } from "@/lib/utils/time";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  startOfDay,
  endOfDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { tr } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TimeEntriesPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [period, setPeriod] = useState<
    "all" | "daily" | "weekly" | "monthly" | "yearly"
  >("all");

  const loadEntries = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const { data, error } = await supabase
        .from("time_entries")
        .select(
          `
          id,
          task_name,
          description,
          duration,
          start_time,
          created_at,
          user_id,
          project:projects (id, name, color, customer:customers(id, name))
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const formattedEntries: TimeEntry[] = (data || []).map((item) => ({
        id: item.id,
        task_name: item.task_name,
        description: item.description,
        duration: item.duration,
        start_time: item.start_time,
        created_at: item.created_at,
        user_id: item.user_id,
        project_id: item.project?.[0]?.id,
        project: item.project?.[0]
          ? {
              id: item.project[0].id,
              name: item.project[0].name,
              color: item.project[0].color,
              customer: item.project[0].customer?.[0]
                ? {
                    id: item.project[0].customer[0].id,
                    name: item.project[0].customer[0].name,
                  }
                : undefined,
            }
          : null,
      }));
      setEntries(formattedEntries);
    } catch (error) {
      handleError(error, "TimeEntriesPage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;

    try {
      const { error } = await supabase
        .from("time_entries")
        .delete()
        .eq("id", selectedEntry.id);

      if (error) throw error;
      showSuccess("Zaman girişi başarıyla silindi");
      loadEntries();
    } catch (error) {
      handleError(error, "TimeEntriesPage");
    } finally {
      setShowDeleteDialog(false);
      setSelectedEntry(null);
    }
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries.filter(
      (entry) =>
        entry.task_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.project?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.project?.customer?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );

    // Apply date range filter if set
    if (dateRange?.from) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.start_time);
        const start = dateRange.from
          ? startOfDay(dateRange.from)
          : startOfDay(new Date());
        const end = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from || new Date());
        return isWithinInterval(entryDate, { start, end });
      });
    }
    // Apply period filter
    else if (period !== "all") {
      const now = new Date();
      let start: Date;
      let end: Date;

      switch (period) {
        case "daily":
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case "weekly":
          start = startOfWeek(now, { locale: tr });
          end = endOfWeek(now, { locale: tr });
          break;
        case "monthly":
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case "yearly":
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        default:
          return filtered;
      }

      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.start_time);
        return isWithinInterval(entryDate, { start, end });
      });
    }

    return filtered;
  }, [entries, searchQuery, dateRange, period]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Zaman Girişleri</h1>
        <Button onClick={() => setShowEntryDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Zaman Girişi Ekle
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Zaman girişi ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={period}
            onValueChange={(value: any) => setPeriod(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periyot seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="daily">Bugün</SelectItem>
              <SelectItem value="weekly">Bu Hafta</SelectItem>
              <SelectItem value="monthly">Bu Ay</SelectItem>
              <SelectItem value="yearly">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker
            date={dateRange}
            onDateChange={(range) => {
              setPeriod("all");
              setDateRange(range);
            }}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Görev</TableHead>
              <TableHead>Proje</TableHead>
              <TableHead>Süre</TableHead>
              <TableHead>Başlangıç</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Zaman girişi bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="max-w-[200px] truncate">
                    {entry.task_name}
                    {entry.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {entry.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {entry.project ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full ring-1 ring-border/50"
                          style={{ backgroundColor: entry.project.color }}
                        />
                        <span>
                          {entry.project.name}
                          {entry.project.customer?.name &&
                            ` (${entry.project.customer.name})`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDuration(entry.duration)}</TableCell>
                  <TableCell>
                    {new Date(entry.start_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowEntryDialog(true);
                        }}
                      >
                        Düzenle
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TimeEntryDialog
        entry={selectedEntry}
        open={showEntryDialog}
        onOpenChange={setShowEntryDialog}
        onSave={loadEntries}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zaman Girişini Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu zaman girişini silmek istediğinize emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
