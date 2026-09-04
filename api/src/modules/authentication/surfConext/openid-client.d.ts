declare module 'openid-client' {
	interface ClientMetadata {
		client_id: string
		client_secret: string
		redirect_uris: string[]
		response_types: string[]
	}

	interface CallbackParameters {
		state: string
		code: string
	}

	interface TokenSet { }

	export class Client {
		constructor(metadata: ClientMetadata)
		authorizationUrl(parameters: { scope: string; state: string; login_hint?: string }): string
		callback(redirectUri: string, parameters: CallbackParameters, checks: { state: string }): Promise<TokenSet>
		userinfo(tokenSet: TokenSet): Promise<{ sub: string;[claim: string]: unknown }>
	}

	export class Issuer {
		static discover(url: string): Promise<Issuer>
		Client: typeof Client
	}
}
