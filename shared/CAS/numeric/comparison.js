const { epsilon } = require('../options')

// compare is used to compare two numbers for equality, given a defined error margin.
module.exports.compareNumbers = (a, b) => Math.abs(a - b) < epsilon