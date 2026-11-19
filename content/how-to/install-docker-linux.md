---
title: "Install Docker on Ubuntu and Debian (Official Method)"
description: "Install Docker Engine and Compose on Ubuntu or Debian from Docker's official repository, run your first container and avoid the firewall gotcha."
h1: "How to Install Docker on Linux (Ubuntu & Debian)"
primary: "docker installation on linux"
cluster: "Server operations"
cxPrompt: "install docker and run nginx in a container"
related: "add-apt-repository, linux-firewall-ufw, systemctl-manage-services, linux-processes"
updated: 2026-11-18
---

Install Docker Engine from Docker's own APT repository on Ubuntu:

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo docker run hello-world
```

On Debian, replace both `linux/ubuntu` paths with `linux/debian`.

<!-- cx -->

## Remove old or conflicting packages first

If Docker was installed before from Ubuntu's or Debian's packages, remove those first so the two don't conflict:

```bash
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt remove -y $pkg; done
```

This leaves images and volumes in `/var/lib/docker/` in place.

## Check it is running and starts at boot

```bash
sudo systemctl enable --now docker
systemctl status docker --no-pager
docker --version
docker compose version
```

## Run Docker without sudo (and what it means)

```bash
sudo usermod -aG docker $USER
newgrp docker
docker run hello-world
```

Members of the `docker` group can start containers that mount any file on the host, which is root access in practice. Add only users you would give `sudo`.

## Run a real container

```bash
docker run -d --name web -p 127.0.0.1:8080:80 --restart unless-stopped nginx
curl -I http://127.0.0.1:8080
docker ps
docker logs web
```

## Docker and your firewall

Ports published with `-p 8080:80` are opened in iptables by Docker itself and are reachable from the internet **even when UFW blocks that port**. To keep a container private:

- publish on localhost only (`-p 127.0.0.1:8080:80`, as above) and expose it through a reverse proxy such as Nginx, or
- add filtering rules to the `DOCKER-USER` chain, which Docker leaves for you.

More in [Linux firewall with UFW](/how-to/linux-firewall-ufw).

## Docker Compose

Compose is installed as a plugin and runs as `docker compose` (with a space). A minimal `compose.yaml` (it uses host port 8081 so it doesn't clash with the `web` container above):

```yaml
services:
  web:
    image: nginx
    ports:
      - "127.0.0.1:8081:80"
    restart: unless-stopped
```

```bash
docker compose up -d
docker compose ps
docker compose logs -f
```

## Ubuntu's own Docker package

Ubuntu also packages Docker as `docker.io` (with `docker-compose-v2`). It's maintained by Ubuntu and updated on Ubuntu's schedule. Docker's repository, above, gets new Docker releases first. Use one or the other, not both.

## Common errors

**"permission denied while trying to connect to the Docker daemon socket".** Your user isn't in the `docker` group, or you haven't started a new session since adding it. Log out and back in, or use `sudo`.

**"Cannot connect to the Docker daemon. Is the docker daemon running?"** Start it: `sudo systemctl start docker`, then check `journalctl -u docker`.

**"docker-compose: command not found".** The old standalone binary isn't installed. Use `docker compose` (the plugin).

**Disk full from images.** `docker system df` shows usage; `docker system prune` removes stopped containers and unused images (add `--volumes` only if you mean to delete unused volumes).

## Frequently asked questions

### Is the convenience script (get.docker.com) OK?

Docker says it's meant for test and development machines, not production. The repository method above gives you normal, upgradeable packages.

### How do I update Docker?

It updates with everything else: `sudo apt update && sudo apt upgrade`. Restarting the daemon briefly stops running containers unless live-restore is enabled.

### Docker or Podman?

Podman runs containers without a daemon and without root by default and uses the same image format. Docker has wider tooling support. Both work on Ubuntu and Debian.
