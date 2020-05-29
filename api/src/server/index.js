const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const session = require('express-session')
const { typeDefs, resolvers } = require('../graphql')

const createServer = ({ database, sessionConfig, surfConext }) => {
	const app = express()

	app.use(session({
		name: 'session.id',
		store: undefined, // TODO use proper session store, like DB/Redis
		secret: sessionConfig.secret,
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			secure: false, // TODO use SSL
			sameSite: true,
			httpOnly: true,
			maxAge: sessionConfig.maxAgeMillis,
		},
		principal: null,
	}))

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
	apollo.applyMiddleware({ app, path: '/graphql' });

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
			res.redirect(sessionConfig.homepageUrl)
		}).catch(error => {
			console.log(error)
			res.send("Error")
		})
	})
	return app
}

module.exports = {
	createServer
}
