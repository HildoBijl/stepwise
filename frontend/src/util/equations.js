import React from 'react'
import KaTeX from 'katex'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

// Inline math equation.
export function M(props) {
	return <Math displayMode={false} {...props} />
}

// Block math equation.
export function BM(props) {
	return <Math displayMode={true} {...props} />
}

const useStyles = makeStyles((theme) => ({
	equation: {
		fontSize: '0.9em',
	},
}))

function Math({ children, displayMode }) {
	const classes = useStyles()
	const latex = preprocess(children)
	const html = KaTeX.renderToString(latex, { displayMode, throwOnError: true })
	return <span className={clsx(classes.equation, 'equation')} dangerouslySetInnerHTML={{ __html: html }} />
}

function preprocess(latex) {
	if (Array.isArray(latex))
		latex = latex.map(preprocess).join('')
	if (typeof latex !== 'string')
		latex = latex.toString()
	return latex
}