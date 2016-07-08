// ///////////////////////////////////////////////////////////////////////////////////////////////
function debugTrace(AStr){
    if (typeof(__debug__) != "undefined"){
        WScript.Echo(AStr);
    }
}

function f(n) {
	// Format integers to have at least two digits.
	return n < 10
		? "0" + n
		: n;
}

function dateTimeToStr(ADate){
	var locDate = ADate || new Date();
	return "" +
		locDate.getFullYear() +
		f(locDate.getMonth()+1) +
		f(locDate.getDate()) +
		f(locDate.getHours()) +
		f(locDate.getMinutes()) +
		f(locDate.getSeconds()) ;
}

function pathSplit(APath){
    var locReturn=undefined;
    //console.dir("\\\\abc\\def\\".match(/^((?:[a-z]:)|(?:\\\\))\\?([^\\].*[^\\])?\\?$/i))
    var locResult=APath.match(/^((?:[a-z]:)|(?:\\\\))\\?([^\\].*[^\\])?\\?$/i);
    if(locResult){
        locReturn = new Array;
        locReturn.push(locResult[1]); // добавляем диск
        if (locResult[2]){
            locReturn.concat(locResult[2].split("\\"));
        }
    }
    return locReturn;
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class NetworkDrive 
function NetworkDrive(ALocalName,ARemoteName,AUser,APassword){
    this.LocalName = ALocalName; // Как задано пользователем
    this._LocalName = ALocalName; // Определяется, если LocalName = undefined
    this.RemoteName = ARemoteName; // Должно определяться пользователем всегда
    this.User = AUser;
    this.Password = APassword;
    this._OwnMapping = false; // True - если маппинг был произведен этим объектом, False - если был найден подходящий
}

NetworkDrive.FirstDiskLetter = "C";
NetworkDrive.LastDiskLetter = "Z";
NetworkDrive.FirstDiskLetterCode = NetworkDrive.FirstDiskLetter.charCodeAt();
NetworkDrive.LastDiskLetterCode = NetworkDrive.LastDiskLetter.charCodeAt();

// Вернуть первую свободную букву дисков
// Обрабатывает в обратном порядке
NetworkDrive.getFreeLetter = function (){
    debugTrace("getFreeLetter: == BEGIN == ");
    var locReturn = undefined;
    var locFSO = new ActiveXObject("Scripting.FileSystemObject");
    var curLetterCode;
    try{
        for(curLetterCode=NetworkDrive.LastDiskLetterCode;
            curLetterCode>=NetworkDrive.FirstDiskLetterCode;
            curLetterCode--){
            var locDrive = locFSO.GetDrive(String.fromCharCode(curLetterCode));
        }
    }catch(e){
        locReturn = String.fromCharCode(curLetterCode);
    }
    debugTrace("getFreeLetter: "+locReturn);
    return locReturn;
}

// Вернуть URL который смаппин на заданный диск
// Если диск локальный, то возвращается ПустаяСтрока
// Если диск не определен в системе, возвращается undefined
NetworkDrive.getUrlForLetter = function (ALocalName){
    var locReturn = undefined;
    var locFSO = new ActiveXObject("Scripting.FileSystemObject");
    var locDrive;
    try{
        locDrive=locFSO.GetDrive(ALocalName);
        if(locDrive.DriveType == 3){// Network
            locReturn = locDrive.ShareName;
        }else{
            locReturn = "";
        }
    }catch(e){
    }
    debugTrace("getUrlForLetter: "+ALocalName+" = "+locReturn);
    return locReturn;
}

// Найти диск на который смаппин заданный URL
// если необходимый диск не находится, то возвращается undefined
NetworkDrive.getLetterForUrl = function (ARemoteName){
    var locReturn = undefined;
    var locDrives = new Enumerator(new ActiveXObject("Scripting.FileSystemObject").Drives);
    locDrives.moveFirst();
    for (;!locDrives.atEnd();locDrives.moveNext()){
        var locDrive = locDrives.item();
        if (locDrive.DriveType==3 && locDrive.ShareName.toUpperCase() == ARemoteName.toUpperCase()){
                locReturn = locDrive.DriveLetter;
                break;
        }
    }
    debugTrace("getLetterForUrl: "+locReturn);
    return locReturn;
}

NetworkDrive.prototype._MakeNetworkDrive=function (){
    var WshNetwork = WScript.CreateObject("WScript.Network");   
    WshNetwork.MapNetworkDrive (this, this.RemoteName,this.UpdateProfile,this.User,this.Password);
    this._OwnMapping = true;
    debugTrace("MapNetworkDrive: "+ this._LocalName +" => "+ this.RemoteName +" Own: " +this._OwnMapping);
    return this;
}

NetworkDrive.prototype.MakeNetworkDrive=function (){
    var bUpdateProfile=false;
    if(this.LocalName){// Если пользователь задал конкретный диск
        var locUrl = NetworkDrive.getUrlForLetter(this.LocalName);
        if(locUrl != this.RemoteName){// проверить закрывающий слэш
            if(locUrl==""){ // заданный диск локальный Паника!!!
                throw new Error("Disk is local");
            }else if(locUrl==undefined){// Нужно сделать маппинг
                this._MakeNetworkDrive();
            }else {// диск привязан к другому пути Паника!!!
                throw new Error("Disk maps to other URL");
            }
        }
    }else{ // если задан только URL
        var locLetter = NetworkDrive.getLetterForUrl(this.RemoteName);
        if(locLetter == undefined){
            this._LocalName = NetworkDrive.getFreeLetter();
            if (this._LocalName != undefined){// делаем маппинг
                this._MakeNetworkDrive();
            }
        }else{ // Url уже смаппин, воспользуемся им
            this._LocalName = locLetter;
        }
    }
    debugTrace("MakeNetworkDrive: "+this._LocalName + " <-> " + this.RemoteName);
    return this;
}

NetworkDrive.prototype.RemoveNetworkDrive=function (){
    if (this._OwnMapping){
        var WshNetwork = WScript.CreateObject("WScript.Network");
        WshNetwork.RemoveNetworkDrive (this);
        debugTrace("RemoveNetworkDrive: "+this._LocalName);
        this._OwnMapping = false;
    }
    debugTrace("RemoveNetworkDrive == END == ");
    return this;
}

NetworkDrive.prototype.toString=function (){
    var locReturn = this._LocalName;
    if(! /:$/i.test(locReturn)) locReturn+=":";
    return locReturn;
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class Parameters 
function Parameters(ARootSrc,ARootDst,AWithDateStamp){
	this.changeRoots(ARootSrc,ARootDst,AWithDateStamp);
	this.archExe = "\"C:\\Program Files\\7\-Zip\\7z.exe\" a \-y \-ssw \-t7z ";
	this.archExt = "7z";
	this.setIncludePattern(/.*/ig);
	this.setExcludePattern(/\.(jpg|png|zip)$/);
}

Parameters.prototype.changeRoots=function (ARootSrc,ARootDst,AWithDateStamp){
	this.setDateStamp(AWithDateStamp);
	this.rootSrc=ARootSrc; // delete symbol \ if this last char in string
	this.rootDst=ARootDst;
	return this;
}

Parameters.prototype.setDateStamp=function (AWithDateStamp){
	this.withDateStamp=Boolean(AWithDateStamp) ;
	this.dateStamp=dateTimeToStr();
	return this;
}

Parameters.prototype.getDateStamp=function (){
	var locRet="";
	if (this.withDateStamp){
		locRet="\\"+this.dateStamp;
	}
	return locRet;
}

Parameters.prototype.setIncludePattern=function (APattern){
	this.includePattern=APattern;
	return this;
}

Parameters.prototype.setExcludePattern=function (APattern){
	this.excludePattern=APattern;
	return this;
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class RecursiveArch
// Add logfile object
function RecursiveArch(AParameters){
	this.Parameters=AParameters || new Parameters;
	this.SFSO = new ActiveXObject("Scripting.FileSystemObject");
	this.WSShell = WScript.CreateObject("WScript.Shell");
    this.WSNetwork = WScript.CreateObject("WScript.Network");
}

RecursiveArch.prototype.changeSrcToDst=function (APath){
	return this.Parameters.rootDst + this.Parameters.getDateStamp() +
		APath.substring(this.Parameters.rootSrc.length);
}

// Recursive create directoris from full path
RecursiveArch.prototype.createDirRecursive=function (APath){
	if (! this.SFSO.FolderExists(APath)){
		var locDirs=pathSplit(APath);
		var locCurDir=locDirs[0];// если undefined вызывется исключение
		for(var i=1;i<locDirs.length;i++){
            if(! /\\$/i.test(locCurDir)){
                locCurDir+="\\";
            }
			locCurDir+=locDirs[i];
			if (! this.SFSO.FolderExists(locCurDir)){
				this.SFSO.CreateFolder(locCurDir);
			}	
		}
	}
}

RecursiveArch.prototype.getStartFolder=function (){
	return this.SFSO.GetFolder(this.Parameters.rootSrc);
}

RecursiveArch.prototype.getExternalArcCmd=function (AFileName){
	return this.Parameters.archExe+" \""+this.changeSrcToDst(AFileName)+"."+this.Parameters.archExt+"\" \""+AFileName+"\"";
}

RecursiveArch.prototype.fileToArch=function(AFileName){
	if(this.Parameters.includePattern.test(AFileName) &&
	!this.Parameters.excludePattern.test(AFileName)){
		this.WSShell.Run(this.getExternalArcCmd(AFileName),0,true);
	}
}

RecursiveArch.prototype.worksObjectsInFolder=function(AFolder){
	var locFiles=new Enumerator(AFolder.Files);
	for(;!locFiles.atEnd();locFiles.moveNext()){
		this.fileToArch(locFiles.item().Path);
	}
	
	var locSubFolders = new Enumerator(AFolder.SubFolders);
	for(;!locSubFolders.atEnd();locSubFolders.moveNext()){
		this.nextFolder(locSubFolders.item());
	}
}

RecursiveArch.prototype.nextFolder=function(AFolder){
	this.createDirRecursive(this.changeSrcToDst(AFolder.Path));
	this.worksObjectsInFolder(AFolder);
}

RecursiveArch.prototype.run=function(){
	this.nextFolder(this.getStartFolder());
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
/*
function main(){
	WScript.Echo("Work begin!!!");
	
//	var locCommonObjects=new RecursiveArch(getParameters());
//	var locCommonObjects=new RecursiveArch(new Parameters("D:\\prot\\pjarch\\proba\\src","D:\\prot\\pjarch\\proba\\dst"));
	
//	locCommonObjects.run();
	
	new RecursiveArch(new Parameters("D:\\prot\\pjarch\\proba\\src","D:\\prot\\pjarch\\proba\\dst")).run();
	
	WScript.Echo("Work end!!!");
}
*/