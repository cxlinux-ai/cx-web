"""Python Stack - Python + Gunicorn + Nginx."""

from pathlib import Path

from .base import BaseStack, ServiceInfo, StackConfig


class PythonStack(BaseStack):
    """Python + Gunicorn + Nginx proxy stack."""

    name = "python"
    description = "Python 3.11 + Gunicorn + Nginx reverse proxy"
    version = "3.11"

    packages_debian = [
        "nginx",
        "python3",
        "python3-pip",
        "python3-venv",
    ]

    packages_rhel = [
        "nginx",
        "python3",
        "python3-pip",
    ]

    services = ["nginx", "gunicorn"]
    default_ports = {"http": 80, "https": 443, "app": 8000}

    @property
    def required_services(self) -> list[ServiceInfo]:
        app_port = self.config.extra.get("port", 8000)
        return [
            ServiceInfo(
                name="Nginx",
                package="nginx",
                service_name="nginx",
                port=80,
                config_paths=[Path("/etc/nginx/sites-available")],
            ),
            ServiceInfo(
                name="Gunicorn",
                package="gunicorn",
                service_name="gunicorn",
                port=app_port,
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
        app_port = self.config.extra.get("port", 8000)
        app_path = self.config.app_path or self.get_web_root()
        app_module = self.config.extra.get("module", "app:app")
        workers = self.config.extra.get("workers", 4)

        # Nginx reverse proxy
        nginx_content = f"""upstream gunicorn {{
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
        proxy_pass http://gunicorn;
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

        # Gunicorn systemd service
        gunicorn_service = f"""[Unit]
Description=Gunicorn daemon for {domain}
Requires=gunicorn-{domain}.socket
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
RuntimeDirectory=gunicorn
WorkingDirectory={app_path}
ExecStart={app_path}/venv/bin/gunicorn \\
    --workers {workers} \\
    --bind unix:/run/gunicorn/{domain}.sock \\
    --access-logfile /var/log/gunicorn/{domain}_access.log \\
    --error-logfile /var/log/gunicorn/{domain}_error.log \\
    {app_module}
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
Description=Gunicorn socket for {domain}

[Socket]
ListenStream=/run/gunicorn/{domain}.sock
SocketUser=www-data

[Install]
WantedBy=sockets.target
"""
        configs.append(
            (Path(f"/etc/systemd/system/gunicorn-{domain}.socket"), gunicorn_socket)
        )

        # Sample Flask app if no app_path specified
        if not self.config.app_path:
            sample_app = """from flask import Flask

app = Flask(__name__)

@app.route('/')
def index():
    return '<h1>Python Stack Running</h1><p>Deployed by Cortex Stacks</p>'

@app.route('/health')
def health():
    return {'status': 'ok'}

if __name__ == '__main__':
    app.run()
"""
            configs.append((app_path / "app.py", sample_app))

            requirements = """flask>=3.0.0
gunicorn>=21.0.0
"""
            configs.append((app_path / "requirements.txt", requirements))

        return configs

    def post_install(self) -> list[str]:
        domain = self.config.domain or "localhost"
        app_path = self.config.app_path or self.get_web_root()
        commands = [
            f"mkdir -p {app_path}",
            f"python3 -m venv {app_path}/venv",
            f"{app_path}/venv/bin/pip install --upgrade pip",
            f"{app_path}/venv/bin/pip install gunicorn",
            f"test -f {app_path}/requirements.txt && {app_path}/venv/bin/pip install -r {app_path}/requirements.txt || true",
            f"chown -R www-data:www-data {app_path}",
            "mkdir -p /var/log/gunicorn",
            "chown www-data:www-data /var/log/gunicorn",
            "mkdir -p /run/gunicorn",
            "chown www-data:www-data /run/gunicorn",
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
            Path(f"/var/log/gunicorn/{domain}_access.log"),
        ]

    def get_docker_services(self) -> dict:
        return {
            "app": {
                "build": ".",
                "volumes": ["./app:/app"],
                "environment": {
                    "PYTHONUNBUFFERED": "1",
                },
                "restart": "unless-stopped",
            },
            "nginx": {
                "image": "nginx:alpine",
                "ports": ["80:80"],
                "volumes": ["./nginx.conf:/etc/nginx/conf.d/default.conf"],
                "depends_on": ["app"],
            },
        }

    def get_docker_volumes(self) -> dict:
        return {}
