# Playwright Integration with bb test Command

The Playwright tests have been integrated into the `bb test` command and respect the service configuration in `basebuild.toml`.

## Usage

### Run all tests (including Playwright if Next.js is enabled)
```bash
bb test
```

### Run only Playwright tests
```bash
bb test --playwright
```

### Run all client tests (React + Next.js)
```bash
bb test -c
```

### Run only backend tests
```bash
bb test -b
```

## Service Configuration

Playwright tests will only run if the `next` service is enabled in `basebuild.toml`:

```toml
[services]
next = true  # Playwright tests will run
```

If `next = false`, the tests will be automatically skipped with a message:
```
Skipping Playwright tests (Next.js service disabled in basebuild.toml)
```

## Test Summary

After running tests, you'll see a summary like:

```
Test Summary:
✓ Django tests passed (01:23)
✓ Cypress E2E tests passed (02:45)
✓ Playwright E2E tests passed (01:15)
```

## Command Options

- `bb test` - Run all tests for enabled services
- `bb test -b` - Run only Django tests
- `bb test -c` - Run only client tests (React: Cypress + Vitest, Next.js: Playwright)
- `bb test --playwright` - Run only Playwright tests
- `bb test --e2e` - Run only Cypress E2E tests
- `bb test --component` - Run only Cypress component tests
- `bb test --client-unit` - Run only Vitest unit tests

## Integration Details

### Files Modified

1. **`bb.d/commands/test.sh`**
   - Added `run_playwright_tests` flag
   - Added `--playwright` command option
   - Added service checking via `is_service_enabled "next"`
   - Integrated Playwright test execution with timing

2. **`bb.d/lib/formatters.sh`**
   - Added `playwright_exit_code` tracking
   - Added Playwright results to test summary display

### How It Works

1. The test command checks if `next` service is enabled in `basebuild.toml`
2. If enabled and `run_playwright_tests=true`, it runs:
   ```bash
   cd next && npm run test:e2e
   ```
3. Test results are tracked and displayed in the summary
4. If any tests fail, the command exits with code 1

## Example Output

```bash
$ bb test

Running Django tests...
Django tests completed ✓

Running Cypress E2E tests...
Cypress E2E tests completed ✓

Running Playwright E2E tests (Next.js)...
Playwright E2E tests completed ✓

Test Summary:
✓ Django tests passed (00:45)
✓ Cypress E2E tests passed (01:30)
✓ Playwright E2E tests passed (00:52)
```

## Disabling Next.js Tests

To skip Playwright tests, set `next = false` in `basebuild.toml`:

```toml
[services]
next = false
```

Then running `bb test` will automatically skip:
```
Skipping Playwright tests (Next.js service disabled in basebuild.toml)
```
