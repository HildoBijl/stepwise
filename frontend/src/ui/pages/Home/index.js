import './style.scss'

import React from 'react'
import { Link } from 'react-router-dom'

import routes from '../../routes'

export default function Home() {
	return (
		<div className='home'>
			<div className='main'>
				<h1 className='name'>Step-wise</h1>
				<h2 className='motto'>Your own private tutor</h2>
				<div className='mainContainer'>
					<div className='logoContainer'>
						<div className='logo'><div className='logoContents'>Temporary Logo</div></div>
					</div>
					<div className='logInContainer'>
						<div className='logInInnerContainer'>
							<p>Log in with SURFconext</p>
							<p>Log in with Google</p>
							<p>Practice without logging in</p>
						</div>
					</div>
				</div>
			</div>
			<div className='linkBar'>
				<ul>
					<li>
						<Link to={routes.EXERCISES}>Exercises</Link>
					</li>
					<li>
						<Link to={routes.FEEDBACK}>Feedback</Link>
					</li>
					<li>
						<Link to={routes.ABOUT}>About</Link>
					</li>
				</ul>
			</div>
		</div>
	)
}
