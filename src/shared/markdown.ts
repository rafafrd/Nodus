export type EditKind = 'bold' | 'italic' | 'heading' | 'bullet' | 'check' | 'link' | 'code' | 'table';
export function formatSelection(text: string, from: number, to: number, kind: EditKind) {
  const value = text.slice(from, to);
  const options: Record<EditKind, string> = {
    bold: `**${value || 'texto'}**`, italic: `*${value || 'texto'}*`, heading: `\n## ${value || 'Título'}\n`,
    bullet: `\n- ${value || 'Item'}\n`, check: `\n- [ ] ${value || 'Etapa'}\n`, link: `[${value || 'referência'}](reference.md)`,
    code: `\n\`\`\`\n${value || 'código'}\n\`\`\`\n`, table: '\n| Coluna | Valor |\n| --- | --- |\n| Item | Texto |\n',
  };
  const insert = options[kind];
  return { text: text.slice(0, from) + insert + text.slice(to), insert, from, to };
}
