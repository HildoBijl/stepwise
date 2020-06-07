const React = require('react') // ToDo: figure out how to add JSX.

function Solution({ state }) {
	const { a, b } = state
	return `To solve this we divide both sides of the equation ${a}*x = ${b} by ${a}. This results in x = ${b}/${a} = ${b/a}.`
}
module.exports = Solution
