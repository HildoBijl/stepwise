import { type CSSProperties, useMemo } from 'react'
import katex from 'katex'

import { type LatexContent, prepareLatex } from './latex.ts'

export interface MathContentProps {
	readonly children: LatexContent
	readonly className?: string
	readonly displayMode?: boolean
	readonly style?: CSSProperties
}

export function MathContent({ children, className, displayMode = false, style }: MathContentProps) {
	const latex = prepareLatex(children)
	const html = useMemo(() => katex.renderToString(latex, { displayMode, throwOnError: true }), [latex, displayMode])
	const equationClassName = className ? `equation ${className}` : 'equation'
	return useMemo(() => <span
		className={equationClassName}
		style={{ ...style, fontSize: displayMode ? '1.1em' : '0.95em' }}
		dangerouslySetInnerHTML={{ __html: html }} />, [html, equationClassName, displayMode, style])
}
