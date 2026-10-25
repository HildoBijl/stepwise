import { Translation } from '@step-wise/i18n'

export function InputTranslation({ input, group = [], ...props }) {
	return <Translation folder={[]} catalog="inputs" group={[input, ...group]} {...props} />
}
