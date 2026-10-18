# @step-wise/settings

Shared, deployment-time settings used by the Step-Wise API and frontend. These values change infrequently and changes take effect through a new deployment; they are not user preferences or runtime configuration.


## Installation

```bash
npm install @step-wise/settings
```


## Quick start

```ts
import { i18nLoadPath } from '@step-wise/settings'

const mainTranslations = i18nLoadPath('en', 'main')
console.log(mainTranslations) // /locales/en/main.json
```


## Exports

**Internationalization**

- `i18nLoadPath(language, path)`: builds the public JSON path for a translation resource.
- `i18nUpdatePath`: the development translation-update endpoint.
- `i18nUpdateLogPath`: the public path to the translation update log.

**User settings**

- `currentPrivacyPolicyVersion`: the version users must have accepted.

**Number settings**

- `defaultDecimalSeparator`: the site-wide decimal separator.


The internationalization exports support the legacy JSON translation toolbox. Applications own their supported languages; these paths remain here only until that toolbox has been replaced.
