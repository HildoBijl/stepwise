import KaTeX from 'katex'
import { describe, expect, it } from 'vitest'

import { matchCharElements } from './charElements'

describe('matchCharElements', () => {
	it('creates a separately measurable element for each adjacent character', () => {
		const container = document.createElement('div')
		container.innerHTML = KaTeX.renderToString('23', { displayMode: true })
		const equationElement = container.getElementsByClassName('katex-html')[0]

		const elements = matchCharElements(equationElement, ['2', '3'])

		expect(elements).toHaveLength(2)
		expect(elements[0]).not.toBe(elements[1])
		expect(elements.map(element => element.textContent)).toEqual(['2', '3'])
	})
})
