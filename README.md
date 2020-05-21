# Stepwise

## Server Administration

Add this to your SSH config file (`.ssh/config`) in your home directory:

```
Host step-wise.com
	HostName 64.227.70.111
	User root
	IdentityFile ~/.ssh/stepwise
	IdentitiesOnly yes
```

Make sure that `IdentityFile` points to the correct SSH key and `HostName` contains the correct IP address.
