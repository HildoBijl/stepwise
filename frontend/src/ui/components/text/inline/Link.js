import React from 'react'
import { Link as MuiLink } from '@mui/material'

const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export function Link({ children, to, ...props }) {
	// Turn email addresses into an email link.
	if (typeof to === 'string' && to.match(emailRegEx))
		to = `mailto:${to}`

	// Render the link.
	return <MuiLink href={to} {...props}>{children}</MuiLink>
}
