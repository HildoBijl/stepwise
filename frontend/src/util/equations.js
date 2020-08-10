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

const latexMinus = '−'
export { latexMinus }

// Accolades are useful as variable because you're not allowed to type them in JSX: they have functionalities.
const la = '{'
const ra = '}'
export { la, ra }

// This is the decimal separator we use site-wide.
const decimalSeparator = ','
export { decimalSeparator }

const useStyles = makeStyles((theme) => ({
	equation: {
		fontSize: ({ displayMode }) => displayMode ? '1em' : '0.9em',
	},
}))

function Math({ children, displayMode }) {
	const classes = useStyles({ displayMode })
	const latex = preprocess(children)
	const html = KaTeX.renderToString(latex, { displayMode, throwOnError: true })
	return <span className={clsx(classes.equation, 'equation')} dangerouslySetInnerHTML={{ __html: html }} />
}

function preprocess(latex) {
	if (Array.isArray(latex))
		latex = latex.map(preprocess).join('')
	if (typeof latex !== 'string')
		latex = latex.toString()
	latex = latex.replace(/\.\d/g, substr => substr.replace('.', decimalSeparator === ',' ? '{,}' : decimalSeparator)) // Replace a period followed by a number by the default decimal separator. If it's a comma, prevent Latex from messing up spacing.
	return latex
}