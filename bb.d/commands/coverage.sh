#!/bin/bash
# Coverage command

command_coverage_help() {
    echo "Coverage Help"
    echo "Usage: bb coverage [options]"
    echo "Description: Runs a coverage report for the Django test suite"
    echo ""
    echo "Options:"
    echo "  --html   Generate HTML coverage report"
    echo "  --xml    Generate XML coverage report"
}

command_coverage_run() {
    echo "Running coverage..."

    # Ensure coverage config exists
    if [ ! -f "/usr/src/backend/.coveragerc" ]; then
        echo "[run]
source = .
omit =
    */migrations/*
    */tests/*
    */env/*
    manage.py
    */asgi.py
    */wsgi.py
    */settings.py
    */urls.py
    */admin.py
    */apps.py" > /usr/src/backend/.coveragerc
    fi

    # Run tests with coverage
    exec_backend coverage run manage.py test

    # Generate reports based on flags
    report_generated=false
    while [[ $# -gt 0 ]]; do
        case $1 in
            --html)
                exec_backend coverage html
                echo "HTML report generated in htmlcov/"
                report_generated=true
                ;;
            --xml)
                exec_backend coverage xml
                echo "XML report generated in coverage.xml"
                report_generated=true
                ;;
        esac
        shift
    done

    # If no specific report format was requested, show console report
    if [ "$report_generated" = false ]; then
        exec_backend coverage report
    fi
}
