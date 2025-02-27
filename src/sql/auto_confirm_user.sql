-- Kullanıcı oluşturulduğunda otomatik olarak doğrulama yapan fonksiyon
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Davet ile oluşturulan kullanıcılar için
  IF NEW.raw_user_meta_data->>'from_invitation' = 'true' THEN
    -- E-posta doğrulama tarihini şimdiki zaman olarak ayarla
    NEW.email_confirmed_at = NOW();
    -- Doğrulama tarihini de güncelle
    NEW.confirmed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
