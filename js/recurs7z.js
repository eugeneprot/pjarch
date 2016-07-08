
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
