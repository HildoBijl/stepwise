const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs/promises')

const { applyMapping, setDeepParameter } = require('step-wise/util')

function createI18nRouter() {
	const i18nRouter = express.Router()
	i18nRouter.use(cors())
	i18nRouter.use(bodyParser.json())
	i18nRouter.use(bodyParser.urlencoded({ extended: true }))

	i18nRouter.post('/add/:lng/:ns', (req, res) => {
		// Extract data from the query.
		const { lng, ns } = req.params
		const newTranslations = req.body
		delete newTranslations._t // Remove the time stamp.

		// Load the corresponding translation file.
		const filePath = `../frontend/public/locales/${lng}/${ns}.json`
		fs.readFile(filePath).then(data => {
			let translation = JSON.parse(data)

			// Walk through all the updated values and save them.
			applyMapping(newTranslations, (str, key) => {
				translation = setDeepParameter(translation, key.split('.'), str)
			})

			// Save the updated file. Afterwards, send a success response.
			console.log(JSON.stringify(translation, null, 2))
			fs.writeFile(filePath, JSON.stringify(translation, null, 2)).then(() => {
				res.sendStatus(200)
			})
		})
	})

	return i18nRouter
}

module.exports = {
	createI18nRouter
}
