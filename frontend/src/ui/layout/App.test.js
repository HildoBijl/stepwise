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
		const { getByText } = render(<App apolloClient={apolloClient} />)
		const linkElement = getByText(/Step-wise/i)
		expect(linkElement).toBeInTheDocument()
	})
})
