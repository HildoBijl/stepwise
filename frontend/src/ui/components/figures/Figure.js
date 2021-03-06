// Figure is the placeholder for any type of figure on the website. It deals with the positioning and sizing.

import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { processOptions } from 'step-wise/util/objects'

const defaultOptions = {
	aspectRatio: 0.75, // Height divided by width. Enter a ratio.
	maxWidth: undefined, // Max width in px. Enter a number. undefined means scale to full width when possible.
	className: '',
	children: null, // What is placed inside the figure.
}
export { defaultOptions }

const useStyles = makeStyles((theme) => ({
	figure: {
		margin: '1.6rem auto',
		maxWidth: ({ maxWidth }) => maxWidth !== undefined ? `${maxWidth}px` : '',
		padding: '0 1.2rem', // To make sure possible labels outside the SVG aren't cut off by the slider.
		position: 'relative',
		width: '100%',

		'& .figureInner': {
			boxSizing: 'content-box',
			height: 0,
			paddingBottom: ({ aspectRatio }) => `${aspectRatio * 100}%`,
			position: 'relative',
			width: '100%',
		},
	},
}))

function Figure(options, ref) {
	options = processOptions(options, defaultOptions)
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
}
export default forwardRef(Figure)