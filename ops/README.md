# Operating

## Operating in production

(As of: 10/2020)

All operational tasks are executed via SSH. Add the following to your SSH config file (`.ssh/config`) in your home directory:

```
Host step-wise.com
	HostName 64.227.70.111
	User root
	IdentityFile ~/.ssh/stepwise
	IdentitiesOnly yes
```

Make sure that `IdentityFile` points to the correct SSH key and `HostName` contains the correct IP address.


## Documentation

### Application architecture

(As of: 10/2020)

- All services on the server are running in Docker containers.
	- They are in a private network, only the ports of the gateway are exposed to the outside.
	- See the [docker-compose](docker-compose.yml) file for the actual configuration.
	- The lifecycle (e.g. automatic startup) of Docker is controlled via [system.d](app.service).
- All incoming requests go through the [**gateway**](gateway/), which is an nginx server/proxy.
	- Requests to `www.` are served by the nginx directly with the static assets of the frontend.
	- Requests to `api.` are passed through to the api.
	- The gateway is also in charge of terminating TLS/HTTPS. (TLS certificates are generated with “Let’s Encrypt” and automatically renewed every few weeks through the “acme.sh” cron job.)
- The [**api**](../api) depends on:
	- A Redis [cache](sessions/) for storing the user sessions.
	- A Postgres database (which needs to be provided externally).

### Deployment

(As of: 10/2020)

- The build is executed on Github, see [here](../.github) for the configuration.
- New Docker images are automatically uploaded to [Docker Hub](https://hub.docker.com/u/stepwisecom) on every successful build.
- The releases are triggered manually. It fetches the latest images and restarts all Docker containers. (This implies a brief downtime of the app.)


## Bootstrapping a fresh new server

(As of: 10/2020)

Operating system: Linux CentOS 8

1. Create new machine (e.g. a DigitalOcean Droplet)
2. Adjust your local SSH config (see above)
3. Run `ssh -t step-wise.com 'bash <(curl -Ls https://raw.githubusercontent.com/HildoBijl/stepwise/master/ops/bootstrap-server.sh)'`
4. Provide configuration (via command)
5. SSH into the server and configure the DB account for the api (see [here for description](/app/ops/db/setup-api-user.sql))
6. Perform a release (via command)
7. Issue new HTTPS certificates (via command)

Note: you can only run that bootstrapping procedure one single time for any given server.
