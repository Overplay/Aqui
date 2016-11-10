// MAK: This serves files right out of /assets and not the .tmp bullshit
// You will also want to disable the Grunt build of stuff from Assets into .tmp in the .sailsrc file
// with hooks.grunt = false like so:

/*
 "hooks": {
 "grunt": false
 }
 */

module.exports = {
    paths: {
        public: __dirname + "/../.."
    }
};