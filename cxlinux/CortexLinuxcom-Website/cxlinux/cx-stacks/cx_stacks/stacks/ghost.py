"""Ghost Stack - Ghost CMS + MySQL + Nginx."""

from pathlib import Path
import secrets

from .base import BaseStack, ServiceInfo, StackConfig


class GhostStack(BaseStack):
    """Ghost CMS + MySQL + Nginx stack."""

    name = "ghost"
    description = "Ghost CMS + MySQL + Nginx"
    version = "5.x"

    packages_debian = [
        "nginx",
        "mysql-server",
        "nodejs",
        "npm",
    ]

    packages_rhel = [
        "nginx",
        "mysql-server",
        "nodejs",
        "npm",
    ]

    services = ["nginx", "mysql", "ghost"]
    default_ports = {"http": 80, "https": 443, "mysql": 3306, "ghost": 2368}

    @property
    def required_services(self) -> list[ServiceInfo]:
        return [
            ServiceInfo(
                name="Nginx",
                package="nginx",
                service_name="nginx",
                port=80,
                config_paths=[Path("/etc/nginx/sites-available")],
            ),
            ServiceInfo(
                name="MySQL",
                package="mysql-server",
                service_name="mysql",
                port=3306,
                config_paths=[Path("/etc/mysql/mysql.conf.d")],
            ),
            ServiceInfo(
                name="Ghost",
                package="ghost-cli",
                service_name="ghost",
                port=2368,
                config_paths=[],
            ),
        ]

    def get_packages(self, distro_family: str) -> list[str]:
        if distro_family == "debian":
            return self.packages_debian
        elif distro_family == "rhel":
            return self.packages_rhel
        return self.packages_debian

    def configure(self) -> list[tuple[Path, str]]:
        configs: list[tuple[Path, str]] = []
        domain = self.config.domain or "localhost"
        web_root = self.get_web_root()

        # Nginx reverse proxy for Ghost
        nginx_content = f"""server {{
    listen 80;
    listen [::]:80;
    server_name {domain};

    client_max_body_size 50M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/{domain}_access.log;
    error_log /var/log/nginx/{domain}_error.log;

    location / {{
        proxy_pass http://127.0.0.1:2368;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_read_timeout 90s;
    }}

    # Cache static assets
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|woff2?|ttf|svg|webp)$ {{
        proxy_pass http://127.0.0.1:2368;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }}

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}}
"""
        configs.append(
            (Path(f"/etc/nginx/sites-available/{domain}"), nginx_content)
        )

        # Ghost config.production.json
        db_password = self.config.db_password or secrets.token_urlsafe(16)
        ghost_config = f"""{{
    "url": "http://{domain}",
    "server": {{
        "port": 2368,
        "host": "127.0.0.1"
    }},
    "database": {{
        "client": "mysql",
        "connection": {{
            "host": "localhost",
            "user": "{self.config.db_user}",
            "password": "{db_password}",
            "database": "{self.config.db_name}"
        }}
    }},
    "mail": {{
        "transport": "Direct"
    }},
    "logging": {{
        "transports": ["file", "stdout"]
    }},
    "process": "systemd",
    "paths": {{
        "contentPath": "{web_root}/content"
    }}
}}
"""
        configs.append((web_root / "config.production.json", ghost_config))

        # Ghost systemd service
        ghost_service = f"""[Unit]
Description=Ghost CMS for {domain}
Documentation=https://ghost.org/docs
After=network.target mysql.service

[Service]
Type=simple
WorkingDirectory={web_root}
User=ghost
Group=ghost
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node {web_root}/current/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ghost-{domain}

[Install]
WantedBy=multi-user.target
"""
        configs.append(
            (Path(f"/etc/systemd/system/ghost-{domain}.service"), ghost_service)
        )

        return configs

    def post_install(self) -> list[str]:
        domain = self.config.domain or "localhost"
        web_root = self.get_web_root()
        db_password = self.config.db_password or secrets.token_urlsafe(16)

        commands = [
            # Create ghost user
            "id ghost &>/dev/null || useradd -r -s /bin/false ghost",
            f"mkdir -p {web_root}",
            # Install ghost-cli
            "npm install -g ghost-cli",
            # Database setup
            f"mysql -e \"CREATE DATABASE IF NOT EXISTS {self.config.db_name};\"",
            f"mysql -e \"CREATE USER IF NOT EXISTS '{self.config.db_user}'@'localhost' IDENTIFIED BY '{db_password}';\"",
            f"mysql -e \"GRANT ALL PRIVILEGES ON {self.config.db_name}.* TO '{self.config.db_user}'@'localhost';\"",
            "mysql -e \"FLUSH PRIVILEGES;\"",
            # Ghost installation
            f"chown -R ghost:ghost {web_root}",
            f"cd {web_root} && sudo -u ghost ghost install --no-prompt --no-start --db mysql --dbhost localhost --dbuser {self.config.db_user} --dbpass {db_password} --dbname {self.config.db_name} --url http://{domain} --process systemd --no-setup-nginx --no-setup-ssl",
            # Nginx setup
            f"ln -sf /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/",
            "rm -f /etc/nginx/sites-enabled/default",
            "nginx -t",
            "systemctl restart nginx",
            # Start Ghost
            "systemctl daemon-reload",
            f"systemctl enable ghost-{domain}",
            f"systemctl start ghost-{domain}",
        ]
        return commands

    def validate(self) -> tuple[bool, list[str]]:
        from ..utils import service_is_running, port_in_use

        issues: list[str] = []
        domain = self.config.domain or "localhost"

        if not service_is_running("nginx"):
            issues.append("Nginx is not running")
        if not service_is_running("mysql"):
            issues.append("MySQL is not running")
        if not service_is_running(f"ghost-{domain}"):
            issues.append("Ghost is not running")
        if not port_in_use(80):
            issues.append("Port 80 is not listening")
        if not port_in_use(2368):
            issues.append("Ghost port 2368 is not listening")

        return len(issues) == 0, issues

    def get_log_paths(self) -> list[Path]:
        domain = self.config.domain or "localhost"
        web_root = self.get_web_root()
        return [
            Path(f"/var/log/nginx/{domain}_error.log"),
            Path(f"/var/log/nginx/{domain}_access.log"),
            web_root / "content" / "logs" / "ghost.log",
            Path("/var/log/mysql/error.log"),
        ]

    def get_docker_services(self) -> dict:
        return {
            "ghost": {
                "image": "ghost:5-alpine",
                "ports": ["2368:2368"],
                "environment": {
                    "url": "http://${DOMAIN}",
                    "database__client": "mysql",
                    "database__connection__host": "db",
                    "database__connection__user": "${DB_USER}",
                    "database__connection__password": "${DB_PASSWORD}",
                    "database__connection__database": "${DB_NAME}",
                },
                "volumes": ["ghost_content:/var/lib/ghost/content"],
                "depends_on": ["db"],
            },
            "db": {
                "image": "mysql:8.0",
                "volumes": ["db_data:/var/lib/mysql"],
                "environment": {
                    "MYSQL_ROOT_PASSWORD": "${DB_ROOT_PASSWORD}",
                    "MYSQL_DATABASE": "${DB_NAME}",
                    "MYSQL_USER": "${DB_USER}",
                    "MYSQL_PASSWORD": "${DB_PASSWORD}",
                },
            },
            "nginx": {
                "image": "nginx:alpine",
                "ports": ["80:80", "443:443"],
                "volumes": ["./nginx.conf:/etc/nginx/conf.d/default.conf"],
                "depends_on": ["ghost"],
            },
        }

    def get_docker_volumes(self) -> dict:
        return {"ghost_content": {}, "db_data": {}}
