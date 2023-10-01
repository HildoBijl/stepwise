# Request API

The `request` function exported from this file attempts to access the given URL. Its code is an adaptation/simplification from the `request` function of the [i18next-http-backend](https://github.com/i18next/i18next-http-backend).

Using it is done through the function call

```
request(options, url, payload, callback)
```

If no payload is present, the callback may also be provided as the third parameter.