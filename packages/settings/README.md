# Step-Wise settings

Shared, deployment-time settings used by the Step-Wise API and frontend. These values change infrequently and changes take effect through a new deployment; they are not user preferences or runtime configuration.

## Exports

**Internationalization**

- `languages`: the supported language codes (`en`, `nl`, and `de`).
- `Language`: the TypeScript union derived from `languages`.
- `defaultLanguage`: the first entry in `languages`.
- `i18nLoadPath(language, path)`: builds the public JSON path for a translation resource.
- `i18nUpdatePath`: the development translation-update endpoint.
- `i18nUpdateLogPath`: the public path to the translation update log.

**User settings**

- `currentPrivacyPolicyVersion`: the version users must have accepted.

**Number settings**

- `defaultDecimalSeparator`: the site-wide decimal separator.

## Example

```ts
import { defaultLanguage, i18nLoadPath, languages, type Language } from '@step-wise/settings'

const language: Language = defaultLanguage
const mainTranslations = i18nLoadPath(language, 'main')

console.log(languages) // ['en', 'nl', 'de']
console.log(mainTranslations) // /locales/en/main.json
```

## Behavioral constraints

Supported languages are a compile-time contract: adding a language requires a code change, matching locale files, and a deployment.
