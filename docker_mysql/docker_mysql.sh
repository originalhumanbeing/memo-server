#!/bin/sh

# docker run -d --rm -p 13306:3306 \
#     -e MYSQL_ROOT_PASSWORD="bsoup0404@" \
#     -e MYSQL_DATABASE="knowrememo" \
#     -v `pwd`/custom.cnf:/etc/mysql/conf.d/custom.cnf \
#     mysql:5

docker run -d --rm -p 13306:3306 \
    -e MYSQL_ROOT_PASSWORD="bsoup0404@" \
    -e MYSQL_DATABASE="knowrememo" \
    -v `pwd`/custom.cnf:/etc/mysql/conf.d/custom.cnf \
    mariadb:10.4