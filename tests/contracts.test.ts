import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deskInput, empty } from '../src/shared/contracts';
test('versão rejeita argumentos na fronteira', () => { empty(undefined); assert.throws(() => empty({}), /não recebe argumentos/); });
test('mesa aceita grade e conserva a validação estrita das operações', () => {
  const subjectId = '11111111-1111-4111-8111-111111111111';
  assert.equal(deskInput.parse({ subjectId, tool: 'both' }).tool, 'both');
  for (const tool of ['focus', 'checklist', 'none']) assert.equal(deskInput.parse({ subjectId, tool }).tool, tool);
  assert.throws(() => deskInput.parse({ subjectId, tool: 'terminal' }));
  assert.throws(() => deskInput.parse({ subjectId, tool: 'both', command: 'run' }));
});
