FROM python:3.11-bullseye

WORKDIR /usr/src/backend

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get -y install --no-install-recommends \
       libpq-dev postgresql-client netcat gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

COPY ./entrypoint.sh /usr/src/backend/entrypoint.sh
RUN chmod +x /usr/src/backend/entrypoint.sh

COPY . .

ENTRYPOINT ["/usr/src/backend/entrypoint.sh"]
