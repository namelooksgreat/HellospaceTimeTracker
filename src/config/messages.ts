export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Başarıyla giriş yaptınız",
    LOGIN_ERROR: "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin",
    REGISTER_SUCCESS: "Hesabınız başarıyla oluşturuldu",
    REGISTER_ERROR: "Kayıt işlemi başarısız oldu",
    LOGOUT_SUCCESS: "Başarıyla çıkış yaptınız",
    LOGOUT_ERROR: "Çıkış yapılırken bir hata oluştu",
    SESSION_EXPIRED: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın",
  },
  TIME_TRACKING: {
    ENTRY_SAVED: "Zaman kaydı başarıyla kaydedildi",
    ENTRY_ERROR: "Zaman kaydı kaydedilemedi",
    ENTRY_DELETED: "Zaman kaydı silindi",
    DELETE_ERROR: "Zaman kaydı silinemedi",
  },
  GENERAL: {
    LOADING: "Yükleniyor...",
    ERROR: "Bir hata oluştu",
    SUCCESS: "İşlem başarılı",
    NOT_FOUND: "Bulunamadı",
    UNAUTHORIZED: "Bu işlem için yetkiniz yok",
  },
} as const;
