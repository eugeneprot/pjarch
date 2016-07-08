// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class RecursiveArch

// Add logfile object
function RecursiveArch(AParameters){
	this.Parameters=AParameters || new Parameters;
	this.SFSO = new ActiveXObject("Scripting.FileSystemObject");
	this.WSShell = WScript.CreateObject("WScript.Shell");
    this.WSNetwork = WScript.CreateObject("WScript.Network");
}

// Деструктор
RecursiveArch.prototype._delete_ = function (){
    for(var locKey in this){
        if((typeof(this[locKey]) != "undefined")&&(typeof(this[locKey]._delete_) != "undefined")){
            this[locKey]._delete_();
        }
    }
    return this;
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
function TooLongFilesNameEvent(message, cause){
    this.message = message || "TooLongFilesNameEvent";
    this.cause = cause;
    this.name = "TooLongFilesNameEvent";
//    this.stack = cause.stack;
}

RecursiveArch.checkLengthPath = function (APath){
    if((""+APath).length >=256){
        throw new TooLongFilesNameEvent("RecursiveArch.checkLengthPath: Too long "+APath);
    }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
function RecursiveArchError(message, cause){
    this.message = message || "RecursiveArchError";
    this.cause = cause;
    this.name = "RecursiveArchError";
//    this.stack = cause.stack;
}

RecursiveArchError.Warp=function (AObj,AFunction,APath){
    try{
        AFunction.call(AObj,APath);
//        this._createDirRecursive(APath);
    }catch(e){
        throw new RecursiveArchError("[" + e.name + ":" + e.message + ":" +APath + "]",e.cause);
    }
}

// ///////////////////////////////////////////////////////////////////////////////////////////////
// Recursive create directoris from full path
RecursiveArch.prototype.createDirRecursive=function (APath){
    RecursiveArch.checkLengthPath(APath);
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
                debugTrace(3,"RecursiveArch.createDirRecursive: Create > "+locCurDir);
			}	
		}
	}
}

RecursiveArch.prototype.getStartFolder=function (){
	return this.SFSO.GetFolder(this.Parameters.rootSrc);
}

RecursiveArch.prototype.ifFileExists=function (AFileName){
    var locReturn = true;
    if(this.SFSO.FileExists(AFileName) ){
        if(this.Parameters.overwriteExistsFile){
            var locFile = this.SFSO.GetFile(AFileName);
            locFile.Delete();
            debugTrace(3,"RecursiveArch.ifFileExists: Delete > "+AFileName);
        }else{
            locReturn = false;
            debugTrace(3,"RecursiveArch.ifFileExists: File Exists > "+AFileName);
        }
    }
    return locReturn;
}

RecursiveArch.prototype.packFile = function (AFileName){
    var locNewName = this.Parameters.changeSrcToDst(AFileName)+"."+this.Parameters.archExt;
    RecursiveArch.checkLengthPath(locNewName);
    if (this.ifFileExists(locNewName)){
        this.waitProc("7z.exe",2);
        var locRun = this.Parameters.archExe+" \""+locNewName+"\" \""+AFileName+"\"";
        this.WSShell.Run(locRun,0,false);
        debugTrace(3,"RecursiveArch.packFile: " + AFileName + " => " +locNewName);
    }
}

RecursiveArch.prototype.copyFile = function (AFileName){
    var locNewName=this.Parameters.changeSrcToDst(AFileName);
    RecursiveArch.checkLengthPath(locNewName);
    if (this.ifFileExists(locNewName)){
        var locFile = this.SFSO.GetFile(AFileName);
        locFile.Copy(locNewName);    
        debugTrace(3,"RecursiveArch.copyFile: "+AFileName+" => "+locNewName);
    }
}

RecursiveArch.prototype.fileToArch=function(AFile){
    var AFileName= AFile.Path;
    this.Parameters.checkStopEvent();
	if(this.Parameters.includePattern.test(AFileName) &&
	!this.Parameters.excludePattern.test(AFileName)){
        if(this.Parameters.withoutPackPattern.test(AFileName)){
            RecursiveArchError.Warp(this,this.copyFile,AFileName);
        }else{
            this.packFile(AFileName);
            RecursiveArchError.Warp(this,this.packFile,AFileName);
        }
	}else{
        debugTrace(3,"RecursiveArch.fileToArch: Exclude > "+AFileName);
    }
}

RecursiveArch.prototype.worksObjectsInFolder=function(AFolder){
    function _filesObj(AObj,AMethod,AEnumerator){
        for(;!AEnumerator.atEnd();AEnumerator.moveNext()){
            try{
                AMethod.call(AObj,AEnumerator.item());
            }catch(e){
                if(e.name == "RecursiveArchError"){
                    debugTrace(1,'Error: ' + e.name + ":" + e.message + ":"  + AEnumerator.item().Path);
                }else{
                    throw e;
                }
            }
        }
    }
    
    this.Parameters.checkStopEvent();
    _filesObj(this,this.fileToArch,new Enumerator(AFolder.Files));
    _filesObj(this,this.nextFolder,new Enumerator(AFolder.SubFolders));
}

RecursiveArch.prototype.nextFolder=function(AFolder){
    this.Parameters.checkStopEvent();
    RecursiveArchError.Warp(this,this.createDirRecursive,this.Parameters.changeSrcToDst(AFolder.Path));
    this.worksObjectsInFolder(AFolder);
}

RecursiveArch.prototype.run=function(){
    try{
        debugTrace(1,"RecursiveArch.prototype.run: stopDateTime > "+ this.Parameters.stopDateTime);
        this._WMI = GetObject("winmgmts:");
        this.nextFolder(this.getStartFolder());
    }
    catch(e){
        if(e.name == "StopDateTimeEvent"){
            debugTrace(1,"RecursiveArch.nextFolder: stopDateTime " + e.name + ":" + e.message);
        }else{
            throw e;
        }
    }
    return this;
}

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

RecursiveArch.prototype.waitProc = function (AProcName, AMaxProcCount){
    while(this.countProc(AProcName)>=AMaxProcCount){
        WScript.Sleep(500);
    }
}
