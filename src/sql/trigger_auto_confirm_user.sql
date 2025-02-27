-- Yeni bir kullanıcı eklendiğinde çalışacak tetikleyici
DROP TRIGGER IF EXISTS auto_confirm_user_trigger ON auth.users;
CREATE TRIGGER auto_confirm_user_trigger
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auto_confirm_user();
