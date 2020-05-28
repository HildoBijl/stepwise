import React from 'react'
import { NavLink } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core'

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

export default function MenuLink({ path, text, icon: Icon, exact }) {
	const classes = useStyles()

	return (
		<ListItem button component={NavLink} to={path} exact className={classes.link} activeClassName="selected">
			<ListItemIcon className='listItemIcon'><Icon /></ListItemIcon>
			<ListItemText primary={text} />
		</ListItem>
	)
}
