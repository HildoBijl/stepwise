import { Google, SurfConext } from '../src/modules/authentication/index.js'

export function createGoogleClient(): Google.Client {
	return new Google.Client(process.env.GOOGLE_CLIENT_ID as string)
}

export function createSurfConext(): SurfConext.Client {
	return new SurfConext.Client(
		process.env.SURFCONEXT_ISSUER_URL as string,
		process.env.SURFCONEXT_REDIRECT_URL as string,
		process.env.SURFCONEXT_CLIENT_ID as string,
		process.env.SURFCONEXT_SECRET as string,
	)
}
