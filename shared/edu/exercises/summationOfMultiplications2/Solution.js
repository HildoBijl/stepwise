const React = require('react') // ToDo: figure out how to add JSX.

function Solution({ state }) {
	const { a, b, c } = state
	return `The solution is ${a}*${b} + ${c} = ${a * b + c}.`
}
module.exports = Solution
