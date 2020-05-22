require('dotenv').config()
const { server } = require('./server')

server.listen({ port: process.env.PORT }).then(({ port }) => {
	console.log(`Server listening on port ${port}`)
})
