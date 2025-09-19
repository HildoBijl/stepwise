import React from 'react'
import { Box } from '@mui/material'

export function List({ items, useNumbers, sx, ...props }) {
	// Check the input.
	if (!items || !Array.isArray(items))
		throw new Error(`Invalid list items: expected an array "items" property, but received something of type ${typeof items}.`)

	// Render the component.
	return <Box component={useNumbers ? 'ol' : 'ul'} sx={{
		margin: '0.5rem 0',
		'& > li': { margin: '0.2rem 0 0.2rem -1rem' },
		...sx,
	}} {...props}>
		{items.map((item, index) => <li key={index}>{item}</li>)}
	</Box>
}
List.translatableProps = 'items'
