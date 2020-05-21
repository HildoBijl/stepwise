# Operating

## Requirements

- Operating system: Linux CentOS 8

## Procedure for setting up a new server

1. Create new machine (e.g. a DigitalOcean Droplet)
2. SSH into the machine as `root` user
3. Transfer the [`bootstrap-server.sh`](bootstrap-server.sh) script somewhere to the server
4. Make the script executable via `chmod +x bootstrap-server.sh`
5. Execute the script via `./bootstrap-server.sh` (which might take a couple of minutes)

The application should now be completely configured, up and running.
