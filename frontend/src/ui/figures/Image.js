import React, { forwardRef } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { processOptions } from 'step-wise/util'

export const defaultImageOptions = {
	src: undefined, // The path to the image.
	alt: 'Unknown image',
	maxWidth: undefined, // Max width in px. Enter a number. undefined means scale to full width when possible.
	maxHeight: undefined,
	className: '',
	style: {},
}

const useStyles = makeStyles((theme) => ({
	image: {
		boxSizing: 'content-box',
		display: 'block',
		margin: '1.2rem auto',
	},
}))

export const Image = forwardRef((options, ref) => {
	let { src, alt, maxWidth, maxHeight, className, style } = processOptions(options, defaultImageOptions)

	style = {
		maxWidth: maxWidth === undefined ? maxWidth : `${maxWidth}px`,
		maxHeight: maxHeight === undefined ? maxHeight : `${maxHeight}px`,
		...options.style,
	}
	const classes = useStyles()
	return <img ref={ref} src={src} alt={alt} className={clsx('image', classes.image, className)} style={style} />
})
