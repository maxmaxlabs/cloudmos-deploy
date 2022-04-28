export function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roundDecimal(value, precision = 2) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

export function ceilDecimal(value) {
  return Math.ceil((value + Number.EPSILON) * 100) / 100;
}
