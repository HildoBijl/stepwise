import type { TokenPayload } from 'google-auth-library'

import type { UserModel } from '../../user/model.ts'

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

export interface GoogleAuthDatabase {
	User: UserModel
}

export interface GoogleAuthRequest {
	body: GoogleAuthData
	cookies: Record<string, string | undefined>
}
