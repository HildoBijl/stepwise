import { type RelativeTimeProps as BaseRelativeTimeProps, RelativeTime as BaseRelativeTime, Translation, withTranslation } from '@step-wise/i18n'

export type RelativeTimeProps = Omit<BaseRelativeTimeProps, 'date'> & {
	date?: Date | string | null
}

// On an unspecified date, show "Never" to indicate this event has not happened yet.
function RelativeTimeBase({ date, ...props }: RelativeTimeProps) {
	if (date === undefined || date === null) return <Translation folder={['language']} catalog="language" group={['time']} id="never">Never</Translation>
	return <BaseRelativeTime date={date} {...props} />
}

// Step-Wise represents an absent date as "Never" while retaining the package formatter for actual dates.
export const RelativeTime = withTranslation(RelativeTimeBase, {
	tag: 'relative-time',
	translatedProps: [],
	canCopy: false,
	canDelete: false,
})
