import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/utils/error-handler";
import { AdminHeader } from "../components/AdminHeader";
import { AdminFilters } from "../components/AdminFilters";
import { AdminTable } from "../components/AdminTable";
import { Button } from "@/components/ui/button";
import { CreditCard, Eye, Trash2 } from "lucide-react";
import { useAdminUI } from "@/hooks/useAdminUI";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { ErrorState } from "@/components/ui/error-state";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BankInfo {
  id: string;
  user_id: string;
  bank_name: string;
  account_holder: string;
  iban: string;
  branch_name?: string;
  created_at: string;
  updated_at: string;
  user_full_name: string;
  user_email: string;
}

export function UserBankInfoPage() {
  const [bankInfos, setBankInfos] = useState<BankInfo[]>([]);
  const [filteredBankInfos, setFilteredBankInfos] = useState<BankInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBankInfo, setSelectedBankInfo] = useState<BankInfo | null>(
    null,
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBankInfos, setSelectedBankInfos] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { isLoading, error, handleAsync, clearError } = useAdminUI();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get("user");
    loadBankInfos(userId);
  }, []);

  const loadBankInfos = async (userId?: string | null) => {
    await handleAsync(
      async () => {
        let data, error;

        // If userId is provided, use the admin RPC function to get that user's bank info
        if (userId) {
          const result = await supabase.rpc("admin_get_bank_info", {
            p_user_id: userId,
          });
          data = result.data;
          error = result.error;
        } else {
          // Otherwise get all bank info (admin only)
          const result = await supabase.from("bank_info").select("*");
          data = result.data;
          error = result.error;
        }

        if (error) throw error;

        // After getting bank info, fetch user details separately
        const transformedData = [];

        console.log("Bank info raw data:", data);
        for (const item of data || []) {
          try {
            // Get user details
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("full_name, email")
              .eq("id", item.user_id)
              .single();

            if (userError) {
              console.error("Error fetching user details:", userError);
            }

            transformedData.push({
              ...item,
              user_full_name: userData?.full_name || "Unknown",
              user_email: userData?.email || "Unknown",
            });
          } catch (error) {
            console.error("Error processing bank info:", error);
            // Still add the item even if we can't get user details
            transformedData.push({
              ...item,
              user_full_name: "Unknown",
              user_email: "Unknown",
            });
          }
        }
        console.log("Transformed bank info data:", transformedData);

        setBankInfos(transformedData);
        filterBankInfos(transformedData, searchQuery);

        // If filtering by user and there's a result, update the page title
        if (userId && transformedData.length > 0) {
          document.title = `${transformedData[0].user_full_name} - Banka Bilgileri`;
        }
      },
      {
        loadingMessage: "Banka bilgileri yükleniyor...",
        errorMessage: "Banka bilgileri yüklenirken hata oluştu",
      },
    );
  };

  const filterBankInfos = (data: BankInfo[], query: string) => {
    const filtered = data.filter(
      (item) =>
        item.user_full_name.toLowerCase().includes(query.toLowerCase()) ||
        item.user_email.toLowerCase().includes(query.toLowerCase()) ||
        item.bank_name.toLowerCase().includes(query.toLowerCase()) ||
        item.account_holder.toLowerCase().includes(query.toLowerCase()) ||
        item.iban.toLowerCase().includes(query.toLowerCase()),
    );

    setFilteredBankInfos(filtered);
  };

  useEffect(() => {
    filterBankInfos(bankInfos, searchQuery);
  }, [bankInfos, searchQuery]);

  const paginatedBankInfos = filteredBankInfos.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleDeleteBankInfo = async (id: string) => {
    if (!confirm("Bu banka bilgisini silmek istediğinize emin misiniz?"))
      return;

    await handleAsync(
      async () => {
        const { error } = await supabase
          .from("bank_info")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast.success("Banka bilgisi başarıyla silindi");
        loadBankInfos();
      },
      {
        loadingMessage: "Banka bilgisi siliniyor...",
        errorMessage: "Banka bilgisi silinirken hata oluştu",
      },
    );
  };

  if (error) {
    return (
      <ErrorState
        title="Banka bilgileri yüklenemedi"
        description={error.message}
        onRetry={() => {
          clearError();
          loadBankInfos();
        }}
      />
    );
  }

  // Format IBAN with spaces for better readability
  const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})(?=.)/g, "$1 ").trim();
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <AdminHeader
        title="Kullanıcı Banka Bilgileri"
        description="Kullanıcıların banka bilgilerini görüntüleyin ve yönetin"
      />

      <AdminFilters
        searchProps={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Kullanıcı adı, e-posta veya banka bilgisi ara...",
        }}
        selectedCount={selectedBankInfos.length}
      />

      <AdminTable
        data={paginatedBankInfos}
        columns={[
          {
            header: "Kullanıcı",
            cell: (item) => (
              <div>
                <div className="font-medium">{item.user_full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {item.user_email}
                </div>
              </div>
            ),
          },
          {
            header: "Banka",
            cell: (item) => (
              <div>
                <div className="font-medium">{item.bank_name}</div>
                {item.branch_name && (
                  <div className="text-sm text-muted-foreground">
                    {item.branch_name}
                  </div>
                )}
              </div>
            ),
          },
          {
            header: "Hesap Sahibi",
            cell: (item) => item.account_holder,
          },
          {
            header: "IBAN",
            cell: (item) => (
              <div className="font-mono text-sm">{formatIBAN(item.iban)}</div>
            ),
          },
          {
            header: "İşlemler",
            cell: (item) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBankInfo(item);
                    setShowDetailsDialog(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Detaylar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteBankInfo(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </div>
            ),
          },
        ]}
        loading={isLoading}
      />

      <DataTablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredBankInfos.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Bank Info Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent
          className="max-w-md"
          aria-describedby="bank-info-details-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>Banka Bilgisi Detayları</span>
            </DialogTitle>
            <p
              id="bank-info-details-description"
              className="text-sm text-muted-foreground"
            >
              Kullanıcının banka hesap bilgilerini görüntüleyin ve yönetin.
            </p>
          </DialogHeader>

          {selectedBankInfo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Kullanıcı
                  </div>
                  <div className="font-medium">
                    {selectedBankInfo.user_full_name}
                  </div>
                  <div className="text-sm">{selectedBankInfo.user_email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Banka
                  </div>
                  <div className="font-medium">
                    {selectedBankInfo.bank_name}
                  </div>
                  {selectedBankInfo.branch_name && (
                    <div className="text-sm">
                      {selectedBankInfo.branch_name}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Hesap Sahibi
                </div>
                <div className="font-medium">
                  {selectedBankInfo.account_holder}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  IBAN
                </div>
                <div className="font-mono bg-muted/50 p-2 rounded-md text-sm">
                  {formatIBAN(selectedBankInfo.iban)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Oluşturulma Tarihi
                  </div>
                  <div className="text-sm">
                    {new Date(selectedBankInfo.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Son Güncelleme
                  </div>
                  <div className="text-sm">
                    {new Date(selectedBankInfo.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Kapat
            </Button>
            {selectedBankInfo && (
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleDeleteBankInfo(selectedBankInfo.id);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
