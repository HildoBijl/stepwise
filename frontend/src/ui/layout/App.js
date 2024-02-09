import React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/client'

import { UserWrapper } from 'api/user'
import { ActiveGroupProvider } from 'api/group'
import { SkillCacher } from 'api/skill'
import { I18nProvider } from 'i18n'
import theme from 'ui/theme'

import { Routing } from './Routing'

const withApolloProvider = WrappedComponent => props => (
	<ApolloProvider client={props.apolloClient}>
		<WrappedComponent {...props} />
	</ApolloProvider>
)

function AppWithoutProvider() {
	return (
		<div id="app">
			<div id="appInner">
				<I18nProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<UserWrapper>
							<ActiveGroupProvider>
								<SkillCacher>
									<Routing />
								</SkillCacher>
							</ActiveGroupProvider>
						</UserWrapper>
					</ThemeProvider>
				</I18nProvider>
			</div>
		</div>
	)
}

const App = withApolloProvider(AppWithoutProvider)
export { App }
