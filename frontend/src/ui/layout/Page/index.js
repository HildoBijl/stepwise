import './style.scss'

import React from 'react'
import Header from '../Header'

function Page({ children }) {
	return (
		<div className="page">
			<Header />
			<div className="innerPage">
				{children}
			</div>
		</div>
	)
}

export default Page
