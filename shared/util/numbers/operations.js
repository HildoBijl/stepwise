// mod is a modulus function which (unlike its built-in counterpart) is guaranteed to give a number between 0 (inclusive) and n (exclusive).
function mod(a, n) {
  const res = a % n
  return res < 0 ? res + n : res
}
module.exports.mod = mod

// clamp bounds the given number between the minimum (default 0) and maximum (default 1).
function clamp(val, min = 0, max = 1) {
  return Math.max(Math.min(val, max), min)
}
module.exports.clamp = clamp
