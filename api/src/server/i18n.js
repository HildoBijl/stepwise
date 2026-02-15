const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs/promises')

const { getDeepParameter, setDeepParameter } = require('step-wise/util')
const { i18nLoadPath, i18nUpdateLogPath } = require('@step-wise/settings/i18n')

const pathToPublicFolder = `../frontend/public`
const filePath = (language, path) => `${pathToPublicFolder}${i18nLoadPath(language, path)}`
const logPath = `${pathToPublicFolder}${i18nUpdateLogPath}`

function createI18nRouter() {
	const i18nRouter = express.Router()
	i18nRouter.use(cors())
	i18nRouter.use(bodyParser.json())
	i18nRouter.use(bodyParser.urlencoded({ extended: true }))

	i18nRouter.post('/update', (req, res) => {
		// Extract data from the query.
		const updates = req.body

		// Extract a list of all files that should be updated.
		const files = []
		Object.keys(updates).forEach(language => {
			Object.keys(updates[language]).forEach(path => {
				files.push({ language, path })
			})
		})

		// First load the log-file, to update it where needed.
		fs.readFile(logPath).then(logFile => {
			try {
				logFile = JSON.parse(logFile)
			} catch (error) {
				logFile = {} // Probably someone just completely erased the log contents.
			}

			// Walk through the files, first loading them all and then updating them all.
			const now = new Date()
			Promise.all(files.map(({ language, path }) => fs.readFile(filePath(language, path)))).then(languageFiles => {
				// Walk through the language files and for each one apply the updates.
				return languageFiles.map((languageFile, index) => {
					// Decode the loaded file.
					languageFile = JSON.parse(languageFile)

					// Walk through all updates to apply them.
					const { language, path } = files[index]
					Object.keys(updates[language][path]).forEach(entry => {
						const text = updates[language][path][entry]
						const entrySplit = entry.split('.')
						formerText = getDeepParameter(languageFile, entrySplit)
						languageFile = setDeepParameter(languageFile, entrySplit, text)

						// Also update the log.
						const logEntry = {
							formerText,
							firstUpdate: now,
							...(getDeepParameter(logFile, [language, path, entry]) || {}),
							latestUpdate: now,
							latestText: text,
						}
						logFile = setDeepParameter(logFile, [language, path, entry], logEntry)
					})

					// Save the updated file. Return the resulting promise.
					return fs.writeFile(filePath(language, path), JSON.stringify(languageFile, null, 2).replaceAll('\n', '\r\n'))
				})
			}).then(() => {
				// Also save the new log file.
				fs.writeFile(logPath, JSON.stringify(logFile, null, 2).replaceAll('\n', '\r\n')).then(() => {
					res.sendStatus(200)
				})
			})
		})
	})

	return i18nRouter
}

module.exports = {
	createI18nRouter
}
