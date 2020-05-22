import './style.scss'

import React from 'react'
import { Link } from 'react-router-dom'

import routes from '../../routes'
import logo from '../../logo.svg'

function Header() {
	return (
		<header className='appHeader'>
			<div className='container'>
				<nav className='navigation'>
					<img src={logo} className='appLogo' alt='logo' />
					<ul>
						<li>
							<Link to={routes.HOME}>Home</Link>
						</li>
						<li>
							<Link to={routes.EXERCISES}>Exercises</Link>
						</li>
					</ul>
				</nav>
			</div>
		</header>
	)
}

export default Header
