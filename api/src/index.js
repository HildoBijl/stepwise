const { server } = require('./server')

server.listen().then(({ port }) => {
	console.log(`Server listening on port ${port}`)
})
