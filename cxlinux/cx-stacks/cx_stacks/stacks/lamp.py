"""LAMP Stack - Apache + MariaDB + PHP."""

from pathlib import Path

from .base import BaseStack, ServiceInfo, StackConfig


class LAMPStack(BaseStack):
    """Apache + MariaDB + PHP stack."""

    name = "lamp"
    description = "Apache 2.4 + MariaDB 10.11 + PHP 8.3"
    version = "8.3"

    packages_debian = [
        "apache2",
        "mariadb-server",
        "mariadb-client",
        "php8.3",
        "php8.3-fpm",
        "php8.3-mysql",
        "php8.3-curl",
        "php8.3-gd",
        "php8.3-mbstring",
        "php8.3-xml",
        "php8.3-zip",
        "php8.3-intl",
        "libapache2-mod-php8.3",
    ]

    packages_rhel = [
        "httpd",
        "mariadb-server",
        "mariadb",
        "php",
        "php-fpm",
        "php-mysqlnd",
        "php-curl",
        "php-gd",
        "php-mbstring",
        "php-xml",
        "php-zip",
        "php-intl",
    ]

    services = ["apache2", "mariadb", "php8.3-fpm"]
    default_ports = {"http": 80, "https": 443, "mysql": 3306}

    @property
    def required_services(self) -> list[ServiceInfo]:
        return [
            ServiceInfo(
                name="Apache",
                package="apache2",
                service_name="apache2",
                port=80,
                config_paths=[
                    Path("/etc/apache2/apache2.conf"),
                    Path("/etc/apache2/sites-available"),
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

        # Apache virtual host
        vhost_content = f"""<VirtualHost *:80>
    ServerName {domain}
    DocumentRoot {web_root}

    <Directory {web_root}>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    <FilesMatch \\.php$>
        SetHandler "proxy:unix:/run/php/php8.3-fpm.sock|fcgi://localhost"
    </FilesMatch>

    ErrorLog ${{APACHE_LOG_DIR}}/{domain}_error.log
    CustomLog ${{APACHE_LOG_DIR}}/{domain}_access.log combined
</VirtualHost>
"""
        configs.append(
            (Path(f"/etc/apache2/sites-available/{domain}.conf"), vhost_content)
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

        # Index.php for testing
        index_content = """<?php
phpinfo();
"""
        configs.append((web_root / "index.php", index_content))

        return configs

    def post_install(self) -> list[str]:
        domain = self.config.domain or "localhost"
        commands = [
            "a2enmod rewrite proxy_fcgi setenvif",
            f"a2ensite {domain}.conf",
            "a2dissite 000-default.conf",
            "systemctl restart apache2",
            "systemctl restart php8.3-fpm",
        ]

        # Database setup if password provided
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

        if not service_is_running("apache2"):
            issues.append("Apache is not running")
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
            Path(f"/var/log/apache2/{domain}_error.log"),
            Path(f"/var/log/apache2/{domain}_access.log"),
            Path("/var/log/mysql/error.log"),
            Path("/var/log/php8.3-fpm.log"),
        ]

    def get_docker_services(self) -> dict:
        return {
            "web": {
                "image": "php:8.3-apache",
                "ports": ["80:80"],
                "volumes": ["./src:/var/www/html"],
                "depends_on": ["db"],
                "environment": {
                    "APACHE_DOCUMENT_ROOT": "/var/www/html",
                },
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
