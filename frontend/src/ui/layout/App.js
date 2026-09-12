import React from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { ApolloProvider } from '@apollo/client/react'
import { HelmetProvider } from 'react-helmet-async'

import { useUser, ActiveGroupProvider, SkillLevelProvider } from 'api'
import { I18nProvider, useLanguageSetting } from 'i18n'
import theme from 'ui/theme'

import { PrivacyPolicyWrapper } from './PrivacyPolicy'
import { Routing } from './Routing'

function UserLanguageSynchronizer() {
	const user = useUser()
	useLanguageSetting(user?.language)
	return null
}

export function App({ apolloClient }) {
	return (
		<ApolloProvider client={apolloClient}>
			<HelmetProvider>
				<I18nProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<UserLanguageSynchronizer />
						<div id="app">
							<div id="appInner">
								<PrivacyPolicyWrapper>
									<ActiveGroupProvider>
										<SkillLevelProvider>
											<Routing />
										</SkillLevelProvider>
									</ActiveGroupProvider>
								</PrivacyPolicyWrapper>
							</div>
						</div>
					</ThemeProvider>
				</I18nProvider>
			</HelmetProvider>
		</ApolloProvider>
	)
}
