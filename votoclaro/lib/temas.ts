// Classificação de tema por palavras-chave no título da iniciativa.
// A API da Assembleia da República não tem um campo de "tema" — esta é uma
// heurística aproximada, não-oficial, usada apenas para filtrar o feed.

export const TEMAS = ['Habitação', 'Saúde', 'Ambiente', 'Educação', 'Economia', 'Trabalho', 'Justiça', 'Outros'];

const REGRAS: Array<{ tema: string; regex: RegExp }> = [
  { tema: 'Habitação', regex: /habita|arrendamento|arrendat|renda|fogos|imobili/i },
  { tema: 'Saúde', regex: /saúde|saude|sns|hospital|médic|medic|enfermeir|cuidador/i },
  { tema: 'Ambiente', regex: /ambient|clima|florest|biodiversidade|resíduos|residuos|poluiç|energia renovável|energias renováveis/i },
  { tema: 'Educação', regex: /educaç|escola|ensino|estudante|universidad|académic/i },
  { tema: 'Trabalho', regex: /trabalho|laboral|salári|emprego|trabalhador|desemprego|greve/i },
  { tema: 'Justiça', regex: /justiça|penal|crime|criminal|tribunal|judicial|prisã|jurídic/i },
  { tema: 'Economia', regex: /iva\b|imposto|fiscal|tributári|orçamento|economia|empresas|finanças/i },
];

export function classificarTema(titulo: string): string {
  for (const { tema, regex } of REGRAS) {
    if (regex.test(titulo)) {
      return tema;
    }
  }
  return 'Outros';
}
