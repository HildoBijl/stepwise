const React = require('react') // ToDo: figure out how to add JSX.

function Solution({ state }) {
	const { a, b, c, d } = state
	return `The solution is ${a}*${b} + ${c}*${d} = ${a * b + c * d}.`
}
module.exports = Solution
