function createInfoJSON(){
    var info = {};
    process.stdout.write("what is the name of the application? ");
    getValue(function(text){ info.appId = text });

    process.stdout.write("what type of application is it (crawler or widget)? ");
    var callback = function(text){ 
	text = text.toLowerCase();
	if(text != 'crawler' || text != 'widget'){
	    process.stdout.write('only possible values are "crawler" or "widget", try again: ');
	    getValue(callback);
	}
	else {
	    info.appType = text;
	}
    };
    getValue(callback);

    console.log(info);
}

createInfoJSON();

function getValue(setterCallback){
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (text) {
	setterCallback(text);
	process.exit();
	console.log();
    });
}
