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
- **View latest server logs**: `ssh -t step-wise.com logs`
- **Change configuration**: `ssh -t step-wise.com configure`
- **Perform health check**: `ssh -t step-wise.com health`
- **Issue HTTPS certificates**: `ssh -t step-wise.com issue-certificates`

## Setting up a new server

Operating system: Linux CentOS 8

1. Create new machine (e.g. a DigitalOcean Droplet)
2. Adjust your local SSH config (see above)
3. Run `ssh -t step-wise.com 'bash <(curl -Ls https://raw.githubusercontent.com/HildoBijl/stepwise/master/ops/bootstrap-server.sh)'`
4. Upload configuration (see command above)
5. Setup the DB account for the api (see [here for description](/app/ops/db/setup-api-user.sql))
6. Do a release (see command above)
7. Issue new HTTPS certificates (see command above)

Note: you can only run that bootstrapping procedure one single time for any given server.
