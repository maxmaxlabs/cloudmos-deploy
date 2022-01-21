export function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roundDecimal(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function ceilDecimal(value) {
  return Math.ceil((value + Number.EPSILON) * 100) / 100;
}
