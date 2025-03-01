-- Function to allow admins to get bank info for any user
CREATE OR REPLACE FUNCTION admin_get_bank_info(p_user_id UUID)
RETURNS SETOF bank_info
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the current user is an admin
  IF (SELECT user_type FROM users WHERE id = auth.uid()) = 'admin' THEN
    -- Return bank info for the specified user
    RETURN QUERY SELECT * FROM bank_info WHERE user_id = p_user_id;
  ELSE
    -- Non-admins can only see their own bank info
    RETURN QUERY SELECT * FROM bank_info WHERE user_id = auth.uid();
  END IF;
END;
$$;