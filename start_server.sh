#!/bin/sh

./stop_server.sh; screen -S uc_server_main -d -m node main_server.js
