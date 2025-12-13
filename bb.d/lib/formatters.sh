#!/bin/bash
# Formatting and display utilities

# Arrays to store test results
declare -a failed_tests
django_exit_code=0
cypress_e2e_exit_code=0
cypress_component_exit_code=0
vitest_exit_code=0
playwright_exit_code=0

# Function to format duration in MM:SS format
format_duration() {
    local duration=$1
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    printf "%02d:%02d" $minutes $seconds
}

# Function to display test summary
display_test_summary() {
    echo -e "\n${BOLD}Test Summary:${NC}"

    local any_failures=false

    if [ "$run_django_tests" = true ]; then
        if [ $django_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Django tests passed${NC} ($(format_duration $django_duration))"
        else
            echo -e "${RED}✗ Django tests failed${NC} ($(format_duration $django_duration))"
            any_failures=true
        fi
    fi

    if [ "$run_cypress_e2e_tests" = true ]; then
        if [ $cypress_e2e_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Cypress E2E tests passed${NC} ($(format_duration $cypress_e2e_duration))"
        else
            echo -e "${RED}✗ Cypress E2E tests failed${NC} ($(format_duration $cypress_e2e_duration))"
            any_failures=true
        fi
    fi

    if [ "$run_cypress_component_tests" = true ]; then
        if [ $cypress_component_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Cypress Component tests passed${NC} ($(format_duration $cypress_component_duration))"
        else
            echo -e "${RED}✗ Cypress Component tests failed${NC} ($(format_duration $cypress_component_duration))"
            any_failures=true
        fi
    fi

    if [ "$run_vitest_tests" = true ]; then
        if [ $vitest_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Vitest tests passed${NC} ($(format_duration $vitest_duration))"
        else
            echo -e "${RED}✗ Vitest tests failed${NC} ($(format_duration $vitest_duration))"
            any_failures=true
        fi
    fi

    if [ "$run_playwright_tests" = true ]; then
        if [ $playwright_exit_code -eq 0 ]; then
            echo -e "${GREEN}✓ Playwright E2E tests passed${NC} ($(format_duration $playwright_duration))"
        else
            echo -e "${RED}✗ Playwright E2E tests failed${NC} ($(format_duration $playwright_duration))"
            any_failures=true
        fi
    fi

    if [ "$any_failures" = true ]; then
        exit 1
    fi
}
