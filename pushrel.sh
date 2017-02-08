#!/usr/bin/env bash

#made changes so that you know when things are done without having to watch the terminal output (will probably only work on real operating systems)
WEBROOT=wwwaqui
HEAD="apush.sh"

adb push ./common/. /mnt/sdcard/$WEBROOT/common
adb push ./control/. /mnt/sdcard/$WEBROOT/control
adb push ./conf/. /mnt/sdcard/$WEBROOT/conf
#./push.sh opp/io.ouglass.squares
#./push.sh opp/io.ouglass.squaressb
./push.sh opp/io.ouglass.ogcralwer
./push.sh  opp/io.ouglass.waitlist
./push.sh  opp/io.ouglass.shuffleboard
