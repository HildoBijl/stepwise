import { Condition } from '../Check'

export { Condition }

export function One({ children }) {
	return <Condition check={count => count === 1}>{children}</Condition>
}
One.tag = 'one'

export function NotOne({ children }) {
	return <Condition check={count => count !== 1}>{children}</Condition>
}
NotOne.tag = 'not-one'

export function Zero({ children }) {
	return <Condition check={count => count === 0}>{children}</Condition>
}
Zero.tag = 'zero'

export function Multiple({ children }) {
	return <Condition check={count => count > 1}>{children}</Condition>
}
Multiple.tag = 'multiple'
