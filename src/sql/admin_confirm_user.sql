-- Create a function to confirm a user's email without sending verification email
CREATE OR REPLACE FUNCTION admin_confirm_user(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the auth.users table to set email_confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      updated_at = NOW(),
      is_sso_user = FALSE,
      email_change_token_current = NULL,
      email_change_token_new = NULL,
      email_change_confirm_status = 0,
      email_change = NULL,
      phone_change_token = NULL,
      phone_change = NULL,
      phone_confirmed_at = NULL,
      confirmed_at = NOW()
  WHERE id = user_id;
  
  -- Also update the user metadata to indicate email is confirmed
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || '{"email_confirmed": true}'::jsonb
  WHERE id = user_id;
  
  -- Return nothing
  RETURN;
END;
$$;

-- Grant execute permission to authenticated users and anon
GRANT EXECUTE ON FUNCTION admin_confirm_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_confirm_user(UUID) TO anon;
