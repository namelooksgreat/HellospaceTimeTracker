-- Davetiye silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_invitation(invitation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Davetiyeyi sil
  DELETE FROM invitations
  WHERE id = invitation_id;
  
  -- İşlem başarılı
  RETURN;
END;
$$;

-- Yetkilendirme
GRANT EXECUTE ON FUNCTION delete_invitation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_invitation(UUID) TO anon;
