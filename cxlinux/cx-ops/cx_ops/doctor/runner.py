"""Check runner for Cortex Doctor."""

import asyncio
import inspect
import time
from dataclasses import dataclass, field

from cx_ops.config import get_settings
from cx_ops.doctor.checks import (
    ALL_CHECKS,
    Check,
    CheckCategory,
    CheckResult,
    CheckSeverity,
    CheckStatus,
)


@dataclass
class RunnerConfig:
    """Configuration for the check runner."""

    timeout_seconds: int = 30
    parallel: bool = True
    max_parallel: int = 4
    categories: list[CheckCategory] | None = None
    severities: list[CheckSeverity] | None = None
    check_ids: list[str] | None = None
    tags: list[str] | None = None
    skip_ids: list[str] = field(default_factory=list)


@dataclass
class RunSummary:
    """Summary of a check run."""

    total: int
    passed: int
    warned: int
    failed: int
    skipped: int
    errors: int
    duration_ms: float
    results: list[CheckResult]

    @property
    def success(self) -> bool:
        """Check if all non-skipped checks passed or warned."""
        return self.failed == 0 and self.errors == 0


class CheckRunner:
    """Executes health checks with configurable parallelism and filtering."""

    def __init__(self, config: RunnerConfig | None = None) -> None:
        self.config = config or RunnerConfig()
        settings = get_settings()
        if self.config.timeout_seconds == 30:
            self.config.timeout_seconds = settings.doctor.timeout_seconds
        if self.config.max_parallel == 4:
            self.config.max_parallel = settings.doctor.max_parallel

    def _filter_checks(self, checks: list[Check]) -> list[Check]:
        """Filter checks based on configuration."""
        filtered = [c for c in checks if c.enabled and c.id not in self.config.skip_ids]

        if self.config.check_ids:
            filtered = [c for c in filtered if c.id in self.config.check_ids]

        if self.config.categories:
            filtered = [c for c in filtered if c.category in self.config.categories]

        if self.config.severities:
            filtered = [c for c in filtered if c.severity in self.config.severities]

        if self.config.tags:
            filtered = [c for c in filtered if any(t in c.tags for t in self.config.tags)]

        return filtered

    async def _run_check(self, check: Check) -> CheckResult:
        """Execute a single check with timeout."""
        start = time.perf_counter()

        try:
            if inspect.iscoroutinefunction(check.check_fn):
                result = await asyncio.wait_for(
                    check.check_fn(),
                    timeout=self.config.timeout_seconds,
                )
            else:
                result = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(None, check.check_fn),
                    timeout=self.config.timeout_seconds,
                )
        except asyncio.TimeoutError:
            result = CheckResult(
                check_id=check.id,
                name=check.name,
                status=CheckStatus.ERROR,
                message=f"Check timed out after {self.config.timeout_seconds}s",
            )
        except Exception as e:
            result = CheckResult(
                check_id=check.id,
                name=check.name,
                status=CheckStatus.ERROR,
                message=f"Check failed with error: {str(e)}",
                details={"error_type": type(e).__name__},
            )

        result.duration_ms = (time.perf_counter() - start) * 1000
        return result

    async def run_async(self, checks: list[Check] | None = None) -> RunSummary:
        """Run checks asynchronously."""
        start = time.perf_counter()
        checks_to_run = self._filter_checks(checks or ALL_CHECKS)

        if self.config.parallel:
            semaphore = asyncio.Semaphore(self.config.max_parallel)

            async def run_with_semaphore(check: Check) -> CheckResult:
                async with semaphore:
                    return await self._run_check(check)

            results = await asyncio.gather(
                *[run_with_semaphore(c) for c in checks_to_run],
                return_exceptions=False,
            )
        else:
            results = []
            for check in checks_to_run:
                results.append(await self._run_check(check))

        passed = sum(1 for r in results if r.status == CheckStatus.PASS)
        warned = sum(1 for r in results if r.status == CheckStatus.WARN)
        failed = sum(1 for r in results if r.status == CheckStatus.FAIL)
        skipped = sum(1 for r in results if r.status == CheckStatus.SKIP)
        errors = sum(1 for r in results if r.status == CheckStatus.ERROR)

        return RunSummary(
            total=len(results),
            passed=passed,
            warned=warned,
            failed=failed,
            skipped=skipped,
            errors=errors,
            duration_ms=(time.perf_counter() - start) * 1000,
            results=list(results),
        )

    def run(self, checks: list[Check] | None = None) -> RunSummary:
        """Run checks synchronously (wrapper for async)."""
        return asyncio.run(self.run_async(checks))

    async def run_single_async(self, check_id: str) -> CheckResult | None:
        """Run a single check by ID."""
        for check in ALL_CHECKS:
            if check.id == check_id:
                return await self._run_check(check)
        return None

    def run_single(self, check_id: str) -> CheckResult | None:
        """Run a single check by ID synchronously."""
        return asyncio.run(self.run_single_async(check_id))
