#!/bin/sh

docker run -d --rm -p 13306:3306 \
    -e MYSQL_ROOT_PASSWORD="bsoup0404@" \
    -e MYSQL_DATABASE="knowrememo" \
    mysql:5