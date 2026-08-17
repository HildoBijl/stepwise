import fs from 'node:fs/promises'
import bodyParser from 'body-parser'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { type Language, i18nLoadPath, i18nUpdateLogPath } from '@step-wise/settings'
import { getByPath, setByPath } from '@step-wise/js-utils'

type JsonObject = Record<string, any>
type I18nUpdates = Record<string, Record<string, Record<string, unknown>>>

const pathToPublicFolder = '../frontend/public'
function filePath(language: Language, path: string) {
	return `${pathToPublicFolder}${i18nLoadPath(language, path)}`
}
const logPath = `${pathToPublicFolder}${i18nUpdateLogPath}`

function parseJson(contents: string): JsonObject {
	return JSON.parse(contents) as JsonObject
}
function formatJson(data: JsonObject): string {
	return JSON.stringify(data, null, 2).replace(/\n/g, '\r\n')
}

export function createI18nRouter() {
	const router = express.Router()
	router.use(cors())
	router.use(bodyParser.json())
	router.use(bodyParser.urlencoded({ extended: true }))
	router.post('/update', updateLanguageFiles)
	return router
}

async function updateLanguageFiles(request: Request, response: Response, next: NextFunction): Promise<void> {
	try {
		const updates = request.body as I18nUpdates
		const files = Object.entries(updates).flatMap(([language, paths]) =>
			Object.keys(paths).map(path => ({ language: language as Language, path })))

		let log: JsonObject
		try {
			log = parseJson(await fs.readFile(logPath, 'utf8'))
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw error
			log = {}
		}

		const now = new Date()
		await Promise.all(files.map(async ({ language, path }) => {
			let languageFile = parseJson(await fs.readFile(filePath(language, path), 'utf8'))
			Object.entries(updates[language][path]).forEach(([entry, text]) => {
				const entryPath = entry.split('.')
				const formerText = getByPath(languageFile, entryPath)
				languageFile = setByPath(languageFile, entryPath, text) as JsonObject
				const logEntry = {
					formerText,
					firstUpdate: now,
					...((getByPath(log, [language, path, entry]) || {}) as JsonObject),
					latestUpdate: now,
					latestText: text,
				}
				log = setByPath(log, [language, path, entry], logEntry) as JsonObject
			})
			await fs.writeFile(filePath(language, path), formatJson(languageFile))
		}))
		await fs.writeFile(logPath, formatJson(log))
		response.sendStatus(200)
	} catch (error) {
		next(error)
	}
}
