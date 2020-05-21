# Stepwise

## Operating in production

All operational tasks are executed via SSH. Add the following to your SSH config file (`.ssh/config`) in your home directory:

```
Host step-wise.com
	HostName 64.227.70.111
	User root
	IdentityFile ~/.ssh/stepwise
	IdentitiesOnly yes
```

Make sure that `IdentityFile` points to the correct SSH key and `HostName` contains the correct IP address.

### Available tasks

- **Release**: `ssh -t step-wise.com release`
