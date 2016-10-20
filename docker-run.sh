#!/usr/bin/env bash

docker run \
  -d \
  --name worker \
  -e "NODE_ENV=development" \
  --env-file .env \
  -v $(pwd)/worker:/src/worker \
  worker;
