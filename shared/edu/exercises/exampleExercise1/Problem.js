const React = require('react') // ToDo: figure out how to add JSX.

function Problem({ state }) {
	const { a, b } = state
	return `Solve the equation ${a}*x = ${b}.`
}
module.exports = Problem
