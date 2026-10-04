// One timer and one live region for ordinary email-copy feedback.
export function initToast() {
  const toast = document.getElementById('toast');
  let timeout;
  return message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('on');
    clearTimeout(timeout);
    timeout = setTimeout(() => toast.classList.remove('on'), 2200);
  };
}
