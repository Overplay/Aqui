#!/usr/bin/env bash

WEBROOT=wwwaqui

adb push ./common/. /mnt/sdcard/$WEBROOT/common
adb push ./opp/. /mnt/sdcard/$WEBROOT/opp
adb push ./control/. /mnt/sdcard/$WEBROOT/control

