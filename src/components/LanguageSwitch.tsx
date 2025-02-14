import { Button } from "./ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language } from "@/lib/i18n";

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "tr" ? "en" : "tr");
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="w-16">
      {language.toUpperCase()}
    </Button>
  );
}
