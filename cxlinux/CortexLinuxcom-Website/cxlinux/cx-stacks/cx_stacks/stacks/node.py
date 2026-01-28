"""Node.js Stack - Node + PM2 + Nginx."""

from pathlib import Path

from .base import BaseStack, ServiceInfo, StackConfig


class NodeStack(BaseStack):
    """Node.js + PM2 + Nginx proxy stack."""

    name = "node"
    description = "Node.js 20 LTS + PM2 + Nginx reverse proxy"
    version = "20"

    packages_debian = [
        "nginx",
        "nodejs",
        "npm",
    ]

    packages_rhel = [
        "nginx",
        "nodejs",
        "npm",
    ]

    services = ["nginx", "pm2-root"]
    default_ports = {"http": 80, "https": 443, "app": 3000}

    @property
    def required_services(self) -> list[ServiceInfo]:
        app_port = self.config.extra.get("port", 3000)
        return [
            ServiceInfo(
                name="Nginx",
                package="nginx",
                service_name="nginx",
                port=80,
                config_paths=[Path("/etc/nginx/sites-available")],
            ),
            ServiceInfo(
                name="Node.js App",
                package="nodejs",
                service_name="pm2-root",
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
        app_port = self.config.extra.get("port", 3000)

        # Nginx reverse proxy
        nginx_content = f"""upstream nodejs {{
    server 127.0.0.1:{app_port};
    keepalive 64;
}}

server {{
    listen 80;
    listen [::]:80;
    server_name {domain};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/{domain}_access.log;
    error_log /var/log/nginx/{domain}_error.log;

    location / {{
        proxy_pass http://nodejs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }}

    # Static files (if serving from app directory)
    location /static/ {{
        alias {self.get_web_root()}/public/;
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

        # PM2 ecosystem file
        app_path = self.config.app_path or self.get_web_root()
        pm2_config = f"""module.exports = {{
  apps: [
    {{
      name: '{domain}',
      script: 'index.js',
      cwd: '{app_path}',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {{
        NODE_ENV: 'production',
        PORT: {app_port}
      }}
    }}
  ]
}};
"""
        configs.append((app_path / "ecosystem.config.js", pm2_config))

        # Sample app if no app_path specified
        if not self.config.app_path:
            sample_app = f"""const http = require('http');

const PORT = process.env.PORT || {app_port};

const server = http.createServer((req, res) => {{
  res.writeHead(200, {{ 'Content-Type': 'text/html' }});
  res.end('<h1>Node.js Stack Running</h1><p>Deployed by Cortex Stacks</p>');
}});

server.listen(PORT, () => {{
  console.log(`Server running on port ${{PORT}}`);
}});
"""
            configs.append((app_path / "index.js", sample_app))

            package_json = """{
  "name": "cortex-node-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
"""
            configs.append((app_path / "package.json", package_json))

        return configs

    def post_install(self) -> list[str]:
        domain = self.config.domain or "localhost"
        app_path = self.config.app_path or self.get_web_root()
        commands = [
            "npm install -g pm2",
            f"ln -sf /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/",
            "rm -f /etc/nginx/sites-enabled/default",
            "nginx -t",
            "systemctl restart nginx",
            f"cd {app_path} && npm install --production",
            f"cd {app_path} && pm2 start ecosystem.config.js",
            "pm2 save",
            "pm2 startup systemd -u root --hp /root",
        ]
        return commands

    def validate(self) -> tuple[bool, list[str]]:
        from ..utils import service_is_running, port_in_use

        issues: list[str] = []
        app_port = self.config.extra.get("port", 3000)

        if not service_is_running("nginx"):
            issues.append("Nginx is not running")
        if not port_in_use(80):
            issues.append("Port 80 is not listening")
        if not port_in_use(app_port):
            issues.append(f"App port {app_port} is not listening")

        return len(issues) == 0, issues

    def get_log_paths(self) -> list[Path]:
        domain = self.config.domain or "localhost"
        return [
            Path(f"/var/log/nginx/{domain}_error.log"),
            Path(f"/var/log/nginx/{domain}_access.log"),
            Path.home() / ".pm2" / "logs" / f"{domain}-out.log",
            Path.home() / ".pm2" / "logs" / f"{domain}-error.log",
        ]

    def get_docker_services(self) -> dict:
        app_port = self.config.extra.get("port", 3000)
        return {
            "app": {
                "build": ".",
                "ports": [f"{app_port}:{app_port}"],
                "environment": {
                    "NODE_ENV": "production",
                    "PORT": str(app_port),
                },
                "restart": "unless-stopped",
            },
            "nginx": {
                "image": "nginx:alpine",
                "ports": ["80:80", "443:443"],
                "volumes": ["./nginx.conf:/etc/nginx/conf.d/default.conf"],
                "depends_on": ["app"],
            },
        }

    def get_docker_volumes(self) -> dict:
        return {}
