import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { generateHTMLPreview } from "@/lib/utils/html-preview";
import { ExportData } from "@/types/export";
import { toast } from "sonner";
import { FileText, ExternalLink, X, Download } from "lucide-react";
import { ShareableReportLink } from "./ShareableReportLink";

interface ReportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExportData;
}

export function ReportPreview({
  open,
  onOpenChange,
  data,
}: ReportPreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    if (open && data) {
      // Make sure entries have tags property
      const dataWithTags = {
        ...data,
        entries: data.entries.map((entry) => ({
          ...entry,
          tags: entry.tags || [],
        })),
      };

      // Generate HTML preview when dialog opens
      const html = generateHTMLPreview(dataWithTags);
      setHtmlContent(html);
    }
  }, [open, data]);

  const openInNewWindow = () => {
    try {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        toast.success("Rapor yeni pencerede açıldı");
      } else {
        toast.error(
          "Yeni pencere açılamadı. Lütfen popup engelleyiciyi kontrol edin.",
        );
      }
    } catch (error) {
      toast.error("Rapor açılırken bir hata oluştu");
      console.error("Report open error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0 rounded-xl border-border/50 shadow-xl">
        <DialogHeader className="sticky top-0 z-10 p-4 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Rapor Önizleme
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full h-8 w-8 hover:bg-accent/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-auto p-1 h-[calc(90vh-8rem)]">
          <iframe
            srcDoc={htmlContent}
            title="Report Preview"
            className="w-full h-full border-0 rounded-lg"
            sandbox="allow-same-origin"
          />
        </div>

        <DialogFooter className="sticky bottom-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border/50 flex-col sm:flex-row gap-4">
          <div className="w-full">
            <ShareableReportLink data={data} />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial rounded-lg border-border/50 hover:bg-accent/50 transition-all duration-200"
            >
              Kapat
            </Button>
            <Button
              onClick={openInNewWindow}
              className="flex-1 sm:flex-initial rounded-lg bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Yeni Pencerede Aç
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
