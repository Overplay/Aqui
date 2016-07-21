var fs = require("fs");

var requiredFields = ["appId", "appType", "screenName", "onLauncher", "primaryColor", "secondaryColor", "iconImage", "iconLabel"];
var suggestedFields = ["reverseDomainName"];

var files = fs.readdirSync("opp");

files.forEach(function(appDir){
    try{
	
	var infoContents = fs.readFileSync("opp/" + appDir + "/info/info.json");
	var infoObj = JSON.parse(infoContents);	    
	var broken = false;
	requiredFields.forEach(function(field){
	    if(!infoObj[field]){
		console.error("Error: Missing required field - " + field + " - in appDir");
		broken = true;
	    }
	});
	if(!broken){
	    console.log(appDir + " info file correct");
	}
    } catch(e){
	console.error(appDir  + " is missing info file (should be in opp/<app>/info/info.json");	
    }
});
