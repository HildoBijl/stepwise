const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs/promises')

const { setDeepParameter } = require('step-wise/util')

function createI18nRouter() {
	const i18nRouter = express.Router()
	i18nRouter.use(cors())
	i18nRouter.use(bodyParser.json())
	i18nRouter.use(bodyParser.urlencoded({ extended: true }))

	i18nRouter.post('/update', (req, res) => {
		// Extract data from the query.
		const updates = req.body

		// Walk through the updates and group them by language and path.
		const groupedUpdates = {}
		updates.forEach(({ language, path, entry, translation }) => {
			if (!groupedUpdates[language])
				groupedUpdates[language] = {}
			if (!groupedUpdates[language][path])
				groupedUpdates[language][path] = []
			groupedUpdates[language][path].push({ entry, translation })
		})

		// Extract a list of all files that should be updated.
		const files = []
		Object.keys(groupedUpdates).forEach(language => {
			Object.keys(groupedUpdates[language]).forEach(path => {
				files.push({ language, path })
			})
		})

		// Walk through the files, first loading them all and then updating them all.
		Promise.all(files.map(({ language, path }) => {
			const filePath = `../frontend/public/locales/${language}/${path}.json`
			return fs.readFile(filePath)
		})).then(languageFiles => {
			// Walk through the language files and for each one apply the updates.
			languageFiles.forEach((languageFile, index) => {
				// Decode the loaded file.
				languageFile = JSON.parse(languageFile)

				// Walk through all updates to apply them.
				const { language, path } = files[index]
				groupedUpdates[language][path].forEach(({ entry, translation }) => {
					languageFile = setDeepParameter(languageFile, entry.split('.'), translation)
				})

				// Save the updated file. Return the resulting promise.
				const filePath = `../frontend/public/locales/${language}/${path}.json`
				return fs.writeFile(filePath, JSON.stringify(languageFile, null, 2))
			})
		}).then(() => {
			res.sendStatus(200)
		})

		// ToDo: set up a change log. Note which entries have been changed, from what, to what, and when.
	})

	return i18nRouter
}

module.exports = {
	createI18nRouter
}
