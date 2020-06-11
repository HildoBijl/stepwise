const React = require('react') // ToDo: figure out how to add JSX.

function Problem({ state }) {
	const { a, b, c, d } = state
	return `Calculate ${a}*${b} + ${c}*${d}.`
}
module.exports = Problem
