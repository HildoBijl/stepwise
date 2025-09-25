import React from 'react'
import { NavLink } from 'react-router-dom'
import { ListItemButton, ListItemIcon, ListItemText, alpha } from '@mui/material'

import { useTranslator } from 'i18n'
import { useRoute, useRouteById } from 'ui/routingTools'

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
	return (
		<ListItemButton component={NavLink} to={path}>
			<ListItemIcon sx={theme => ({ color: selected ? alpha(theme.palette.primary.main, 0.8) : undefined })}><Icon /></ListItemIcon>
			<ListItemText primary={translate(text, id)} sx={{ color: selected ? 'primary.main' : undefined }} />
		</ListItemButton>
	)
}
