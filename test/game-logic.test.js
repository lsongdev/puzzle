import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, randomSecret, validateCode } from '../game-logic.js';

const secret = ['red', 'yellow', 'green', 'blue'];

test('line 模式逐格返回位置对应的提示', () => {
  assert.deepEqual(evaluate(secret, ['red', 'green', 'yellow', 'purple'], 'line'), ['green', 'white', 'white', 'black']);
});

test('dots 模式只返回统计且总数恒为 4', () => {
  const result = evaluate(secret, ['red', 'green', 'yellow', 'purple'], 'dots');
  assert.deepEqual(result, { green: 1, white: 2, black: 1 });
  assert.equal(result.green + result.white + result.black, 4);
});

test('覆盖全对、全错和颜色对但位置全错', () => {
  assert.deepEqual(evaluate(secret, secret, 'dots'), { green: 4, white: 0, black: 0 });
  assert.deepEqual(evaluate(secret, ['purple', 'orange', 'red', 'yellow'], 'dots'), { green: 0, white: 2, black: 2 });
  assert.deepEqual(evaluate(secret, ['yellow', 'green', 'blue', 'red'], 'dots'), { green: 0, white: 4, black: 0 });
});

test('拒绝重复、长度错误和无效颜色', () => {
  assert.equal(validateCode(['red', 'red', 'green', 'blue']), false);
  assert.equal(validateCode(['red', 'yellow', 'green']), false);
  assert.throws(() => evaluate(secret, ['red', 'red', 'green', 'blue']), TypeError);
  assert.throws(() => evaluate(secret, ['red', 'yellow', 'green', 'pink']), TypeError);
});

test('随机密码始终包含四种不重复的有效颜色', () => {
  assert.equal(validateCode(randomSecret(() => 0.42)), true);
});
