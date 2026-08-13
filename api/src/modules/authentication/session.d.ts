import 'express-session'

declare module 'express-session' {
	interface SessionData {
		principal?: { id: string }
		initiated?: Date
		redirect?: string | null
	}
}
