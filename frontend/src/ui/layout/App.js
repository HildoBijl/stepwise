import React, { useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { ApolloProvider } from '@apollo/client/react'
import { HelmetProvider } from 'react-helmet-async'

import { LinguiI18nProvider } from '@step-wise/i18n'

import { useUser, ActiveGroupProvider, SkillLevelProvider } from 'api'
import { I18nProvider, useLanguage, useLanguageSetting } from 'i18n'
import { activateLinguiLanguage, linguiI18n, loadLinguiCatalog } from 'i18nNext'
import theme from 'ui/theme'

import { PrivacyPolicyWrapper } from './PrivacyPolicy'
import { Routing } from './Routing'

function UserLanguageSynchronizer() {
	const user = useUser()
	useLanguageSetting(user?.language)
	return null
}

function LinguiLanguageSynchronizer() {
	const language = useLanguage()
	useEffect(() => activateLinguiLanguage(language), [language])
	return null
}

export function App({ apolloClient }) {
	return (
		<ApolloProvider client={apolloClient}>
			<HelmetProvider>
				<I18nProvider>
					<LinguiI18nProvider i18n={linguiI18n} loadCatalog={loadLinguiCatalog}>
						<ThemeProvider theme={theme}>
							<CssBaseline />
							<UserLanguageSynchronizer />
							<LinguiLanguageSynchronizer />
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
					</LinguiI18nProvider>
				</I18nProvider>
			</HelmetProvider>
		</ApolloProvider>
	)
}
