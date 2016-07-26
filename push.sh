#!/usr/bin/env bash

WEBROOT=wwwaqui

adb push "./$1/." "/mnt/sdcard/$WEBROOT/$1"
