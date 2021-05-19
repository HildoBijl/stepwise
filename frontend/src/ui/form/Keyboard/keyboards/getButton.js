import React from 'react'

// getButton takes a key and returns the corresponding SVG icon resembling the button.
export default function getButton(key) {
	return (
		<svg viewBox="0 0 100 100">
			<text textAnchor="middle" x="50" y="70" fontSize="60">{key[0]}</text>
		</svg>
	)
}

// ToDo: add a whole lot of keys for various keyboards. Put them in their own folder or so.