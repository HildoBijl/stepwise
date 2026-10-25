# @step-wise/settings

Shared, deployment-time settings used by the Step-Wise API and frontend. These values change infrequently and changes take effect through a new deployment; they are not user preferences or runtime configuration.


## Installation

```bash
npm install @step-wise/settings
```


## Quick start

```ts
import { defaultDecimalSeparator } from '@step-wise/settings'

console.log(defaultDecimalSeparator)
```


## Exports

**User settings**

- `currentPrivacyPolicyVersion`: the version users must have accepted.

**Number settings**

- `defaultDecimalSeparator`: the site-wide decimal separator.
