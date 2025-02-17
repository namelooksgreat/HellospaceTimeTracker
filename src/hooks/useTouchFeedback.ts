export function useTouchFeedback() {
  const triggerHaptic = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10); // 10ms hafif titreşim
    }
  };

  const triggerHapticError = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([50, 50, 50]); // Hata için daha uzun titreşim paterni
    }
  };

  const triggerHapticSuccess = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([20, 30, 20]); // Başarı için özel titreşim paterni
    }
  };

  return { triggerHaptic, triggerHapticError, triggerHapticSuccess };
}
