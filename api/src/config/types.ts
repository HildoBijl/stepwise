export type ServerConfig = Readonly<{
	sslEnabled: boolean
	sessionSecret: string
	sessionMaxAgeMillis: number
	homepageUrl: string
	apiDomain: string
	corsUrls?: string[]
}>

export type ApiConfig = Readonly<{
	port: number
	isProduction: boolean
	isDevelopment: boolean
	server: ServerConfig
}>
