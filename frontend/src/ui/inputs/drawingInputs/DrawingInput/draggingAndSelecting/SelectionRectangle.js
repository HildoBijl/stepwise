import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { Rectangle as SvgRectangle } from 'ui/figures'

import { useDrawingInputData } from '../context'

const useStyles = makeStyles((theme) => ({
	selectionRectangle: {
		fill: alpha(theme.palette.primary.main, 0.03),
		stroke: theme.palette.primary.main,
		strokeWidth: 0.5,
		strokeDasharray: '4 2',
		opacity: 0.7,
	},
}))

export default function SelectionRectangle() {
	const { selectionRectangle } = useDrawingInputData()
	const classes = useStyles()

	// If no rectangle has been given, we are obviously not selecting. Don't display anything.
	if (!selectionRectangle)
		return null

	// Render the selection rectangle.
	return <SvgRectangle className={clsx(classes.selectionRectangle, 'selectionRectangle')} dimensions={selectionRectangle} />
}
