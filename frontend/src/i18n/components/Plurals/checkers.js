import { Checker } from '../Switch'

export { Checker }

export function One({ children }) {
	return <Checker check={count => count === 1}>{children}</Checker>
}

export function NotOne({ children }) {
	return <Checker check={count => count !== 1}>{children}</Checker>
}

export function Zero({ children }) {
	return <Checker check={count => count === 0}>{children}</Checker>
}

export function Multiple({ children }) {
	return <Checker check={count => count > 1}>{children}</Checker>
}
