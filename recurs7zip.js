// For debug
function printObject(AObj){
	for (var i in AObj) WScript.Echo(""+i+"="+AObj[i]);
}

// Change to read from JSON file
function getParameters(){
	var locParameters = {};
	locParameters.rootSrc="D:\\prot\\pjarch\\proba\\src";
	locParameters.rootDst="D:\\prot\\pjarch\\proba\\dst";
	locParameters.archExe="\"C:\\Program Files\\7\-Zip\\7z.exe\" a \-tzip ";
	locParameters.archExt="7z";
	locParameters.includePattern=/.*/ig;
	locParameters.excludePattern=/\.(jpg|png|zip)$/;
	return locParameters;
}

// Add logfile object
function getCommonObjects(){
	var locObjects = {};
	locObjects.Parameters=getParameters();
	locObjects.SFSO = new ActiveXObject("Scripting.FileSystemObject");
	locObjects.WSShell = WScript.CreateObject("WScript.Shell");
	return locObjects;
}

// Recursive create directoris from full path
function createDirRecursive(ACommonObjects, APath){
//	WScript.echo("28>"+APath);
	if (! ACommonObjects.SFSO.FolderExists(APath)){
		var locDirs=APath.split("\\");
		var locCurDir=locDirs[0];
		for(var i=1;i<locDirs.length;i++){
			locCurDir=locCurDir+"\\"+locDirs[i]; // try join
			if (! ACommonObjects.SFSO.FolderExists(locCurDir)){
				ACommonObjects.SFSO.CreateFolder(locCurDir);
//				WScript.echo("36>"+locCurDir);
			}	
		}
	}
}

function getStartFolder(ACommonObjects){
	return ACommonObjects.SFSO.GetFolder(ACommonObjects.Parameters.rootSrc);
}

function getExternalArcCmd(ACommonObjects,AFileName){
	return ACommonObjects.Parameters.archExe+" \""+changeSrcToDst(ACommonObjects, AFileName)+"."+ACommonObjects.Parameters.archExt+"\" \""+AFileName+"\"";
}

function fileToArch(ACommonObjects,AFileName){
//	WScript.echo("52>"+AFileName);
//	WScript.echo("53>"+getExternalArcCmd(ACommonObjects,AFileName));
	if(ACommonObjects.Parameters.includePattern.test(AFileName) &&
	!ACommonObjects.Parameters.excludePattern.test(AFileName)){
		ACommonObjects.WSShell.Run(getExternalArcCmd(ACommonObjects,AFileName),8,true);
	}
}

function worksObjectsInFolder(ACommonObjects, AFolder){
	var locFiles=new Enumerator(AFolder.Files);
	for(;!locFiles.atEnd();locFiles.moveNext()){
		fileToArch(ACommonObjects,locFiles.item().Path);
	}
	
	var locSubFolders = new Enumerator(AFolder.SubFolders);
	for(;!locSubFolders.atEnd();locSubFolders.moveNext()){
		nextFolder(ACommonObjects,locSubFolders.item());
	}
}

function changeSrcToDst(ACommonObjects, APath){
	return ACommonObjects.Parameters.rootDst + 
		APath.substring(ACommonObjects.Parameters.rootSrc.length);
}

function nextFolder(ACommonObjects, AFolder){
	createDirRecursive(ACommonObjects,changeSrcToDst(ACommonObjects,AFolder.Path));
	worksObjectsInFolder(ACommonObjects,AFolder);
}

function main(){
	WScript.Echo("Work begin!!!");
	
	var locCommonObjects=getCommonObjects();
	
	nextFolder(locCommonObjects,getStartFolder(locCommonObjects));
	
	WScript.Echo("Work end!!!");
}