import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { processOptions } from 'step-wise/util/objects'

export const defaultFigureOptions = {
	aspectRatio: 0.75, // Height divided by width. Enter a ratio.
	maxWidth: undefined, // Max width in px. Enter a number. undefined means scale to full width when possible.
	className: '',
	children: null, // What is placed inside the figure.
}

const useStyles = makeStyles((theme) => ({
	figure: {
		boxSizing: 'content-box',
		margin: '1.2rem auto',
		maxWidth: ({ maxWidth }) => maxWidth !== undefined ? `${maxWidth}px` : '',
		padding: '0 1.2rem', // To make sure possible labels outside the SVG aren't cut off by the slider.
		position: 'relative',

		'& .figureInner': {
			boxSizing: 'content-box',
			height: 0,
			paddingBottom: ({ aspectRatio }) => `${aspectRatio * 100}%`,
			position: 'relative',
			width: '100%',
		},
	},
}))

export const Figure = forwardRef((options, ref) => {
	options = processOptions(options, defaultFigureOptions)
	const classes = useStyles({ aspectRatio: options.aspectRatio, maxWidth: options.maxWidth })

	// Define refs and make them accessible to calling elements.
	const figureInner = useRef()
	const figureOuter = useRef()
	useImperativeHandle(ref, () => ({
		get inner() {
			return figureInner.current
		},
		get outer() {
			return figureOuter.current
		},
	}))

	return (
		<div className={clsx('figure', classes.figure, options.className)} ref={figureOuter}>
			<div className="figureInner" ref={figureInner}>
				{options.children}
			</div>
		</div>
	)
})
export default Figure
