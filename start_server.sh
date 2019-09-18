#!/bin/sh

./stop_server.sh; screen -S uc_server -d -m node main_server.js
