#!/usr/bin/env bash

WEBROOT=wwwaqui

adb push "./$1/." "/mnt/sdcard/$WEBROOT/$1"
curl -X POST http://192.168.1.32:9090/api/system/refreshapps