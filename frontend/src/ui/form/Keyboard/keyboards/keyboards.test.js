import React from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@material-ui/core/styles'

import { noop } from 'step-wise/util'

import theme from 'ui/theme'

import { keyboards, tabs } from './index'

describe('Check all keyboards:', () => {
	test('dummy test', () => {
		console.log('Dummy test keyboards executed')
	})
	// describe('the complete keyboard list', () => {
	// 	it('matches the list of tabs', () => {
	// 		expect(Object.keys(keyboards).sort()).toEqual(tabs.sort())
	// 	})
	// })

	// Object.keys(keyboards).forEach(tab => {
	// 	describe(tab, () => {
	// 		const keyboard = keyboards[tab]
	// 		it('has a tab export that is a function', () => {
	// 			expect(typeof keyboard.Tab).toBe('function')
	// 		})
	// 		it('has a Layout export that is a function', () => {
	// 			expect(typeof keyboard.Layout).toBe('function')
	// 		})
	// 		it('renders properly', () => {
	// 			const Layout = keyboard.Layout
	// 			render(
	// 				<ThemeProvider theme={theme}>
	// 					<Layout settings={{}} keyFunction={noop} keySettings={{}} />
	// 				</ThemeProvider>
	// 			)
	// 		})
	// 	})
	// })
})
