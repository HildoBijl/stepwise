import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@material-ui/core/styles'

import { noop } from 'step-wise/util/functions'

import theme from 'ui/theme'

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
			it('has a Layout export that is a function', () => {
				expect(typeof keyboard.Layout).toBe('function')
			})
			it('renders properly', () => {
				const Layout = keyboard.Layout
				render(
					<ThemeProvider theme={theme}>
						<Layout settings={{}} keyFunction={noop} keySettings={{}} />
					</ThemeProvider>
				)
			})
		})
	})
})