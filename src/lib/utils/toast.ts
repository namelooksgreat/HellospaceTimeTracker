import { toast } from "@/components/ui/use-toast";

export const showError = (message: string) => {
  toast({
    title: "Hata",
    description: message,
    variant: "destructive",
  });
};

export const showSuccess = (message: string) => {
  toast({
    title: "Başarılı",
    description: message,
    variant: "default",
  });
};

export const showInfo = (message: string) => {
  toast({
    title: "Bilgi",
    description: message,
    variant: "secondary",
  });
};
