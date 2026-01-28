"""LEMP Stack - Nginx + MariaDB + PHP."""

from pathlib import Path

from .base import BaseStack, ServiceInfo, StackConfig


class LEMPStack(BaseStack):
    """Nginx + MariaDB + PHP stack."""

    name = "lemp"
    description = "Nginx + MariaDB 10.11 + PHP 8.3"
    version = "8.3"

    packages_debian = [
        "nginx",
        "mariadb-server",
        "mariadb-client",
        "php8.3-fpm",
        "php8.3-mysql",
        "php8.3-curl",
        "php8.3-gd",
        "php8.3-mbstring",
        "php8.3-xml",
        "php8.3-zip",
        "php8.3-intl",
    ]

    packages_rhel = [
        "nginx",
        "mariadb-server",
        "mariadb",
        "php-fpm",
        "php-mysqlnd",
        "php-curl",
        "php-gd",
        "php-mbstring",
        "php-xml",
        "php-zip",
        "php-intl",
    ]

    services = ["nginx", "mariadb", "php8.3-fpm"]
    default_ports = {"http": 80, "https": 443, "mysql": 3306}

    @property
    def required_services(self) -> list[ServiceInfo]:
        return [
            ServiceInfo(
                name="Nginx",
                package="nginx",
                service_name="nginx",
                port=80,
                config_paths=[
                    Path("/etc/nginx/nginx.conf"),
                    Path("/etc/nginx/sites-available"),
                ],
            ),
            ServiceInfo(
                name="MariaDB",
                package="mariadb-server",
                service_name="mariadb",
                port=3306,
                config_paths=[Path("/etc/mysql/mariadb.conf.d")],
            ),
            ServiceInfo(
                name="PHP-FPM",
                package="php8.3-fpm",
                service_name="php8.3-fpm",
                port=9000,
                config_paths=[Path("/etc/php/8.3/fpm")],
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

        # Nginx server block
        nginx_content = f"""server {{
    listen 80;
    listen [::]:80;
    server_name {domain};
    root {web_root};
    index index.php index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/{domain}_access.log;
    error_log /var/log/nginx/{domain}_error.log;

    location / {{
        try_files $uri $uri/ /index.php?$query_string;
    }}

    location ~ \\.php$ {{
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }}

    location ~ /\\.(?!well-known).* {{
        deny all;
    }}

    # Static file caching
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|woff2?)$ {{
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

        # PHP configuration
        php_ini_content = """[PHP]
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_vars = 3000
date.timezone = UTC

[opcache]
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
"""
        configs.append(
            (Path("/etc/php/8.3/fpm/conf.d/99-cortex.ini"), php_ini_content)
        )

        # PHP-FPM pool
        fpm_pool = f"""[www]
user = www-data
group = www-data
listen = /run/php/php8.3-fpm.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.process_idle_timeout = 10s
pm.max_requests = 500
"""
        configs.append(
            (Path("/etc/php/8.3/fpm/pool.d/www.conf"), fpm_pool)
        )

        # Index.php for testing
        index_content = """<?php
phpinfo();
"""
        configs.append((web_root / "index.php", index_content))

        return configs

    def post_install(self) -> list[str]:
        domain = self.config.domain or "localhost"
        commands = [
            f"ln -sf /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/",
            "rm -f /etc/nginx/sites-enabled/default",
            "nginx -t",
            "systemctl restart nginx",
            "systemctl restart php8.3-fpm",
        ]

        if self.config.db_password:
            commands.extend([
                f"mysql -e \"CREATE DATABASE IF NOT EXISTS {self.config.db_name};\"",
                f"mysql -e \"CREATE USER IF NOT EXISTS '{self.config.db_user}'@'localhost' IDENTIFIED BY '{self.config.db_password}';\"",
                f"mysql -e \"GRANT ALL PRIVILEGES ON {self.config.db_name}.* TO '{self.config.db_user}'@'localhost';\"",
                "mysql -e \"FLUSH PRIVILEGES;\"",
            ])

        return commands

    def validate(self) -> tuple[bool, list[str]]:
        from ..utils import service_is_running, port_in_use

        issues: list[str] = []

        if not service_is_running("nginx"):
            issues.append("Nginx is not running")
        if not service_is_running("mariadb"):
            issues.append("MariaDB is not running")
        if not service_is_running("php8.3-fpm"):
            issues.append("PHP-FPM is not running")
        if not port_in_use(80):
            issues.append("Port 80 is not listening")

        return len(issues) == 0, issues

    def get_log_paths(self) -> list[Path]:
        domain = self.config.domain or "localhost"
        return [
            Path(f"/var/log/nginx/{domain}_error.log"),
            Path(f"/var/log/nginx/{domain}_access.log"),
            Path("/var/log/mysql/error.log"),
            Path("/var/log/php8.3-fpm.log"),
        ]

    def get_docker_services(self) -> dict:
        return {
            "web": {
                "image": "nginx:alpine",
                "ports": ["80:80"],
                "volumes": [
                    "./src:/var/www/html",
                    "./nginx.conf:/etc/nginx/conf.d/default.conf",
                ],
                "depends_on": ["php", "db"],
            },
            "php": {
                "image": "php:8.3-fpm-alpine",
                "volumes": ["./src:/var/www/html"],
                "depends_on": ["db"],
            },
            "db": {
                "image": "mariadb:10.11",
                "environment": {
                    "MYSQL_ROOT_PASSWORD": "${DB_ROOT_PASSWORD}",
                    "MYSQL_DATABASE": self.config.db_name,
                    "MYSQL_USER": self.config.db_user,
                    "MYSQL_PASSWORD": "${DB_PASSWORD}",
                },
                "volumes": ["db_data:/var/lib/mysql"],
            },
        }

    def get_docker_volumes(self) -> dict:
        return {"db_data": {}}
