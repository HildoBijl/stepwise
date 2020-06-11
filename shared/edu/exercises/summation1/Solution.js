const React = require('react') // ToDo: figure out how to add JSX.

function Solution({ state }) {
	const { a, b } = state
	return `The solution is ${a} + ${b} = ${a + b}.`
}
module.exports = Solution
