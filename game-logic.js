export const COLORS = ['red', 'yellow', 'green', 'blue', 'purple', 'orange'];

export function validateCode(code) {
  return Array.isArray(code) && code.length === 4 && new Set(code).size === 4 && code.every(color => COLORS.includes(color));
}

export function evaluate(secret, guess, mode = 'line') {
  if (!validateCode(secret) || !validateCode(guess)) {
    throw new TypeError('密码和猜测必须是由 4 种不重复有效颜色组成的数组');
  }
  const line = guess.map((color, index) => color === secret[index] ? 'green' : secret.includes(color) ? 'white' : 'black');
  if (mode === 'line') return line;
  if (mode === 'dots') {
    const green = line.filter(result => result === 'green').length;
    const white = line.filter(result => result === 'white').length;
    return { green, white, black: 4 - green - white };
  }
  throw new TypeError('mode 必须是 line 或 dots');
}

export function randomSecret(random = Math.random) {
  const pool = [...COLORS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 4);
}
