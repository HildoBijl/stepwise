import type { TokenPayload } from 'google-auth-library'

export type GoogleAuthData = Readonly<{
	credential: string
	g_csrf_token?: string
}>

export type GoogleIdentity = TokenPayload & {
	nbf?: number
	jti?: string
}

export interface GoogleClient {
	getData(authData: GoogleAuthData, csrfToken?: string): Promise<GoogleIdentity | null>
}

export type AuthenticatedUser = Readonly<{
	id: string
}>

export interface GoogleUserModel {
	findOne(options: { where: { email: string } }): Promise<AuthenticatedUser | null>
	create(values: {
		id?: string
		name?: string
		givenName?: string
		familyName?: string
		email: string
		role?: string
	}): Promise<AuthenticatedUser>
}

export interface GoogleAuthDatabase {
	User: GoogleUserModel
}

export interface GoogleAuthRequest {
	body: GoogleAuthData
	cookies: Record<string, string | undefined>
}
