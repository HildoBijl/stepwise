# Operating

This page gives important info on operating the app.


## Summary: operational tasks

The following commands can be used for basic operational tasks.

- **Release**: `ssh -t step-wise.com release`
- **View latest server logs**: `ssh -t step-wise.com logs`
- **Change configuration**: `ssh -t step-wise.com configure`
- **Perform health check**: `ssh -t step-wise.com health`
- **Issue HTTPS certificates**: `ssh -t step-wise.com issue-certificates`


## Operating in production

(As of: 02/2023)

All operational tasks are executed via SSH. Add the following to your SSH config file (`.ssh/config`) in your home directory:

```
Host step-wise.com
	HostName 142.93.131.46
	User root
	IdentityFile ~/.ssh/stepwise
	IdentitiesOnly yes
```

Make sure that `IdentityFile` points to the correct SSH key file, and `HostName` contains the correct IP address of the server machine.


## Documentation

Below you find more information about how the operational side is set up.


### Application architecture

(As of: 02/2023)

- All services on the server are running in Docker containers.
	- They are in a private network, only the ports of the gateway are exposed to the outside.
	- See the [docker-compose](docker-compose.yml) file for the actual configuration.
	- The lifecycle (e.g. automatic startup) of Docker is controlled via [systemd](app.service).
- All incoming requests go through the [**gateway**](gateway/), which is an nginx server/proxy.
	- Requests to `www.` are served by the nginx directly with the static assets of the frontend.
	- Requests to `api.` are passed through to the api.
	- The gateway is also in charge of terminating TLS/HTTPS. (TLS certificates are generated with “Let’s Encrypt” and automatically renewed every few weeks through the “acme.sh” cron job.)
- The [**api**](../api) depends on:
	- A Redis [cache](sessions/) for storing the user sessions. (Provided locally, via Docker.)
	- A Postgres database (which needs to be provided externally).

### Deployment

(As of: 10/2020)

- The build is executed on Github, see [here](../.github) for the configuration.
- New Docker images are automatically uploaded to [Docker Hub](https://hub.docker.com/u/stepwisecom) on every successful build.
- The releases are triggered manually. It fetches the latest images and restarts all Docker containers. (This implies a brief downtime of the app.)


## Bootstrapping a new server machine

(As of: 02/2023)

Operating system: Linux Debian 11

1. Create new machine (e.g. a DigitalOcean Droplet)
   - Note: make sure that the external firewall is set up correctly, and (only) allows connections on ports 80 and 443.
2. Adjust your local SSH config (see above)
3. If the Postgres DB has IP allow-listing, unblock the machine’s IP address in Postgres (so that it accepts incoming connection from the machine)
4. Execute the bootstrap script via `ssh -t step-wise.com 'bash <(curl -Ls https://raw.githubusercontent.com/HildoBijl/stepwise/master/ops/bootstrap-server.sh)'`
   - Note: you can only run this bootstrapping procedure one single time for any given server.
5. Provide configuration (via command).
   - Note: the command will fail to restart the `app` systemd service, since the app is not set up yet; that’s expected.
6. Perform a release (via command)
7. Issue new HTTPS certificates (via command)
   - Note: if you transfer the app to a new machine, you can take over the certificates from the old server beforehand. You still have to perform this step then, in order to set up the automated renewal bot.


## Bootstrapping a new database

1. Generate a new set of credentials for accessing the DB
2. Configure the DB account so that backend api can access the DB (see [here for description](/app/ops/db/setup-api-user.sql))
3. Run the configuration command and enter the DB credentials
4. Deploy the app, to apply all structural migrations
