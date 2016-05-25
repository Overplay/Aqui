Android Bright with Lime WWW
============================

These are the static webpages served up by the native Android webserver running in Amstel Bright (AB). The webpages must be located 
in the following path on the Android device running AB:

    /mnt/sdcard/www
    
Getting the Files to the Right Place
------------------------------------

During development, the easiest way to get the files to this folder is using ADB's push command. It's a pretty stupid command,
and it will copy everything whether it needs to or not. But in the absence of having a convenient Android git implementation,
it works.

Let's say your files are in `/somewhere/amstelbrightwithlimewww`, you would 

    cd /somewhere
    adb push amstelbrightwithlimewww/ /mnt/sdcard/www 
    
This can take a bit, especially over WiFi. It is sometimes more expedient to just copy individual folders or files over.

The other method is to zip everything below the `amstelbrightwithlimewww` folder and place this zip as `www.zip` in the
AmstelBright Android app under `assets`. When AB boots, it looks for this file, extracts it, and puts it in the right
place. This is not a very handy way of doing this for development, since it is very slow and requires a restart of the
whole app.


WWW Project Layout
------------------

All OurGlass Angular apps share a common JS/CSS "repositiory". This was done so that we do not have libraries replicated
in every single Angular SPA. Common files are found in the cleverly named `common` folder. In that folder is a `bower.json`
that can be edited to include stuff not already included. Do NOT remove anything from this Bower or change rev levels
without checking with every other app owner first.

Apps themselves are located in the `opp` folder. The paths used look like this:

    opp/[app id using rdns format]/app/tv           this is where the TV-side lives
    opp/[app id using rdns format]/app/control      this is where the remote control side lives
    opp/[app id using rdns format]/assets/icons     this is where app picker icons live for the app
    opp/[app id using rdns format]/info/info.json   information needed by the app picker about the app
    
    
Individual App Layout
---------------------

Apps use "Mitch Standard" project layout for angular:

    index.html
    app/components/your components
    app/shared/your shared code like model, services, etc.
    assets/css
    assets/fonts
    assets/img
    assets/bower.json  but you should use this very sparingly and instead think about putting your JS bowers in common
    
