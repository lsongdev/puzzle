import { COLORS, evaluate, randomSecret, validateCode } from './game-logic.js';
import { LEVELS } from './levels.js';

const STORAGE_KEY = 'color-code-progress-v1';
const COLOR_META = {
  red: { name: '红', symbol: 'R' }, yellow: { name: '黄', symbol: 'Y' },
  green: { name: '绿', symbol: 'G' }, blue: { name: '蓝', symbol: 'B' },
  purple: { name: '紫', symbol: 'P' }, orange: { name: '橙', symbol: 'O' },
};
const loadProgress = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; } catch { return {}; } };
const progress = loadProgress();
let state = {
  gameType: progress.gameType ?? 'random', randomMode: progress.randomMode ?? 'line',
  levelIndex: Math.min(progress.levelIndex ?? 0, LEVELS.length - 1), selected: [],
  random: progress.random ?? null, levelGames: progress.levelGames ?? {},
};

const freshGame = (secret = randomSecret(), maxAttempts = 7) => ({ secret, maxAttempts, guesses: [], status: 'playing' });
function ensureGame() {
  if (state.gameType === 'random') return state.random ??= freshGame();
  const level = LEVELS[state.levelIndex];
  return state.levelGames[level.id] ??= freshGame(level.secret, level.maxAttempts);
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ gameType: state.gameType, randomMode: state.randomMode,
    levelIndex: state.levelIndex, random: state.random, levelGames: state.levelGames }));
}
const currentLevel = () => LEVELS[state.levelIndex];
const currentMode = () => state.gameType === 'random' ? state.randomMode : currentLevel().mode;
const el = (tag, className, text) => {
  const node = document.createElement(tag); if (className) node.className = className;
  if (text !== undefined) node.textContent = text; return node;
};
function colorPeg(color, { small = false, button = false } = {}) {
  const node = el(button ? 'button' : 'span', `peg peg--${color}${small ? ' peg--small' : ''}`, COLOR_META[color].symbol);
  node.setAttribute('aria-label', `${COLOR_META[color].name}色`); node.title = `${COLOR_META[color].name}色`;
  if (button) node.type = 'button'; return node;
}
function feedbackView(result, mode) {
  if (mode === 'line') {
    const wrap = el('div', 'line-feedback');
    const names = { green: '颜色及位置正确', white: '颜色正确、位置错误', black: '颜色不存在' };
    result.forEach(item => { const mark = el('span', `line-mark line-mark--${item}`, { green: '✓', white: '↔', black: '×' }[item]); mark.title = names[item]; wrap.append(mark); });
    wrap.setAttribute('aria-label', result.map(x => names[x]).join('，')); return wrap;
  }
  const wrap = el('div', 'dot-feedback');
  [['green', result.green, '✓'], ['white', result.white, '↔'], ['black', result.black, '×']].forEach(([kind, count, symbol]) => {
    for (let i = 0; i < count; i++) wrap.append(el('span', `hint-dot hint-dot--${kind}`, symbol));
  });
  wrap.setAttribute('aria-label', `位置正确 ${result.green}，颜色正确位置错误 ${result.white}，不存在 ${result.black}`); return wrap;
}
function historyRow(guess, mode, label) {
  const row = el('li', 'history-row'); row.append(el('span', 'row-label', label));
  const pegs = el('div', 'guess-pegs'); guess.forEach(color => pegs.append(colorPeg(color, { small: true })));
  row.append(pegs, feedbackView(evaluate(ensureGame().secret, guess, mode), mode)); return row;
}

function render() {
  const app = document.querySelector('#app'); app.replaceChildren();
  const game = ensureGame(), mode = currentMode(), level = state.gameType === 'level' ? currentLevel() : null;
  const remaining = game.maxAttempts - game.guesses.length;
  const shell = el('div', 'page-shell');
  const header = el('header', 'hero');
  header.innerHTML = '<div><p class="eyebrow">COLOR CODE</p><h1>密码破解</h1><p class="subtitle">找出四种颜色，以及它们藏身的顺序。</p></div>';
  const help = el('button', 'icon-button', '?'); help.type = 'button'; help.title = '查看规则'; help.setAttribute('aria-label', '查看游戏规则');
  help.onclick = () => document.querySelector('#rules').showModal(); header.append(help); shell.append(header);

  const tabs = el('nav', 'tabs'); tabs.setAttribute('aria-label', '游戏类型');
  [['random', '随机挑战'], ['level', '单人关卡']].forEach(([value, label]) => {
    const btn = el('button', `tab ${state.gameType === value ? 'is-active' : ''}`, label); btn.type = 'button';
    btn.onclick = () => { state.gameType = value; state.selected = []; save(); render(); }; tabs.append(btn);
  }); shell.append(tabs);

  const panel = el('section', 'game-panel'), toolbar = el('div', 'toolbar'), identity = el('div', 'identity');
  identity.append(el('span', 'mode-badge', mode === 'line' ? '初级 · 划线' : '高级 · 圆点'));
  identity.append(el('strong', '', level ? `关卡 ${level.id} / ${LEVELS.length}` : '随机密码')); toolbar.append(identity);
  const attempts = el('div', 'attempts'); attempts.innerHTML = `<span>剩余机会</span><strong>${remaining}</strong><small>/ ${game.maxAttempts}</small>`;
  toolbar.append(attempts); panel.append(toolbar);

  if (state.gameType === 'random' && game.guesses.length === 0 && game.status === 'playing') {
    const switcher = el('div', 'mode-switch');
    [['line', '初级 · 逐格提示'], ['dots', '高级 · 统计提示']].forEach(([value, label]) => {
      const btn = el('button', state.randomMode === value ? 'is-active' : '', label); btn.type = 'button';
      btn.onclick = () => { state.randomMode = value; save(); render(); }; switcher.append(btn);
    }); panel.append(switcher);
  }

  const history = el('ol', 'history');
  if (level?.hints?.length) {
    panel.append(el('div', 'section-label', `初始线索 · ${level.hints.length} 条（不计次数）`));
    level.hints.forEach((hint, i) => history.append(historyRow(hint.guess, mode, `线索 ${i + 1}`)));
  }
  if (game.guesses.length) {
    panel.append(el('div', 'section-label', '你的验证'));
    game.guesses.forEach((guess, i) => history.append(historyRow(guess, mode, `#${i + 1}`)));
  }
  if (!history.children.length) {
    const empty = el('div', 'empty-state'); empty.innerHTML = '<span>◇</span><p>还没有验证记录<br><small>从下方选择四种不同颜色</small></p>'; panel.append(empty);
  } else panel.append(history);

  if (game.status !== 'playing') renderResult(panel, game);
  else renderPicker(panel);
  renderActions(panel, game); shell.append(panel, buildLegend(mode)); app.append(shell, buildRules());
}

