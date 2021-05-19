import React from 'react'
import { render } from '@testing-library/react'

import keyboards, { tabs } from './index'

describe('Check all keyboards:', () => {
	describe('the complete keyboard list', () => {
		it('matches the list of tabs', () => {
			expect(Object.keys(keyboards).sort()).toEqual(tabs.sort())
		})
	})

	Object.keys(keyboards).forEach(tab => {
		describe(tab, () => {
			const keyboard = keyboards[tab]
			it('has a tab export', () => {
				expect(keyboard.tab).toBeTruthy()
			})
			it('has a Buttons export that is a function', () => {
				expect(typeof keyboard.Buttons).toBe('function')
			})
			it('renders properly', () => {
				const Buttons = keyboard.Buttons
				render(<Buttons />)
			})
		})
	})
})