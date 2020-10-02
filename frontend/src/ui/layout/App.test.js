import React from 'react'
import { render } from '@testing-library/react'
import ApolloClient from 'apollo-boost'

import { App } from './'

describe('The website', () => {
	it('renders the title', () => {
		const { getByText } = render(<App apolloClient={new ApolloClient()} />)
		const linkElement = getByText(/Step-wise/i)
		expect(linkElement).toBeInTheDocument()
	})
})