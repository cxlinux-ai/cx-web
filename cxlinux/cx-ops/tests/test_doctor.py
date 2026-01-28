"""Tests for the doctor module."""

import pytest

from cx_ops.doctor.checks import (
    Check,
    CheckCategory,
    CheckResult,
    CheckSeverity,
    CheckStatus,
)
from cx_ops.doctor.runner import CheckRunner, RunnerConfig


def sample_check_pass() -> CheckResult:
    """A check that always passes."""
    return CheckResult(
        check_id="test_pass",
        name="Test Pass",
        status=CheckStatus.PASS,
        message="Everything OK",
    )


def sample_check_fail() -> CheckResult:
    """A check that always fails."""
    return CheckResult(
        check_id="test_fail",
        name="Test Fail",
        status=CheckStatus.FAIL,
        message="Something wrong",
        fix_id="test_fix",
    )


def sample_check_warn() -> CheckResult:
    """A check that always warns."""
    return CheckResult(
        check_id="test_warn",
        name="Test Warn",
        status=CheckStatus.WARN,
        message="Warning issued",
    )


class TestCheckResult:
    """Tests for CheckResult."""

    def test_create_result(self):
        result = CheckResult(
            check_id="test",
            name="Test Check",
            status=CheckStatus.PASS,
            message="OK",
        )
        assert result.check_id == "test"
        assert result.status == CheckStatus.PASS

    def test_result_with_details(self):
        result = CheckResult(
            check_id="test",
            name="Test Check",
            status=CheckStatus.FAIL,
            message="Failed",
            details={"error": "Something went wrong"},
        )
        assert result.details["error"] == "Something went wrong"


class TestCheckRunner:
    """Tests for CheckRunner."""

    def test_run_checks(self):
        checks = [
            Check(
                id="pass_check",
                name="Pass Check",
                description="Always passes",
                category=CheckCategory.SYSTEM,
                severity=CheckSeverity.LOW,
                check_fn=sample_check_pass,
            ),
            Check(
                id="warn_check",
                name="Warn Check",
                description="Always warns",
                category=CheckCategory.SYSTEM,
                severity=CheckSeverity.MEDIUM,
                check_fn=sample_check_warn,
            ),
        ]

        runner = CheckRunner()
        summary = runner.run(checks)

        assert summary.total == 2
        assert summary.passed == 1
        assert summary.warned == 1
        assert summary.failed == 0

    def test_run_with_filter(self):
        checks = [
            Check(
                id="disk_check",
                name="Disk Check",
                description="Check disk",
                category=CheckCategory.DISK,
                severity=CheckSeverity.HIGH,
                check_fn=sample_check_pass,
            ),
            Check(
                id="memory_check",
                name="Memory Check",
                description="Check memory",
                category=CheckCategory.MEMORY,
                severity=CheckSeverity.HIGH,
                check_fn=sample_check_pass,
            ),
        ]

        config = RunnerConfig(categories=[CheckCategory.DISK])
        runner = CheckRunner(config)
        summary = runner.run(checks)

        assert summary.total == 1
        assert summary.results[0].check_id == "disk_check"

    def test_summary_success(self):
        checks = [
            Check(
                id="pass1",
                name="Pass 1",
                description="Passes",
                category=CheckCategory.SYSTEM,
                severity=CheckSeverity.LOW,
                check_fn=sample_check_pass,
            ),
        ]

        runner = CheckRunner()
        summary = runner.run(checks)

        assert summary.success is True

    def test_summary_failure(self):
        checks = [
            Check(
                id="fail1",
                name="Fail 1",
                description="Fails",
                category=CheckCategory.SYSTEM,
                severity=CheckSeverity.HIGH,
                check_fn=sample_check_fail,
            ),
        ]

        runner = CheckRunner()
        summary = runner.run(checks)

        assert summary.success is False
        assert summary.failed == 1
