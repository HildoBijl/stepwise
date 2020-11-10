import React from 'react'
import { render } from '@testing-library/react'
import { ApolloClient, InMemoryCache } from '@apollo/client'

import { App } from './'

describe('The website', () => {
	it('renders the title', () => {
		const apolloClient = new ApolloClient({
			uri: 'localhost',
			cache: new InMemoryCache(),
		})
		const { getAllByText } = render(<App apolloClient={apolloClient} />)
		const linkElement = getAllByText(/Step-wise/i)
		expect(linkElement).toBeInTheDocument()
	})
})
