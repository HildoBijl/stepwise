import React from 'react'
import { render } from '@testing-library/react'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

import { App } from './'

describe('The website', () => {
	it('renders the title', () => {
		const apolloClient = new ApolloClient({
			link: new HttpLink({ uri: 'http://localhost' }),
			cache: new InMemoryCache(),
		})
		const { getAllByText } = render(<App apolloClient={apolloClient} />)
		const linkElements = getAllByText(/Step-Wise/i)
		expect(linkElements.length).toBeGreaterThanOrEqual(1)
		expect(linkElements[0]).toBeInTheDocument()
	})
})
