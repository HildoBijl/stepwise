import '../style.scss'

import React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'

import Routing from './Routing'
import theme from '../theme'
import { UserContext, useUserQuery } from '../user'

export default function App() {
	const result = useUserQuery()

	return (
		<div className='app'>
			<ThemeProvider theme={theme}>
				<UserContext.Provider value={result}>
					<Routing />
				</UserContext.Provider>
			</ThemeProvider>
		</div>
	)
}
