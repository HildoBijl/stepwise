const USERS = {
	'00112233445566778899': {
		iss: 'https://accounts.google.com',
		nbf: 100000000,
		aud: '123456789.apps.googleusercontent.com',
		sub: '00112233445566778899',
		email: 'larry@google.com',
		email_verified: true,
		azp: '123456789.apps.googleusercontent.com',
		name: 'Larry Page',
		picture: 'https://example.org/foo.jpg',
		given_name: 'Larry',
		family_name: 'Page',
		iat: 1,
		exp: 9999999999,
		jti: '6e789262047f8bc71892646bc76e8366c87a'
	},
	'99990000555500001111': {
		iss: 'https://accounts.google.com',
		nbf: 100000000,
		aud: '123456789.apps.googleusercontent.com',
		sub: '99990000555500001111',
		email: 'step@wise.com',
		email_verified: true,
		azp: '123456789.apps.googleusercontent.com',
		name: 'Steppy Wisey',
		picture: 'https://example.org/foo.jpg',
		given_name: 'Steppy',
		family_name: 'Wisey',
		iat: 1,
		exp: 9999999999,
		jti: '6e789262047f8bc71892646bc76e8366c87a'
	}
}

/**
 * The mock client is only used in the tests, because the Google login
 * works normally on localhost.
 */
export class MockClient {
	async getData(authData) {
		// We abuse the `credential` field for passing through the sub parameter.
		return USERS[authData.credential]
	}
}
