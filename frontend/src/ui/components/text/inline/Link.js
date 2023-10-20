import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
	link: {}, // Nothing on top of the already defined a-settings.
}))

const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export function Link({ children, className, style, to }) {
	// Turn email addresses into an email link.
	if (typeof to === 'string' && to.match(emailRegEx))
		to = `mailto:${to}`

	// Render the link.
	const classes = useStyles()
	return <a className={clsx(classes.link, 'paragraph', className)} style={style} href={to}>{children}</a>
}
Link.tag = 'link'
