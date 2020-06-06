import React from 'react'

export default function Problem({ state }) {
	const { a, b } = state
	return `Solve the equation ${a}*x = ${b}.`
}
