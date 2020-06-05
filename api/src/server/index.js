const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const session = require('express-session')
const { typeDefs, resolvers } = require('../graphql')
const cors = require('cors')
const RedisStore = require('connect-redis')(session)
const Joi = require('@hapi/joi')

const configValidationSchema = Joi.object({
	sslEnabled: Joi.boolean().required(),
	sessionSecret: Joi.string().min(20).required(),
	sessionMaxAgeMillis: Joi.number().required(),
	homepageUrl: Joi.string().uri(),
	corsUrls: Joi.array().items(Joi.string().uri()),
})

const createServer = ({ config, database, redis, surfConext }) => {
	const configValidationError = configValidationSchema.validate(config).error
	if (configValidationError) {
		throw configValidationError
	}

	const app = express()

	app.use(session({
		name: 'session.id',
		store: redis ? new RedisStore({ client: redis }) : undefined,
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			secure: config.sslEnabled,
			sameSite: 'Lax',
			httpOnly: true,
			maxAge: config.sessionMaxAgeMillis,
		},
		principal: null,
	}))

	const corsOptions = {
		origin: config.corsUrls,
		credentials: true,
	}
	app.use(cors(corsOptions))

	const apollo = new ApolloServer({
		typeDefs,
		resolvers,
		dataSources: () => ({
			database,
		}),
		context: ({ req }) => ({
			getPrincipal: () => Object.freeze(req.session.principal),
		}),
		playground: {
			settings: {
				'request.credentials': 'same-origin'
			}
		}
	})
	apollo.applyMiddleware({ app, cors: corsOptions, path: '/graphql' });

	app.get('/auth/_devlogin', async (req, res) => {
		req.session.initiated = new Date()
		const [user] = await database.User.findOrCreate({
			where: {
				email: req.query.email,
			},
			defaults: {
				name: req.query.name,
				email: req.query.email,
			},
		})
		// TODO update user info?
		req.session.principal = {
			id: user.id,
		}
		res.redirect(config.homepageUrl)
	})
	app.get('/auth/logout', (req, res) => {
		req.session.destroy(() => {
			res.redirect(config.homepageUrl)
		})
	})
	app.get('/auth/surfconext/start', (req, res) => {
		req.session.initiated = new Date()
		surfConext.authorizationUrl(req.session.id).then(url =>
			res.redirect(url)
		).catch(error => {
			console.log(error)
			res.send("Error")
		})
	})
	app.get('/auth/surfconext/callback', (req, res) => {
		surfConext.userinfo(
			req.query.code,
			req.query.state,
			req.session.id,
		).then(userInfo => {
			// TODO look up user and set principal accordingly
			// req.session.principal = ...
			res.redirect(config.homepageUrl)
		}).catch(error => {
			console.log(error)
			res.redirect(config.homepageUrl)
		})
	})

	app.set('trust proxy', true)
	return app
}

module.exports = {
	createServer
}
