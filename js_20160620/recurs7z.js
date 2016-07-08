// ///////////////////////////////////////////////////////////////////////////////////////////////
function debugTrace(ALevel, AStr){
//    if (typeof(__debug__) != "undefined"){
    if (typeof(__debug__) == "number"){
        if(__debug__ >= ALevel)
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
    debugTrace(5, "pathSplit: "+APath);
    var locReturn=undefined;
    //console.dir("\\\\abc\\def\\".match(/^((?:[a-z]:)|(?:\\\\))\\?([^\\].*[^\\])?\\?$/i))
    var locResult=APath.match(/^((?:[a-z]:)|(?:\\\\))\\?([^\\].*[^\\])?\\?$/i);
    debugTrace(9,"pathSplit 31: "+locResult);
    if(locResult){
        debugTrace(9,"pathSplit 33: ");
        locReturn = new Array;
        locReturn.push(locResult[1]); // добавляем диск
        debugTrace(9,"pathSplit 36: "+locReturn);
        if (locResult[2]){
            debugTrace(9,"pathSplit 38: "+locResult[2]);
            locReturn=locReturn.concat(locResult[2].split("\\"));
            debugTrace(9,"pathSplit 40: "+locReturn);
        }
    }
    debugTrace(5,"pathSplit locReturn: "+locReturn);
    return locReturn;
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class Template 
function Template(ATemplate, AArguments){
    debugTrace(5,"Template:"+ATemplate);
    this.init(AArguments);
    this.setTemplate(ATemplate);
}

// Инициализация предопределенных параметров
Template.prototype._init = function (){
    // Предопределенные параметры
    this._date = new Date;
//    this._date.getWeek = (function (ADate){
//            var locW=Math.floor((ADate - (new Date(ADate.getFullYear(),0,1))) / (7*24*60*60*1000));
//            return function (){return locW;}
//        }(this._date));
    this._date.getWeek = (function (){
            return function (){return Math.floor((this - (new Date(this.getFullYear(),0,1))) / (7*24*60*60*1000));}
        }());
    return this;
}

// Инициализация параметров 
Template.prototype.init = function (AArguments){
    debugTrace(5,"Template.prototype.init:");
    this._init();
    // Параметры пользователя
    // 
    var locO = AArguments || {};
    for(var locKey in locO){
        this[locKey.toUpperCase()] = locO[locKey];
    }
    return this;
}

Template.prototype.reInit = function (AArguments){
    debugTrace(5,"Template.prototype.reInit:");
    this.init(AArguments);
    this.setTemplate();
    return this;
}

Template.prototype.getParameterDate = function (AParameter){
    var locResult;
    switch (AParameter) {
    case "YEAR"    : locResult = this._date.getFullYear(); break;
    case "MONTH"   : locResult = this._date.getMonth()   ; break;
    case "WEEK"    : locResult = this._date.getWeek()    ; break;
    case "DATE"    : locResult = this._date.getDate()    ; break;
    case "DAY"     : locResult = this._date.getDay()     ; break;
    case "HOURS"   : locResult = this._date.getHours()   ; break;
    case "MINUTES" : locResult = this._date.getMinutes() ; break;
    case "SECONDS" : locResult = this._date.getSeconds() ; break;
    default:
        break;
    }
    return locResult;
}

Template.prototype.getParameter = function (AParameter){
    debugTrace(5,"Template.prototype.getParameter:"+AParameter);
    // Обрезаем в начале {$ и в конце }
    var locParameter = AParameter.slice(2,-1).toUpperCase(); 
    return "" + (
        this[locParameter] || 
        this.getParameterDate(locParameter) || 
        AParameter
    );
}

Template.prototype.setTemplate = function (ATemplate){
    debugTrace(5,"Template.prototype.setTemplate:"+ATemplate);
    this._Template = ATemplate || this._Template || "";
    this._Str = this.applyTemplate();
    debugTrace(5,"Template.prototype.setTemplate._Str:"+this._Str);
    return this;
}

Template.prototype.toString = function (){
    debugTrace(5,"Template.prototype.toString:" + this._Str);
    return this._Str;
}

Template.prototype.applyTemplate = function (ATemplate){
    debugTrace(5,"Template.prototype.applyTemplate:"+ATemplate);
    var locTemplate = ATemplate || this._Template;
    var locReg = /\{\$[A-Z0-9_]+\}/ig;
    var locRes ;
    var locLastIndex=0;
    var locResult = "";
    while ((locRes=locReg.exec(locTemplate)) != null){
        locResult += locTemplate.slice(locLastIndex,locRes.index);
        locResult += this.getParameter(locTemplate.slice(locRes.index,locReg.lastIndex));
        locLastIndex = locReg.lastIndex;
    }
    locResult += locTemplate.slice(locLastIndex);
    return locResult;
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class NetworkDrive 

//function NetworkDrive(ALocalName,ARemoteName,AUser,APassword){
//    this.LocalName = ALocalName; // Как задано пользователем
//    this.RemoteName = ARemoteName; // Должно определяться пользователем всегда
//    this.User = AUser;
//    this.Password = APassword;
//    
//    this._LocalName = ALocalName; // Определяется, если LocalName = undefined
//    this._OwnMapping = false; // True - если маппинг был произведен этим объектом, False - если был найден подходящий
//}

function NetworkDrive(AArguments){
    this.LocalName  = AArguments.LocalName ; // Как задано пользователем
    this.RemoteName = AArguments.RemoteName; // Должно определяться пользователем всегда
    this.User       = AArguments.User      ;
    this.Password   = AArguments.Password  ;
    
    this._LocalName  = ALocalName; // Определяется, если LocalName = undefined
    this._OwnMapping = false     ; // True - если маппинг был произведен этим объектом, False - если был найден подходящий
}

NetworkDrive.FirstDiskLetter = "C";
NetworkDrive.LastDiskLetter = "Z";
NetworkDrive.FirstDiskLetterCode = NetworkDrive.FirstDiskLetter.charCodeAt();
NetworkDrive.LastDiskLetterCode = NetworkDrive.LastDiskLetter.charCodeAt();

// Вернуть первую свободную букву дисков
// Обрабатывает в обратном порядке
NetworkDrive.getFreeLetter = function (){
    debugTrace(5,"getFreeLetter: == BEGIN == ");
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
    debugTrace(5,"getFreeLetter: "+locReturn);
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
    debugTrace(5,"getUrlForLetter: "+ALocalName+" = "+locReturn);
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
    debugTrace(5,"getLetterForUrl: "+locReturn);
    return locReturn;
}

// Типа "деструктор"
NetworkDrive.prototype._delete_ = function (){
    debugTrace(5,"NetworkDrive.prototype._delete_ == BEGIN ==");
    this.RemoveNetworkDrive();
    debugTrace(5,"NetworkDrive.prototype._delete_ == BEGIN ==");
    return this;
}

NetworkDrive.prototype._MakeNetworkDrive=function (){
    var WshNetwork = WScript.CreateObject("WScript.Network");   
    WshNetwork.MapNetworkDrive (this, this.RemoteName,this.UpdateProfile,this.User,this.Password);
    this._OwnMapping = true;
    debugTrace(5,"MapNetworkDrive: "+ this._LocalName +" => "+ this.RemoteName +" Own: " +this._OwnMapping);
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
    debugTrace(1,"MakeNetworkDrive: "+this._LocalName + " <-> " + this.RemoteName);
    return this;
}

NetworkDrive.prototype.RemoveNetworkDrive=function (){
    if (this._OwnMapping){
        var WshNetwork = WScript.CreateObject("WScript.Network");
        WshNetwork.RemoveNetworkDrive (this);
        debugTrace(1,"RemoveNetworkDrive: "+this._LocalName);
        this._OwnMapping = false;
    }
    debugTrace(1,"RemoveNetworkDrive == END == ");
    return this;
}

NetworkDrive.prototype.toString=function (){
    var locReturn = this._LocalName;
    if(! /:$/i.test(locReturn)) locReturn+=":";
    return locReturn;
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class StopDateTime 
function StopDateTime(AArguments){
    this.Year    = AArguments.Year   ;
    this.Month   = AArguments.Month  ;
    this.Date    = AArguments.Date   ;
    this.Hours   = AArguments.Hours  ;
    this.Minutes = AArguments.Minutes;
    this.Seconds = AArguments.Seconds;
}

StopDateTime.prototype.checkStop=function (){
    var locCurDate = new Date;
    var locCheckDate = new Date(
        (this.Year    != undefined) ? this.Year    : locCurDate.getFullYear(),
        (this.Month   != undefined) ? this.Month   : locCurDate.getMonth()   ,
        (this.Date    != undefined) ? this.Date    : locCurDate.getDate()    ,
        (this.Hours   != undefined) ? this.Hours   : locCurDate.getHours()   ,
        (this.Minutes != undefined) ? this.Minutes : locCurDate.getMinutes() ,
        (this.Seconds != undefined) ? this.Seconds : locCurDate.getSeconds() 
    )
    return locCheckDate <= locCurDate;
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class Parameters 

//function Parameters(ARootSrc,ARootDst,AWithDateStamp){
//	this.changeRoots(ARootSrc,ARootDst,AWithDateStamp);
//	this.archExe = "\"C:\\Program Files\\7\-Zip\\7z.exe\" a \-y \-ssw \-t7z ";
//	this.archExt = "7z";
//	this.setIncludePattern(/.*/i);
//	this.setExcludePattern(/\.(tmp|bak|exe|com|js|bat|cmd|dll|bin|vault)$/i);
//    this.setWithoutPackPattern(/\.(jpg|jpeg|rar|djvu|png|zip|7z)$/i);
//    this.overwriteExistsFile = false;
//}

function Parameters(AArguments){
	this.changeRoots(
        AArguments.rootSrc || "",
        AArguments.rootDst || "",
        AArguments.withDateStamp && true
    );
	this.archExe = AArguments.archExe || "\"C:\\Program Files\\7\-Zip\\7z.exe\" a \-y \-ssw \-t7z ";
	this.archExt = AArguments.archExt || "7z";
	this.setIncludePattern(AArguments.includePattern || /.*/i);
	this.setExcludePattern(AArguments.excludePattern || /\.(tmp|bak|exe|com|js|bat|cmd|dll|bin|vault)$/i);
    this.setWithoutPackPattern(AArguments.withoutPackPattern || /\.(jpg|jpeg|rar|djvu|png|zip|7z)$/i);
    this.overwriteExistsFile = (AArguments.overwriteExistsFile || false);
    this.stopDateTime = AArguments.stopDateTime;
}

// Типа "деструктор"
Parameters.prototype._delete_ = function (){
    debugTrace(5,"Parameters.prototype._delete_ == BEGIN ==");
    if(typeof(this.rootSrc._delete_)!="undefined"){
        this.rootSrc._delete_();
    }
    if(typeof(this.rootDst._delete_)!="undefined"){
        this.rootDst._delete_();
    }
    debugTrace(5,"Parameters.prototype._delete_ == END ==");
    return this;
}

Parameters.prototype.changeRoots=function (ARootSrc,ARootDst,AWithDateStamp){
	this.setDateStamp(AWithDateStamp);
	this.rootSrc = ARootSrc; // delete symbol \ if this last char in string
	this.rootDst = ARootDst;
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

Parameters.prototype.setWithoutPackPattern = function (APattern){
    this.withoutPackPattern = APattern;
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

RecursiveArch.prototype._delete_ = function (){
    debugTrace(5,"RecursiveArch.prototype._delete_ == BEGIN ==");
    if(typeof(this.Parameters._delete_)!="undefined"){
        this.Parameters._delete_();
    }
    debugTrace(5,"RecursiveArch.prototype._delete_ == END ==");
    return this;
}

RecursiveArch.prototype.changeSrcToDst=function (APath){
	return this.Parameters.rootDst + this.Parameters.getDateStamp() +
		APath.substring(this.Parameters.rootSrc.length);
}

// Recursive create directoris from full path
RecursiveArch.prototype.createDirRecursive=function (APath){
    debugTrace(1,"RecursiveArch.prototype.createDirRecursive: "+APath);
	if (! this.SFSO.FolderExists(APath)){
        debugTrace(9,"RecursiveArch.prototype.createDirRecursive 263: "+APath);
		var locDirs=pathSplit(APath);
		var locCurDir=locDirs[0];// если undefined вызывется исключение
        debugTrace(9,"RecursiveArch.prototype.createDirRecursive 266: "+locCurDir);
		for(var i=1;i<locDirs.length;i++){
            if(! /\\$/i.test(locCurDir)){
                locCurDir+="\\";
            }
			locCurDir+=locDirs[i];
            debugTrace(9,"RecursiveArch.prototype.createDirRecursive 272: "+locCurDir);
			if (! this.SFSO.FolderExists(locCurDir)){
                debugTrace(9,"RecursiveArch.prototype.createDirRecursive 274: "+locCurDir);
				this.SFSO.CreateFolder(locCurDir);
			}	
		}
	}
}

RecursiveArch.prototype.getStartFolder=function (){
	return this.SFSO.GetFolder(this.Parameters.rootSrc);
}


RecursiveArch.prototype.ifFileExists=function (AFileName){
    var locReturn = true;
    debugTrace(5,"RecursiveArch.prototype.ifFileExists: " + AFileName);
    if(this.SFSO.FileExists(AFileName) ){
        if(this.Parameters.overwriteExistsFile){
            debugTrace(5,"RecursiveArch.prototype.ifFileExists: Delete file "+AFileName);
            var locFile = this.SFSO.GetFile(AFileName);
            locFile.Delete();
        }else{
            locReturn = false;
        }
    }
    return locReturn;
}

RecursiveArch.prototype.packFile = function (AFileName){
    var locNewName = this.changeSrcToDst(AFileName)+"."+this.Parameters.archExt;
    debugTrace(1,"RecursiveArch.prototype.packFile: "+AFileName +" ==> "+locNewName);
    if (this.ifFileExists(locNewName)){
        this.waitProc("7z.exe",2);
        var locRun = this.Parameters.archExe+" \""+locNewName+"\" \""+AFileName+"\"";
        debugTrace(5,"RecursiveArch.prototype.packFile: "+locRun);
        this.WSShell.Run(locRun,0,false);
    }
}

RecursiveArch.prototype.copyFile = function (AFileName){
    var locNewName=this.changeSrcToDst(AFileName);
    debugTrace(1,"RecursiveArch.prototype.copyFile: "+AFileName+" ==> "+locNewName);
    if (this.ifFileExists(locNewName)){
        var locFile = this.SFSO.GetFile(AFileName);
        locFile.Copy(locNewName);    
    }
}

RecursiveArch.prototype.fileToArch=function(AFileName){
    debugTrace(1,"RecursiveArch.prototype.fileToArch: "+AFileName);
	if(this.Parameters.includePattern.test(AFileName) &&
	!this.Parameters.excludePattern.test(AFileName)){
        if(this.Parameters.withoutPackPattern.test(AFileName)){
            this.copyFile(AFileName);
        }else{
            this.packFile(AFileName);
        }
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
    this._WMI = GetObject("winmgmts:");
	this.nextFolder(this.getStartFolder());
    return this;
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

//https://habrahabr.ru/post/81657/
// подключаем средства WMI
//WMI = GetObject("winmgmts:");
// ищем процесс с заданным именем и задаем ему низкий приоритет
/*
function lowPrior(procName)
{

result = WMI.ExecQuery("SELECT * FROM Win32_Process Where Name = '"+procName+"'");
var IDLE = 64;
var colCS = new Enumerator(result);
for (; !colCS.atEnd(); colCS.moveNext())
colCS.item().SetPriority(IDLE);
}
*/
// функция, которая смотрит сколько выполняется процессов с заданным именем
RecursiveArch.prototype.countProc = function (procName)
{
var result = this._WMI.ExecQuery("SELECT * FROM Win32_Process Where Name = '"+procName+"'");
var colCS = new Enumerator(result);
var j = 0;
for (; !colCS.atEnd(); colCS.moveNext())
j++;
return j;
}
/*
while (1)
{
// с промежутком в 5 сек проверяем - пора ли начинать бэкап
WScript.Sleep(5000);
}
*/
RecursiveArch.prototype.waitProc = function (AProcName, AMaxProcCount){
    while(this.countProc(AProcName)>=AMaxProcCount){
        WScript.Sleep(5000);
    }
}
