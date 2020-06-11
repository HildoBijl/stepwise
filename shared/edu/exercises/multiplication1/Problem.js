const React = require('react') // ToDo: figure out how to add JSX.

function Problem({ state }) {
	const { a, b } = state
	return `Calculate the product ${a}*${b}.`
}
module.exports = Problem
