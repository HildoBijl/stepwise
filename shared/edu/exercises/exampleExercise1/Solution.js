import React from 'react'

export default function Solution({ state }) {
	const { a, b } = state
	return `To solve this we divide both sides of the equation ${a}*x = ${b} by ${a}. This results in x = ${b}/${a} = ${b/a}.`
}
