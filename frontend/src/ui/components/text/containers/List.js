import React, { Children, isValidElement } from 'react'
import { Box } from '@mui/material'

import { withTranslation } from '@step-wise/i18n'

function ListBase({ children, useNumbers = false, sx = {}, ...props }) {
	const items = Children.toArray(children)
	if (items.some(item => !isValidElement(item) || item.type !== ListItem))
		throw new Error('Invalid list contents: every child of List must be a List.Item component.')

	return <Box component={useNumbers ? 'ol' : 'ul'} sx={{
		margin: '0.5rem 0',
		'& > li': { margin: '0.2rem 0 0.2rem -1rem' },
		...sx,
	}} {...props}>
		{items.map(item => <li key={item.key}>{item.props.children}</li>)}
	</Box>
}

function ListItemBase({ children }) {
	return children
}

const ListItem = withTranslation(ListItemBase, { tag: 'item' })
ListItem.tag = 'item' // Support the legacy translation toolbox during the migration.

export const List = Object.assign(withTranslation(ListBase, { tag: 'list' }), {
	Item: ListItem,
	tag: 'list', // Support the legacy translation toolbox during the migration.
})
