#!/usr/bin/env bash

docker run \
  -i -t \
  --name worker \
  # -p 3000:3000 \
  -e "NODE_ENV=development" \
  -v $(pwd)/worker:/src/worker \
  chrome-api;
