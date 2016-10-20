#!/usr/bin/env bash

# Remove all stopped containers
docker rm $(docker ps -a -q)

# Remove all untagged images
docker rmi $(docker images -q --filter "dangling=true")
