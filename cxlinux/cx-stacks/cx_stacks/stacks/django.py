"""Django Stack - Django + PostgreSQL + Nginx + Gunicorn."""

from pathlib import Path

from .base import BaseStack, ServiceInfo, StackConfig


class DjangoStack(BaseStack):
    """Django + PostgreSQL + Nginx + Gunicorn stack."""

    name = "django"
    description = "Django 5 + PostgreSQL 16 + Nginx + Gunicorn"
    version = "5.0"

    packages_debian = [
        "nginx",
        "python3",
        "python3-pip",
        "python3-venv",
        "postgresql",
        "postgresql-contrib",
        "libpq-dev",
    ]

    packages_rhel = [
        "nginx",
        "python3",
        "python3-pip",
        "postgresql-server",
        "postgresql-contrib",
        "postgresql-devel",
    ]

    services = ["nginx", "postgresql", "gunicorn"]
    default_ports = {"http": 80, "https": 443, "postgres": 5432, "app": 8000}

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
                name="PostgreSQL",
                package="postgresql",
                service_name="postgresql",
                port=5432,
                config_paths=[Path("/etc/postgresql")],
            ),
            ServiceInfo(
                name="Gunicorn",
                package="gunicorn",
                service_name="gunicorn",
                port=8000,
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
        app_path = self.config.app_path or self.get_web_root()
        project_name = self.config.extra.get("project", "mysite")
        workers = self.config.extra.get("workers", 4)

        # Nginx reverse proxy
        nginx_content = f"""upstream django {{
    server unix:/run/gunicorn/{domain}.sock fail_timeout=0;
}}

server {{
    listen 80;
    listen [::]:80;
    server_name {domain};

    client_max_body_size 64M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/{domain}_access.log;
    error_log /var/log/nginx/{domain}_error.log;

    location / {{
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }}

    location /static/ {{
        alias {app_path}/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }}

    location /media/ {{
        alias {app_path}/media/;
        expires 30d;
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

        # Gunicorn systemd service
        gunicorn_service = f"""[Unit]
Description=Gunicorn daemon for Django {domain}
Requires=gunicorn-{domain}.socket
After=network.target postgresql.service

[Service]
Type=notify
User=www-data
Group=www-data
RuntimeDirectory=gunicorn
WorkingDirectory={app_path}
Environment="DJANGO_SETTINGS_MODULE={project_name}.settings"
ExecStart={app_path}/venv/bin/gunicorn \\
    --workers {workers} \\
    --bind unix:/run/gunicorn/{domain}.sock \\
    --access-logfile /var/log/gunicorn/{domain}_access.log \\
    --error-logfile /var/log/gunicorn/{domain}_error.log \\
    {project_name}.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
"""
        configs.append(
            (Path(f"/etc/systemd/system/gunicorn-{domain}.service"), gunicorn_service)
        )

        # Gunicorn socket
        gunicorn_socket = f"""[Unit]
Description=Gunicorn socket for Django {domain}

[Socket]
ListenStream=/run/gunicorn/{domain}.sock
SocketUser=www-data

[Install]
WantedBy=sockets.target
"""
        configs.append(
            (Path(f"/etc/systemd/system/gunicorn-{domain}.socket"), gunicorn_socket)
        )

        # Django environment file
        env_content = f"""DEBUG=False
SECRET_KEY=change-me-in-production-{domain}
DATABASE_URL=postgres://{self.config.db_user}:{self.config.db_password or 'password'}@localhost:5432/{self.config.db_name}
ALLOWED_HOSTS={domain},localhost,127.0.0.1
STATIC_ROOT={app_path}/staticfiles
MEDIA_ROOT={app_path}/media
"""
        configs.append((app_path / ".env", env_content))

        # Requirements file
        requirements = """django>=5.0.0
gunicorn>=21.0.0
psycopg2-binary>=2.9.0
python-dotenv>=1.0.0
whitenoise>=6.6.0
"""
        configs.append((app_path / "requirements.txt", requirements))

        return configs

    def post_install(self) -> list[str]:
        domain = self.config.domain or "localhost"
        app_path = self.config.app_path or self.get_web_root()
        project_name = self.config.extra.get("project", "mysite")
        db_password = self.config.db_password or "password"

        commands = [
            f"mkdir -p {app_path}",
            f"python3 -m venv {app_path}/venv",
            f"{app_path}/venv/bin/pip install --upgrade pip",
            f"{app_path}/venv/bin/pip install -r {app_path}/requirements.txt",
            # Create Django project if it doesn't exist
            f"test -d {app_path}/{project_name} || {app_path}/venv/bin/django-admin startproject {project_name} {app_path}",
            # Database setup
            f"sudo -u postgres psql -c \"CREATE USER {self.config.db_user} WITH PASSWORD '{db_password}';\" || true",
            f"sudo -u postgres psql -c \"CREATE DATABASE {self.config.db_name} OWNER {self.config.db_user};\" || true",
            f"sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE {self.config.db_name} TO {self.config.db_user};\"",
            # Django setup
            f"cd {app_path} && {app_path}/venv/bin/python manage.py migrate",
            f"cd {app_path} && {app_path}/venv/bin/python manage.py collectstatic --noinput",
            # Permissions
            f"chown -R www-data:www-data {app_path}",
            "mkdir -p /var/log/gunicorn",
            "chown www-data:www-data /var/log/gunicorn",
            "mkdir -p /run/gunicorn",
            "chown www-data:www-data /run/gunicorn",
            # Services
            f"ln -sf /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/",
            "rm -f /etc/nginx/sites-enabled/default",
            "nginx -t",
            "systemctl daemon-reload",
            f"systemctl enable gunicorn-{domain}.socket",
            f"systemctl start gunicorn-{domain}.socket",
            f"systemctl enable gunicorn-{domain}.service",
            f"systemctl start gunicorn-{domain}.service",
            "systemctl restart nginx",
        ]
        return commands

    def validate(self) -> tuple[bool, list[str]]:
        from ..utils import service_is_running, port_in_use

        issues: list[str] = []
        domain = self.config.domain or "localhost"

        if not service_is_running("nginx"):
            issues.append("Nginx is not running")
        if not service_is_running("postgresql"):
            issues.append("PostgreSQL is not running")
        if not service_is_running(f"gunicorn-{domain}"):
            issues.append("Gunicorn is not running")
        if not port_in_use(80):
            issues.append("Port 80 is not listening")

        return len(issues) == 0, issues

    def get_log_paths(self) -> list[Path]:
        domain = self.config.domain or "localhost"
        return [
            Path(f"/var/log/nginx/{domain}_error.log"),
            Path(f"/var/log/nginx/{domain}_access.log"),
            Path(f"/var/log/gunicorn/{domain}_error.log"),
            Path("/var/log/postgresql/postgresql-16-main.log"),
        ]

    def get_docker_services(self) -> dict:
        project_name = self.config.extra.get("project", "mysite")
        return {
            "web": {
                "build": ".",
                "command": f"gunicorn {project_name}.wsgi:application --bind 0.0.0.0:8000",
                "volumes": ["./app:/app", "static_volume:/app/staticfiles"],
                "environment": {
                    "DEBUG": "0",
                    "DATABASE_URL": "postgres://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}",
                },
                "depends_on": ["db"],
            },
            "db": {
                "image": "postgres:16-alpine",
                "volumes": ["postgres_data:/var/lib/postgresql/data"],
                "environment": {
                    "POSTGRES_DB": "${DB_NAME}",
                    "POSTGRES_USER": "${DB_USER}",
                    "POSTGRES_PASSWORD": "${DB_PASSWORD}",
                },
            },
            "nginx": {
                "image": "nginx:alpine",
                "ports": ["80:80"],
                "volumes": [
                    "./nginx.conf:/etc/nginx/conf.d/default.conf",
                    "static_volume:/app/staticfiles",
                ],
                "depends_on": ["web"],
            },
        }

    def get_docker_volumes(self) -> dict:
        return {"postgres_data": {}, "static_volume": {}}
