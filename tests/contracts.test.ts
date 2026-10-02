import { test } from 'node:test';
import assert from 'node:assert/strict';
import { empty } from '../src/shared/contracts';
test('versão rejeita argumentos na fronteira', () => { empty(undefined); assert.throws(() => empty({}), /não recebe argumentos/); });
