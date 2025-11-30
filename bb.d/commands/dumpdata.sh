#!/bin/bash
# Dump data command

command_dumpdata_help() {
    echo "Dumpdata Help"
    echo "Usage: bb dumpdata [output_file_name]"
    echo "Description: Dumps the data from the database into a yaml file called default.yaml by default."
    echo "             You can optionally specify an output file name."
}

command_dumpdata_run() {
    output_file="default.yaml"
    if [[ -n "$1" ]]; then
        output_file="$1"
    fi
    exec_backend python manage.py dumpdata \
      --indent 4 \
      --natural-foreign \
      --natural-primary \
      -e auth.Permission \
      -e sessions \
      -e admin \
      -e contenttypes \
      --format yaml \
      ${@: 2} \
      > "$output_file"
}