function renderResult(panel, game) {
  const result = el('section', `result result--${game.status}`); result.append(el('div', 'result-icon', game.status === 'won' ? '✓' : '×'));
  const copy = el('div', 'result-copy'); copy.append(el('h2', '', game.status === 'won' ? '密码破解成功！' : '机会用完了'));
  copy.append(el('p', '', game.status === 'won' ? `你用了 ${game.guesses.length} 次验证。` : '正确答案是：'));
  const answer = el('div', 'answer'); game.secret.forEach(c => answer.append(colorPeg(c, { small: true }))); copy.append(answer); result.append(copy); panel.append(result);
}

function renderPicker(panel) {
  panel.append(el('div', 'section-label choose-label', '当前猜测 · 点击槽位可移除'));
  const slots = el('div', 'slots');
  for (let i = 0; i < 4; i++) {
    if (state.selected[i]) { const peg = colorPeg(state.selected[i], { button: true }); peg.onclick = () => { state.selected.splice(i, 1); render(); }; slots.append(peg); }
    else slots.append(el('span', 'slot', String(i + 1)));
  }
  panel.append(slots); const palette = el('div', 'palette');
  COLORS.forEach(color => {
    const btn = colorPeg(color, { button: true }); btn.disabled = state.selected.includes(color) || state.selected.length === 4;
    btn.onclick = () => { state.selected.push(color); render(); };
    const item = el('div', 'palette-item'); item.append(btn, el('span', '', COLOR_META[color].name)); palette.append(item);
  }); panel.append(palette);
}

function renderActions(panel, game) {
  const actions = el('div', 'actions');
  if (game.status === 'playing') {
    const submit = el('button', 'primary-button', state.selected.length === 4 ? '提交验证 →' : `还需选择 ${4 - state.selected.length} 种颜色`);
    submit.type = 'button'; submit.disabled = state.selected.length !== 4;
    submit.onclick = () => {
      if (!validateCode(state.selected)) return; game.guesses.push([...state.selected]); state.selected = [];
      const latest = evaluate(game.secret, game.guesses.at(-1), 'dots');
      if (latest.green === 4) game.status = 'won'; else if (game.guesses.length >= game.maxAttempts) game.status = 'lost'; save(); render();
    }; actions.append(submit);
  }
  const reset = el('button', 'secondary-button', state.gameType === 'random' ? '重新挑战' : '重玩本关');
  reset.type = 'button'; reset.onclick = restart; actions.append(reset);
  if (state.gameType === 'level') {
    const prev = el('button', 'text-button', '← 上一关'); prev.disabled = state.levelIndex === 0; prev.onclick = () => moveLevel(-1); actions.prepend(prev);
    const next = el('button', 'text-button', '下一关 →'); next.disabled = state.levelIndex === LEVELS.length - 1 || game.status !== 'won'; next.onclick = () => moveLevel(1); actions.append(next);
  } panel.append(actions);
}

function buildLegend(mode) {
  const section = el('section', 'legend'); section.append(el('h2', '', mode === 'line' ? '划线提示说明' : '圆点提示说明'));
  const list = el('div', 'legend-list');
  [['green', '✓', '颜色、位置都正确'], ['white', '↔', '颜色正确，位置错误'], ['black', '×', '密码中没有此颜色']].forEach(([kind, symbol, text]) => {
    const item = el('div', 'legend-item'); item.append(el('span', `legend-mark legend-mark--${kind}`, symbol), el('span', '', text)); list.append(item);
  }); section.append(list); return section;
}
function buildRules() {
  const dialog = el('dialog', 'rules-dialog'); dialog.id = 'rules';
  dialog.innerHTML = '<button class="dialog-close" aria-label="关闭">×</button><p class="eyebrow">HOW TO PLAY</p><h2>如何破解密码</h2><p>密码由四种不重复的颜色组成。每次也要选择四种不同颜色，你最多有七次验证机会。</p><p><strong>初级模式</strong>逐格显示结果；<strong>高级模式</strong>只显示三类结果的总数，不透露对应位置。</p>';
  dialog.querySelector('button').onclick = () => dialog.close(); dialog.onclick = e => { if (e.target === dialog) dialog.close(); }; return dialog;
}
function restart() {
  state.selected = [];
  if (state.gameType === 'random') state.random = freshGame();
  else { const level = currentLevel(); state.levelGames[level.id] = freshGame(level.secret, level.maxAttempts); }
  save(); render();
}
function moveLevel(delta) { state.levelIndex = Math.max(0, Math.min(LEVELS.length - 1, state.levelIndex + delta)); state.selected = []; save(); render(); }

render();
