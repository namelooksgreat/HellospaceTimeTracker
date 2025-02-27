-- Davet tokenini kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION check_invitation_token(p_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  email TEXT,
  role TEXT,
  metadata JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (i.expires_at > NOW() AND i.used_at IS NULL) AS is_valid,
    i.email,
    i.role,
    i.metadata::JSONB
  FROM invitations i
  WHERE i.token = p_token;
  
  -- Sonuç bulunamazsa boş bir satır döndür
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, NULL::TEXT, NULL::JSONB;
  END IF;
  
  RETURN;
END;
$$;

-- Yetkilendirme
GRANT EXECUTE ON FUNCTION check_invitation_token(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_invitation_token(TEXT) TO anon;
