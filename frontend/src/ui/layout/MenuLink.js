import React from 'react'
import { NavLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import clsx from 'clsx'

import { useTranslator } from 'i18n'
import { useRoute, useRouteById } from 'ui/routingTools'

const useStyles = makeStyles((theme) => ({
	link: {
		color: 'inherit',
		textDecoration: 'none',

		'&.selected': {
			color: theme.palette.primary.main,

			'& .listItemIcon': {
				color: 'inherit',
			},
		},
	},
}))

export default function MenuLink({ id, path, text, icon: Icon }) {
	// Get routes data.
	const linkRoute = useRouteById(id)
	const activeRoute = useRoute()

	// Process data for the link display.
	if (!text)
		text = linkRoute.name
	if (!path)
		path = linkRoute.path
	const selected = activeRoute.path === linkRoute.path

	// Render the link.
	const translate = useTranslator()
	const classes = useStyles()
	return (
		<ListItem button component={NavLink} to={path} className={clsx(classes.link, { selected })}>
			<ListItemIcon className='listItemIcon'><Icon /></ListItemIcon>
			<ListItemText primary={translate(text, id)} />
		</ListItem>
	)
}
