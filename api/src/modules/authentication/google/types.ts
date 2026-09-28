import type { TokenPayload } from 'google-auth-library'

import type { UserModel } from '../../user/models.ts'

export type GoogleCredentialPayload = Readonly<{
	credential: string
	g_csrf_token?: string
	state?: string
}>

export type GoogleIdentity = TokenPayload & {
	nbf?: number
	jti?: string
}

export interface GoogleClient {
	getIdentity(credentials: GoogleCredentialPayload, csrfToken: string | undefined, nonce: string): Promise<GoogleIdentity | null>
}

export type AuthenticatedUserReference = Readonly<{
	id: string
}>

export interface GoogleAuthDatabase {
	User: UserModel
}

export interface GoogleAuthRequest {
	body: GoogleCredentialPayload
	cookies: Record<string, string | undefined>
}
