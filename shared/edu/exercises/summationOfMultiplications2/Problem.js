const React = require('react') // ToDo: figure out how to add JSX.

function Problem({ state }) {
	const { a, b, c } = state
	return `Calculate ${a}*${b} + ${c}.`
}
module.exports = Problem
