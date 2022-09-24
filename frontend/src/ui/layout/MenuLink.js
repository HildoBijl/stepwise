import React from 'react'
import { NavLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import clsx from 'clsx'

import { useRoute } from 'ui/routing'

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

export default function MenuLink({ path, text, icon: Icon }) {
	const classes = useStyles()
	const route = useRoute()
	const selected = path === route.path

	return (
		<ListItem button component={NavLink} to={path} className={clsx(classes.link, { selected })}>
			<ListItemIcon className='listItemIcon'><Icon /></ListItemIcon>
			<ListItemText primary={text} />
		</ListItem>
	)
}
