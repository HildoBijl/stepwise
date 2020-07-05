import React from 'react'

export default function Error({ data }) {
	console.log('An error occurred ...')
	console.log(data)
	return <p>Error: something went wrong.</p>
}
// ToDo later: get a fancy error indicator that possibly provides some more useful data.