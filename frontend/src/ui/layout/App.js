import React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/client'

import { useResizeObserver, useEventListener } from 'util/react'
import { UserProvider } from 'api/user'
import { ActiveGroupProvider } from 'api/group'
import { SkillCacher } from 'api/skill'
import theme from 'ui/theme'

import Routing from './Routing'

const withApolloProvider = WrappedComponent => props => (
	<ApolloProvider client={props.apolloClient}>
		<WrappedComponent {...props} />
	</ApolloProvider>
)

function App() {
	return (
		<div id="app">
			<div id="appInner">
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<UserProvider>
						<ActiveGroupProvider>
							<SkillCacher>
								<Routing />
							</SkillCacher>
						</ActiveGroupProvider>
					</UserProvider>
				</ThemeProvider>
			</div>
		</div>
	)
}

export default withApolloProvider(App)

// useResizeListener checks when the window or the app field resizes and calls the given callback function then.
export function useResizeListener(callbackFunc) {
	const appInner = document.querySelector('#appInner')
	useResizeObserver(appInner, () => callbackFunc())
	useEventListener('resize', () => callbackFunc())
}
