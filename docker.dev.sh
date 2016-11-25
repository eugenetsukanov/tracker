#!/usr/bin/env bash
docker-compose kill dev && docker-compose rm --force dev && docker-compose up dev