const { ensureNumber } = require('./numbers')

// interpolate takes an array of inputValues [x1, x2, ..., xn] (must be sorted ascending) and outputValues [f1, f2, ..., fn] and linearly interpolates to find the function value f(x), where x falls between x1 and xn. If x falls outside of the range [x1, xn], f1 or fn is returned. The parameter x may be an array, and then multiple values will be interpolated. The function values f1, ..., fn may also be arrays (assuming they're the same size) in which case their respective values are interpolated.
function interpolate(inputValues, outputValues, x) {
  // If x is an array, iterate over the values.
  if (Array.isArray(x))
    return x.map(xi => interpolate(inputValues, outputValues, xi))

  // Check input.
  x = ensureNumber(x)
  inputValues = inputValues.map(xi => ensureNumber(xi))
  if (!Array.isArray(inputValues))
    throw new Error(`Input error: inputValues must be an array, but it is of type "${inputValues}".`)
  if (!Array.isArray(outputValues))
    throw new Error(`Input error: outputValues must be an array, but it is of type "${outputValues}".`)
  if (inputValues.some((_, i) => i > 0 && inputValues[i] < inputValues[i - 1]))
    throw new Error(`Interpolation error: inputValues must be in ascending order, but they are not.`)
  if (Array.isArray(outputValues[0]) && outputValues.some(fi => !Array.isArray(fi) || fi.length !== outputValues[0].length))
    throw new Error(`Interpolation error: if outputValues contains arrays, these arrays must all be of the same size. This is not the case.`)

  // Check boundary cases.
  if (x <= inputValues[0])
    return outputValues[0]
  if (x >= inputValues[inputValues.length - 1])
    return inputValues[inputValues.length - 1]

  // Find the right index for interpolation.
  const xIndex = inputValues.findIndex((v, i) => i < inputValues.length - 1 && x >= inputValues[i] && x <= inputValues[i + 1])
  const part = (x - inputValues[xIndex]) / (inputValues[xIndex + 1] - inputValues[xIndex])
  if (Array.isArray(outputValues[xIndex]))
    return outputValues[xIndex].map((_, i) => (1 - part) * outputValues[xIndex][i] + part * outputValues[xIndex + 1][i])
  return (1 - part) * outputValues[xIndex] + part * outputValues[xIndex + 1]
}
module.exports.interpolate = interpolate
