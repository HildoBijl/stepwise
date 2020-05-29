const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const session = require('express-session')
const { typeDefs, resolvers } = require('../graphql')
const cors = require('cors')

const createServer = ({ config, database, surfConext }) => {
	const app = express()

	app.use(session({
		name: 'session.id',
		store: undefined, // TODO use proper session store, like DB/Redis
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			secure: false, // TODO use SSL
			sameSite: 'None', // TODO configure properly
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
			getSessionId: () => req.session.id,
			getPrincipal: () => req.session.principal,
		}),
		playground: {
			settings: {
				'request.credentials': 'same-origin'
			}
		}
	})
	apollo.applyMiddleware({ app, cors: corsOptions, path: '/graphql' });

	app.get('/auth/_devlogin', (req, res) => {
		req.session.initiated = new Date()
		req.session.principal = {
			name: req.query.name,
			email: req.query.email,
		}
		res.redirect(config.homepageUrl)
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
			// TODO look up user etc.
			req.session.principal = {
				name: userInfo.name,
				email: userInfo.email,
			}
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
