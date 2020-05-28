import React from 'react'
import { render } from '@testing-library/react'
import { App } from './'

test('renders the title of the web page', () => {
	const { getByText } = render(<App />)
	const linkElement = getByText(/Step-wise/i)
	expect(linkElement).toBeInTheDocument()
})
