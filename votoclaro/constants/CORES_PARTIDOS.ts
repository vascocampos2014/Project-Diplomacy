// Cores oficiais dos partidos — ver .claude/DESIGN.md
// Usar sempre com fundo neutro — nunca colocar texto sobre a cor do partido.
export const CORES_PARTIDOS: Record<string, string> = {
  PS: '#F0385C',
  PSD: '#F97316',
  Chega: '#003399',
  IL: '#60A5FA',
  BE: '#BE123C',
  CDU: '#DC2626',
  PAN: '#16A34A',
  Livre: '#7C3AED',
  // Siglas da API da Assembleia da República (legislatura XVII)
  CH: '#003399',
  L: '#7C3AED',
  PCP: '#DC2626',
  'CDS-PP': '#0EA5E9',
  JPP: '#0D9488',
};

export const COR_PARTIDO_DEFAULT = '#9CA3AF';

export function getCorPartido(partido: string): string {
  return CORES_PARTIDOS[partido] ?? COR_PARTIDO_DEFAULT;
}
