// @vitest-environment jsdom

import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import './testSetup.ts'
import { ensureReactContent, Portal } from './content.ts'

describe('ensureReactContent', () => {
	it('accepts supported React content', () => {
		const element = createElement('span')
		expect(ensureReactContent(element)).toBe(element)
		expect(ensureReactContent('text')).toBe('text')
		expect(ensureReactContent(3)).toBe(3)
	})

	it('rejects invalid or disabled content', () => {
		expect(() => ensureReactContent([])).toThrow(TypeError)
		expect(() => ensureReactContent('text', { allowString: false })).toThrow('expected a React element or a number')
		expect(() => ensureReactContent(3, { allowNumber: false })).toThrow('expected a React element or a string')
	})
})

describe('Portal', () => {
	it('renders into its target', () => {
		const target = document.createElement('div')
		document.body.append(target)
		render(<Portal target={target}>Portal content</Portal>)
		expect(screen.getByText('Portal content')).toBe(target)
	})

	it('renders nothing without a target', () => {
		const target = document.createElement('div')
		document.body.append(target)
		render(<Portal target={undefined}>Portal content</Portal>)
		expect(screen.queryByText('Portal content')).toBeNull()
	})
})
