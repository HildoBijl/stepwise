export interface LatexConvertible {
	readonly tex?: string
	toString(): string
}

export type LatexContent = string | number | LatexConvertible | readonly LatexContent[]

export const latexMinus = '−'
export const zeroWidthSpace = '\u200b'
export const zeroWidthSpaceRegExp = new RegExp(zeroWidthSpace, 'g')

export function prepareLatex(content: LatexContent): string {
	return replaceGroupingParentheses(escapePercentageSigns(contentToLatex(content)))
}

function contentToLatex(content: LatexContent): string {
	if (isLatexContentArray(content)) return content.map(contentToLatex).join('')
	if (typeof content === 'string') return content
	if (typeof content === 'number') return `{${content}}`
	if (!content || typeof content !== 'object') throw new TypeError(`Invalid LaTeX content: received ${String(content)}.`)
	const latex = typeof content.tex === 'string' ? content.tex : content.toString()
	return `{${latex}}`
}

function isLatexContentArray(content: LatexContent): content is readonly LatexContent[] {
	return Array.isArray(content)
}

function escapePercentageSigns(latex: string): string {
	let result = ''
	let precedingBackslashes = 0
	for (const character of latex) {
		if (character === '%' && precedingBackslashes % 2 === 0) result += '\\'
		result += character
		precedingBackslashes = character === '\\' ? precedingBackslashes + 1 : 0
	}
	return result
}

function replaceGroupingParentheses(latex: string): string {
	let result = ''
	let depth = 0
	for (let index = 0; index < latex.length; index++) {
		const character = latex[index]
		const command = character === '(' ? '\\left' : character === ')' ? '\\right' : undefined
		const scalableDelimiter = command !== undefined && latex.slice(Math.max(0, index - command.length), index) === command
		if (scalableDelimiter || (character !== '(' && character !== ')')) {
			result += character
			continue
		}
		if (character === '(') {
			depth++
			result += '{'
		} else {
			if (depth === 0) throw new Error(`LaTeX error: found a closing parenthesis without a corresponding opening parenthesis in "${latex}".`)
			depth--
			result += '}'
		}
	}
	if (depth > 0) throw new Error(`LaTeX error: found an opening parenthesis without a corresponding closing parenthesis in "${latex}".`)
	return result
}
