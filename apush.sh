#!/usr/bin/env bash

#made changes so that you know when things are done without having to watch the terminal output (will probably only work on real operating systems)
WEBROOT=wwwaqui
HEAD="apush.sh"

adb push ./common/. /mnt/sdcard/$WEBROOT/common
adb push ./opp/. /mnt/sdcard/$WEBROOT/opp
adb push ./control/. /mnt/sdcard/$WEBROOT/control
adb push ./conf/. /mnt/sdcard/$WEBROOT/conf

