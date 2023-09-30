import { usePluralCount } from './provider'

// Checker is a component that verifies if the count from the encompassing Plural component matches a condition (a function). If so, it's displayed. Otherwise it's not. It is implemented by various useful components.
export function Checker({ check, children }) {
	const count = usePluralCount()
	return check(count) ? children : null
}

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
