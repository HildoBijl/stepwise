import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function QuickPractice(props) {
	return (
		<SvgIcon {...props}>
			<path d="M5 17.25v3.75h3.75l11 -11l-3.75-3.75z" />{/* Main pencil shaft. */}
			<path d="M22.75 7c.4-.4.4-1 0-1.4l-2.35-2.35c-.4-.4-1-.4-1.4 0l-2 2 3.75 3.75 2-2z" />{/* Cap. */}
			<line x1="9" x2="15" y1="4" y2="4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
			<line x1="4" x2="12" y1="7" y2="7" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
			<line x1="5" x2="9" y1="10" y2="10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
			<line x1="1" x2="6" y1="13" y2="13" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
		</SvgIcon>
	)
}