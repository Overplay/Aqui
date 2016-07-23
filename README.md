#AQUI: Web Apps and Support Tools for OG Hardware

*NOTE: This project was formally known as Amstel Bright with Lime. This repo is the result of merging in the new JS injection technique for updating the data model without the need to poll (on the TV side).*

These are the static webpages served up by the native Android webserver running on the OG hardware (a part of Amstel Bright). 

The webpages must be located in the following path on the OG Android device:

    /mnt/sdcard/www
    
##Getting the Files to the Right Place

During development, the easiest way to get the files to the right folder is to use the handy shell scripts included in the root.
    - apush.sh pushes everything in `common`, `opp` and `control` over to the OG box
    - push.sh will push subfolders passed as an argument. For example, to push `opp/io.ourglass.shuffleboard` use `./push.sh opp/io.ourglass.shuffleboard`
    
Example:

    adb connect 10.1.10.37
    ./push opp
    
The above would connect to the target device then push all the apps over.

This can take a bit, especially over WiFi. It is sometimes more expedient to just copy individual folders or files over.

If you prefer to not use automation (why?) you can directly use ADB's push command.

Let's say your files are in `/somewhere/aqui`, you would 

    cd /somewhere
    adb push aqui/ /mnt/sdcard/www 
    
But seriously, use the scripts.


##NodeJS Tools

[ Ethan, add some documentation here, please.]

#Overall Folder Layout

There are 3 top level folders that are required:
* /common:  holds shared common assets such as fonts, js libraries and css
* /control: the overall control app for an OG device. 
* /opp: this older holds all installed OG app packages

##Common Assets (/common)

Most, if not all, sharable assets go here. 

A `bower.json` is included to import, via Bower, all shared dependencies. Examples include angular.js, lodash, bootstrap, etc. If you need to import a library, do it here and then reference it from your app.

The `fonts` folder is for shared fonts. Many apps use the same fonts, so put them here.

`ionic` has the most recent ionic lib for import into control apps. 

`js` is other libraries such 


##OPP Project Layout
------------------

All Ourglass Angular apps share a common JS/CSS "repositiory". This was done so that we do not have libraries replicated
in every single Angular SPA. Common files are found in the cleverly named `common` folder. In that folder is a `bower.json`
that can be edited to include stuff not already included. 

**Do NOT remove anything from the common Bower or change rev levels without checking with every other app owner first.**

Apps themselves are located in the `opp` folder. The paths look like this:

    opp/[app id using rdns format]/app/tv           this is where the TV-side lives
    opp/[app id using rdns format]/app/control      this is where the remote control side lives
    opp/[app id using rdns format]/assets/icons     this is where app picker icons live for the app
    opp/[app id using rdns format]/info/info.json   information needed by the app picker about the app
    
    
Required Elements 
    
    
Individual App Layout
---------------------

Apps should use "Mitch Standard" project layout for angular:

    index.html
    app/components/your components
    app/shared/your shared code like model, services, etc.
    assets/css
    assets/fonts *consider putting your font in `/common/fonts` unless it is something very whack*
    assets/img
    assets/bower.json  *but you should use this very sparingly and instead think about putting your JS bowers in common*
    
Control App
-----------

The OG control app is in `/control`. This app is used to launch, move, kill apps on a particular OG. It normally runs in a WebView (UIWebView or Android WebView) on the mobile app.


RiffRaff
--------

Junk we are keeping around for reference. May eventually be whacked.

