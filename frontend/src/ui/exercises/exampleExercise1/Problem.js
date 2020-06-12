import React from 'react'

export default function Problem({ state }) {
	const { a, b } = state
	return <span>Solve the equation {a}*x = {b}.</span>
}
