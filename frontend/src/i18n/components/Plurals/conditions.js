import { Condition } from '../Check'

export { Condition }

export function One({ children }) {
	return <Condition check={count => count === 1}>{children}</Condition>
}

export function NotOne({ children }) {
	return <Condition check={count => count !== 1}>{children}</Condition>
}

export function Zero({ children }) {
	return <Condition check={count => count === 0}>{children}</Condition>
}

export function Multiple({ children }) {
	return <Condition check={count => count > 1}>{children}</Condition>
}
