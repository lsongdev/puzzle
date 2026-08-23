export const LEVELS = [
  { id: 1, mode: 'line', secret: ['red', 'yellow', 'green', 'blue'], maxAttempts: 7, hints: [
    { guess: ['red', 'green', 'yellow', 'purple'] },
  ] },
  { id: 2, mode: 'line', secret: ['purple', 'orange', 'blue', 'yellow'], maxAttempts: 7, hints: [
    { guess: ['red', 'orange', 'yellow', 'green'] }, { guess: ['purple', 'blue', 'green', 'yellow'] },
  ] },
  { id: 3, mode: 'dots', secret: ['green', 'red', 'orange', 'purple'], maxAttempts: 7, hints: [
    { guess: ['green', 'yellow', 'blue', 'purple'] }, { guess: ['orange', 'red', 'purple', 'blue'] },
  ] },
  { id: 4, mode: 'dots', secret: ['blue', 'yellow', 'purple', 'red'], maxAttempts: 7, hints: [
    { guess: ['red', 'blue', 'green', 'orange'] }, { guess: ['yellow', 'purple', 'orange', 'red'] }, { guess: ['blue', 'green', 'purple', 'yellow'] },
  ] },
  { id: 5, mode: 'dots', secret: ['orange', 'green', 'red', 'blue'], maxAttempts: 7, hints: [
    { guess: ['red', 'yellow', 'blue', 'purple'] }, { guess: ['orange', 'purple', 'green', 'yellow'] }, { guess: ['blue', 'green', 'orange', 'red'] },
  ] },
];
