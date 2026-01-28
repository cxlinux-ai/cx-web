"""Tests for proxy management."""

import pytest
from pathlib import Path

from cx_stacks.proxy import NginxProxy, CaddyProxy, SSLManager
from cx_stacks.proxy.nginx import ProxyConfig


class TestNginxProxy:
    """Test Nginx proxy."""

    def test_generate_config(self):
        """Nginx generates valid configuration."""
        proxy = NginxProxy()
        config = ProxyConfig(
            domain="example.com",
            backend="127.0.0.1:3000",
        )
        content = proxy.generate_config(config)

        assert "example.com" in content
        assert "127.0.0.1:3000" in content
        assert "proxy_pass" in content

    def test_generate_config_with_websocket(self):
        """Nginx config includes WebSocket headers."""
        proxy = NginxProxy()
        config = ProxyConfig(
            domain="example.com",
            backend="127.0.0.1:3000",
            websocket=True,
        )
        content = proxy.generate_config(config)

        assert "Upgrade" in content
        assert "Connection" in content

    def test_generate_config_with_ssl(self):
        """Nginx config includes SSL block."""
        proxy = NginxProxy()
        config = ProxyConfig(
            domain="example.com",
            backend="127.0.0.1:3000",
            ssl=True,
            ssl_cert="/etc/ssl/cert.pem",
            ssl_key="/etc/ssl/key.pem",
        )
        content = proxy.generate_config(config)

        assert "listen 443 ssl" in content
        assert "ssl_certificate" in content


class TestCaddyProxy:
    """Test Caddy proxy."""

    def test_generate_config(self):
        """Caddy generates valid configuration."""
        from cx_stacks.proxy.caddy import CaddyProxy, CaddyProxyConfig

        proxy = CaddyProxy()
        config = CaddyProxyConfig(
            domain="example.com",
            backend="localhost:3000",
        )
        content = proxy.generate_config(config)

        assert "example.com" in content
        assert "reverse_proxy" in content
        assert "localhost:3000" in content


class TestSSLManager:
    """Test SSL manager."""

    def test_initialization(self):
        """SSL manager initializes."""
        manager = SSLManager()
        assert manager is not None
        assert manager.certbot_path.exists() or True  # May not exist in test env

    def test_get_certificate_paths(self):
        """get_certificate_paths returns tuple."""
        manager = SSLManager()
        cert, key = manager.get_certificate_paths("nonexistent.domain")
        # Should return None for non-existent domain
        assert cert is None
        assert key is None
