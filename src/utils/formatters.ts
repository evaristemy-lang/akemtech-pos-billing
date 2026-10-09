/**
 * Formatting utilities for AkemBiz (Cameroon XAF / FCFA)
 */

export function formatFCFA(amount: number | null | undefined, language: 'en' | 'fr' = 'en'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 FCFA';
  }
  const rounded = Math.round(amount);
  if (language === 'fr') {
    // French format uses space as thousands separator
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }
  // English format uses comma
  return rounded.toLocaleString('en-US') + ' FCFA';
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(dateString: string | undefined, language: 'en' | 'fr' = 'en'): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined, language: 'en' | 'fr' = 'en'): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatCameroonPhone(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+237') && clean.length === 13) {
    return `+237 ${clean.slice(4, 7)} ${clean.slice(7, 9)} ${clean.slice(9, 11)} ${clean.slice(11, 13)}`;
  }
  if (clean.length === 9) {
    return `+237 ${clean.slice(0, 3)} ${clean.slice(3, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)}`;
  }
  return phone;
}

export function generateOrderNumber(prefix: string): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${randomPart}`;
}
