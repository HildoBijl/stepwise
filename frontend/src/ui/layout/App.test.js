import React from 'react'
import { render } from '@testing-library/react'
import { App } from './'
import ApolloClient from 'apollo-boost'
import { websiteTitle } from '../settings'

test('renders the title of the web page', () => {
	const { getByText } = render(<App apolloClient={new ApolloClient()} />)
	const linkElement = getByText(/Step-wise/i)
	expect(linkElement).toBeInTheDocument()
})
