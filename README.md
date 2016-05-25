Android Bright with Lime WWW
============================

These are the static webpages served up by the native Android webserver running in Amstel Bright (AB). The webpages must be located 
in the following path on the Android device running AB:

    /mnt/sdcard/www
    
Getting the Files to the Right Place
------------------------------------

During development, the easiest way to get the files to this folder is using ADB's push command. It's a pretty stupid command,
and it will copy everything whether it needs to or not, bit in the absence of having a convenient Android git implementation,
it works.

Let's say your files are in `/somewhere/amstelbrightwithlimewww`, you would 

    cd /somewhere
    adb push amstelbrightwithlimewww/ /mnt/sdcard/www 
    
This can take a bit, especially over WiFi. It is sometimes more expedient to just copy individual folders or files over.

The other method is to zip everything below the `amstelbrightwithlimewww` folder and place this zip as `www.zip` in the
AmstelBright Android app under `assets`. When AB boots, it looks for this file, extracts it, and puts it in the right
place. This is not a very handy way of doing this for development, since it is very slow and requires a restart of the
whole app.

