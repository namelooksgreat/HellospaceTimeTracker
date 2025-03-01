-- Update bank_info table to remove swift_code and account_number fields
ALTER TABLE bank_info DROP COLUMN IF EXISTS swift_code;
ALTER TABLE bank_info DROP COLUMN IF EXISTS account_number;
