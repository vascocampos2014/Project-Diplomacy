export function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Recebe uma data no formato "AAAA-MM-DD" (da API) e devolve "23 Mar 2024".
export function formatarDataPt(data: string | null | undefined): string {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('-');
  return `${dia} ${MESES_PT[Number(mes) - 1] ?? mes} ${ano}`;
}
