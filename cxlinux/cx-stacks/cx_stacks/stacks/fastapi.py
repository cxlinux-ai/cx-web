"""FastAPI Stack - FastAPI + PostgreSQL + Nginx + Uvicorn."""

from pathlib import Path

from .base import BaseStack, ServiceInfo, StackConfig


class FastAPIStack(BaseStack):
    """FastAPI + PostgreSQL + Nginx + Uvicorn stack."""

    name = "fastapi"
    description = "FastAPI + PostgreSQL 16 + Nginx + Uvicorn"
    version = "0.109"

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

    services = ["nginx", "postgresql", "uvicorn"]
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
                name="Uvicorn",
                package="uvicorn",
                service_name="uvicorn",
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
        workers = self.config.extra.get("workers", 4)
        app_module = self.config.extra.get("module", "main:app")

        # Nginx reverse proxy with WebSocket support
        nginx_content = f"""upstream fastapi {{
    server 127.0.0.1:8000 fail_timeout=0;
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
        proxy_pass http://fastapi;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        proxy_buffering off;
    }}

    location /static/ {{
        alias {app_path}/static/;
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

        # Uvicorn systemd service
        uvicorn_service = f"""[Unit]
Description=Uvicorn daemon for FastAPI {domain}
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory={app_path}
Environment="PATH={app_path}/venv/bin"
Environment="DATABASE_URL=postgresql://{self.config.db_user}:{self.config.db_password or 'password'}@localhost:5432/{self.config.db_name}"
ExecStart={app_path}/venv/bin/uvicorn \\
    {app_module} \\
    --host 127.0.0.1 \\
    --port 8000 \\
    --workers {workers} \\
    --access-log \\
    --log-level info
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
"""
        configs.append(
            (Path(f"/etc/systemd/system/uvicorn-{domain}.service"), uvicorn_service)
        )

        # Sample FastAPI app
        if not self.config.app_path:
            main_py = f'''"""FastAPI application."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(
    title="{domain} API",
    description="FastAPI application deployed by Cortex Stacks",
    version="1.0.0",
)


class HealthResponse(BaseModel):
    status: str
    message: str


@app.get("/")
async def root():
    return {{"message": "FastAPI Stack Running", "deployed_by": "Cortex Stacks"}}


@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(status="ok", message="Service is healthy")


@app.get("/api/v1/items")
async def list_items():
    return {{"items": [], "total": 0}}
'''
            configs.append((app_path / "main.py", main_py))

        # Environment file
        env_content = f"""DATABASE_URL=postgresql://{self.config.db_user}:{self.config.db_password or 'password'}@localhost:5432/{self.config.db_name}
DEBUG=False
SECRET_KEY=change-me-in-production
ALLOWED_ORIGINS={domain},localhost
"""
        configs.append((app_path / ".env", env_content))

        # Requirements
        requirements = """fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0
python-dotenv>=1.0.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
alembic>=1.13.0
httpx>=0.26.0
"""
        configs.append((app_path / "requirements.txt", requirements))

        return configs

    def post_install(self) -> list[str]:
        domain = self.config.domain or "localhost"
        app_path = self.config.app_path or self.get_web_root()
        db_password = self.config.db_password or "password"

        commands = [
            f"mkdir -p {app_path}/static",
            f"python3 -m venv {app_path}/venv",
            f"{app_path}/venv/bin/pip install --upgrade pip",
            f"{app_path}/venv/bin/pip install -r {app_path}/requirements.txt",
            # Database setup
            f"sudo -u postgres psql -c \"CREATE USER {self.config.db_user} WITH PASSWORD '{db_password}';\" || true",
            f"sudo -u postgres psql -c \"CREATE DATABASE {self.config.db_name} OWNER {self.config.db_user};\" || true",
            f"sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE {self.config.db_name} TO {self.config.db_user};\"",
            # Permissions
            f"chown -R www-data:www-data {app_path}",
            # Services
            f"ln -sf /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/",
            "rm -f /etc/nginx/sites-enabled/default",
            "nginx -t",
            "systemctl daemon-reload",
            f"systemctl enable uvicorn-{domain}.service",
            f"systemctl start uvicorn-{domain}.service",
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
        if not service_is_running(f"uvicorn-{domain}"):
            issues.append("Uvicorn is not running")
        if not port_in_use(80):
            issues.append("Port 80 is not listening")

        return len(issues) == 0, issues

    def get_log_paths(self) -> list[Path]:
        domain = self.config.domain or "localhost"
        return [
            Path(f"/var/log/nginx/{domain}_error.log"),
            Path(f"/var/log/nginx/{domain}_access.log"),
            Path(f"/var/log/syslog"),  # Uvicorn logs to syslog
            Path("/var/log/postgresql/postgresql-16-main.log"),
        ]

    def get_docker_services(self) -> dict:
        return {
            "api": {
                "build": ".",
                "command": "uvicorn main:app --host 0.0.0.0 --port 8000",
                "volumes": ["./app:/app"],
                "environment": {
                    "DATABASE_URL": "postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}",
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
                "volumes": ["./nginx.conf:/etc/nginx/conf.d/default.conf"],
                "depends_on": ["api"],
            },
        }

    def get_docker_volumes(self) -> dict:
        return {"postgres_data": {}}
