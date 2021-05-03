#!/bin/bash
ADMIN_PORT=$(cat "config-admin-ws")
APP_PORT=$(cat "config-app-ws")
MAIN_APP_ID=$(cat "config-main-app-id")

# INSTALL THE HAPP
# this will also generate an agent
# and it will also activate the app
hc sandbox call --running=$ADMIN_PORT install-app-bundle --app-id=$MAIN_APP_ID dna/workdir/acorn.happ

# ACTIVATE THE WEBSOCKET PORT
hc sandbox call --running=$ADMIN_PORT add-app-ws $APP_PORT