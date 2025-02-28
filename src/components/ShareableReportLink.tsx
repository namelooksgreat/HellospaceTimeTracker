import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Copy, Check, Link, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ExportData } from "@/types/export";
import { generateHTMLPreview } from "@/lib/utils/html-preview";
import { cn } from "@/lib/utils";

interface ShareableReportLinkProps {
  data: ExportData;
}

export function ShareableReportLink({ data }: ShareableReportLinkProps) {
  const [reportLink, setReportLink] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareableLink = async () => {
    try {
      setLoading(true);

      // Ensure all entries have tags property
      const dataWithTags = {
        ...data,
        entries: data.entries.map((entry) => ({
          ...entry,
          tags: entry.tags || [],
        })),
      };

      // Generate HTML content
      const htmlContent = generateHTMLPreview(dataWithTags);

      // Create a unique ID for the report
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Create a Blob URL instead of using Supabase storage
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Open the report in a new window
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        toast.error(
          "Yeni pencere açılamadı. Lütfen popup engelleyiciyi kontrol edin.",
        );
        return;
      }

      // Set the report link to the current page URL with a hash
      // This is just for display purposes since we can't actually create a shareable link without a server
      setReportLink(window.location.href);
      toast.success("Rapor yeni pencerede açıldı");

      // Inform the user about the limitation
      toast.info(
        "Not: Bu rapor sadece sizin tarayıcınızda görüntülenebilir. Gerçek bir paylaşım linki için sunucu desteği gereklidir.",
        {
          duration: 5000,
        },
      );
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Rapor oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportLink);
      setCopied(true);
      toast.success("Link panoya kopyalandı");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Link kopyalanırken bir hata oluştu");
    }
  };

  return (
    <div className="space-y-4">
      {!reportLink ? (
        <Button
          onClick={generateShareableLink}
          disabled={loading}
          className={cn(
            "w-full rounded-lg transition-all duration-200",
            "bg-gradient-to-br from-card/50 to-card/30 dark:from-card/20 dark:to-card/10",
            "border border-border/50 hover:border-border/80 hover:shadow-md",
          )}
          variant="outline"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Oluşturuluyor...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <ExternalLink className="mr-2 h-4 w-4" />
              Raporu Yeni Pencerede Aç
            </span>
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300">
            <p className="text-xs">
              Not: Bu rapor sadece sizin tarayıcınızda görüntülenebilir. Gerçek
              bir paylaşım linki için sunucu desteği gereklidir.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateShareableLink}
            className="w-full rounded-lg border-border/50 hover:bg-accent/50 transition-all duration-200"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Raporu Tekrar Aç
          </Button>
        </div>
      )}
    </div>
  );
}
