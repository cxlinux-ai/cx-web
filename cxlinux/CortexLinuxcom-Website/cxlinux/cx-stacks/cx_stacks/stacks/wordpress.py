"""WordPress Stack - WordPress + MariaDB + Nginx + Redis."""

from pathlib import Path
import secrets

from .base import BaseStack, ServiceInfo, StackConfig


class WordPressStack(BaseStack):
    """WordPress + MariaDB + Nginx + Redis cache stack."""

    name = "wordpress"
    description = "WordPress 6 + MariaDB + Nginx + Redis cache"
    version = "6.4"

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
        "php8.3-imagick",
        "php8.3-redis",
        "redis-server",
        "unzip",
        "curl",
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
        "php-imagick",
        "php-redis",
        "redis",
        "unzip",
        "curl",
    ]

    services = ["nginx", "mariadb", "php8.3-fpm", "redis-server"]
    default_ports = {"http": 80, "https": 443, "mysql": 3306, "redis": 6379}

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
            ServiceInfo(
                name="Redis",
                package="redis-server",
                service_name="redis-server",
                port=6379,
                config_paths=[Path("/etc/redis")],
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

        # Nginx config optimized for WordPress
        nginx_content = f"""server {{
    listen 80;
    listen [::]:80;
    server_name {domain};
    root {web_root};
    index index.php index.html;

    client_max_body_size 64M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/{domain}_access.log;
    error_log /var/log/nginx/{domain}_error.log;

    # WordPress permalinks
    location / {{
        try_files $uri $uri/ /index.php?$args;
    }}

    # PHP handling
    location ~ \\.php$ {{
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 300;
    }}

    # Block access to sensitive files
    location ~ /\\.(ht|git|svn) {{
        deny all;
    }}

    location = /wp-config.php {{
        deny all;
    }}

    location ~* /(?:uploads|files)/.*\\.php$ {{
        deny all;
    }}

    # Static file caching
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js|woff2?|ttf|svg|webp)$ {{
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }}

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}}
"""
        configs.append(
            (Path(f"/etc/nginx/sites-available/{domain}"), nginx_content)
        )

        # PHP configuration optimized for WordPress
        php_ini = """[PHP]
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_vars = 5000
date.timezone = UTC

[opcache]
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
opcache.save_comments=1
"""
        configs.append(
            (Path("/etc/php/8.3/fpm/conf.d/99-wordpress.ini"), php_ini)
        )

        # Redis config for WordPress
        redis_conf = """bind 127.0.0.1
maxmemory 256mb
maxmemory-policy allkeys-lru
"""
        configs.append((Path("/etc/redis/redis-cortex.conf"), redis_conf))

        # wp-config.php template
        db_password = self.config.db_password or secrets.token_urlsafe(16)
        wp_config = f"""<?php
define('DB_NAME', '{self.config.db_name}');
define('DB_USER', '{self.config.db_user}');
define('DB_PASSWORD', '{db_password}');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

$table_prefix = 'wp_';

define('AUTH_KEY',         '{secrets.token_urlsafe(48)}');
define('SECURE_AUTH_KEY',  '{secrets.token_urlsafe(48)}');
define('LOGGED_IN_KEY',    '{secrets.token_urlsafe(48)}');
define('NONCE_KEY',        '{secrets.token_urlsafe(48)}');
define('AUTH_SALT',        '{secrets.token_urlsafe(48)}');
define('SECURE_AUTH_SALT', '{secrets.token_urlsafe(48)}');
define('LOGGED_IN_SALT',   '{secrets.token_urlsafe(48)}');
define('NONCE_SALT',       '{secrets.token_urlsafe(48)}');

define('WP_REDIS_HOST', '127.0.0.1');
define('WP_REDIS_PORT', 6379);
define('WP_CACHE', true);

define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
define('DISALLOW_FILE_EDIT', true);
define('WP_AUTO_UPDATE_CORE', 'minor');

if ( ! defined( 'ABSPATH' ) ) {{
    define( 'ABSPATH', __DIR__ . '/' );
}}

require_once ABSPATH . 'wp-settings.php';
"""
        configs.append((web_root / "wp-config.php", wp_config))

        return configs

    def post_install(self) -> list[str]:
        domain = self.config.domain or "localhost"
        web_root = self.get_web_root()
        db_password = self.config.db_password or secrets.token_urlsafe(16)

        commands = [
            f"mkdir -p {web_root}",
            # Download WordPress
            f"curl -sL https://wordpress.org/latest.tar.gz | tar xz -C {web_root} --strip-components=1",
            # Database setup
            f"mysql -e \"CREATE DATABASE IF NOT EXISTS {self.config.db_name};\"",
            f"mysql -e \"CREATE USER IF NOT EXISTS '{self.config.db_user}'@'localhost' IDENTIFIED BY '{db_password}';\"",
            f"mysql -e \"GRANT ALL PRIVILEGES ON {self.config.db_name}.* TO '{self.config.db_user}'@'localhost';\"",
            "mysql -e \"FLUSH PRIVILEGES;\"",
            # Permissions
            f"chown -R www-data:www-data {web_root}",
            f"chmod -R 755 {web_root}",
            f"chmod 640 {web_root}/wp-config.php",
            # Enable services
            f"ln -sf /etc/nginx/sites-available/{domain} /etc/nginx/sites-enabled/",
            "rm -f /etc/nginx/sites-enabled/default",
            "nginx -t",
            "systemctl restart nginx",
            "systemctl restart php8.3-fpm",
            "systemctl enable redis-server",
            "systemctl restart redis-server",
        ]
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
        if not service_is_running("redis-server"):
            issues.append("Redis is not running")
        if not port_in_use(80):
            issues.append("Port 80 is not listening")

        return len(issues) == 0, issues

    def get_log_paths(self) -> list[Path]:
        domain = self.config.domain or "localhost"
        web_root = self.get_web_root()
        return [
            Path(f"/var/log/nginx/{domain}_error.log"),
            Path(f"/var/log/nginx/{domain}_access.log"),
            Path("/var/log/mysql/error.log"),
            web_root / "wp-content" / "debug.log",
        ]

    def get_docker_services(self) -> dict:
        return {
            "wordpress": {
                "image": "wordpress:6-fpm-alpine",
                "volumes": ["wordpress_data:/var/www/html"],
                "environment": {
                    "WORDPRESS_DB_HOST": "db",
                    "WORDPRESS_DB_NAME": "${DB_NAME}",
                    "WORDPRESS_DB_USER": "${DB_USER}",
                    "WORDPRESS_DB_PASSWORD": "${DB_PASSWORD}",
                },
                "depends_on": ["db", "redis"],
            },
            "db": {
                "image": "mariadb:10.11",
                "volumes": ["db_data:/var/lib/mysql"],
                "environment": {
                    "MYSQL_ROOT_PASSWORD": "${DB_ROOT_PASSWORD}",
                    "MYSQL_DATABASE": "${DB_NAME}",
                    "MYSQL_USER": "${DB_USER}",
                    "MYSQL_PASSWORD": "${DB_PASSWORD}",
                },
            },
            "redis": {
                "image": "redis:7-alpine",
                "volumes": ["redis_data:/data"],
            },
            "nginx": {
                "image": "nginx:alpine",
                "ports": ["80:80", "443:443"],
                "volumes": [
                    "./nginx.conf:/etc/nginx/conf.d/default.conf",
                    "wordpress_data:/var/www/html",
                ],
                "depends_on": ["wordpress"],
            },
        }

    def get_docker_volumes(self) -> dict:
        return {"wordpress_data": {}, "db_data": {}, "redis_data": {}}
