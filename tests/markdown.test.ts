import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { formatSelection } from '../src/shared/markdown';
const text = fs.readFileSync('tests/fixtures/compatibility.md', 'utf8');
test('edição seletiva preserva bytes do frontmatter, fórmulas, referências e bloco desconhecido', () => {
  const from = text.indexOf('Esta frase pode mudar.');
  const after = text.slice(0, from) + 'Esta frase foi editada.' + text.slice(from + 'Esta frase pode mudar.'.length);
  assert.equal(after.replace('Esta frase foi editada.', 'Esta frase pode mudar.'), text);
  const edit = formatSelection(text, from, from + 'Esta frase pode mudar.'.length, 'bold');
  assert.equal(edit.text.replace('**Esta frase pode mudar.**', 'Esta frase pode mudar.'), text);
});
