#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

if [ "$WAIT_FOR_BROKER" = "true" ]
then
    echo "Waiting for broker (Redis)..."

    while ! nc -z broker 6379; do
      sleep 0.1
    done

    echo "Broker started"
fi

python manage.py flush --no-input
python manage.py migrate

exec "$@"
