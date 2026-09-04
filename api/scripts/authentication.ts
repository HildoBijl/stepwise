import { Google, SurfConext } from '../src/modules/authentication/index.ts'

export function createGoogleClient(): Google.Client {
	return new Google.Client(process.env.GOOGLE_CLIENT_ID as string)
}

export function createSurfConextClient(): SurfConext.Client {
	return new SurfConext.Client(
		process.env.SURFCONEXT_ISSUER_URL as string,
		process.env.SURFCONEXT_REDIRECT_URL as string,
		process.env.SURFCONEXT_CLIENT_ID as string,
		process.env.SURFCONEXT_SECRET as string,
		{
			hu: process.env.SURFCONEXT_HU_IDP as string,
			eduid: process.env.SURFCONEXT_EDUID_IDP as string,
		},
	)
}
