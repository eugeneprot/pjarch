// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class NetworkDrive 

function NetworkDrive(AArguments){
    this.LocalName  = AArguments.LocalName ; // Как задано пользователем
    this.RemoteName = AArguments.RemoteName; // Должно определяться пользователем всегда
    this.User       = AArguments.User      ;
    this.Password   = AArguments.Password  ;
    
    this._LocalName  = this.LocalName; // Определяется, если LocalName = undefined
    this._OwnMapping = false     ; // True - если маппинг был произведен этим объектом, False - если был найден подходящий
}

NetworkDrive.FirstDiskLetter = "C";
NetworkDrive.LastDiskLetter = "Z";
NetworkDrive.FirstDiskLetterCode = NetworkDrive.FirstDiskLetter.charCodeAt();
NetworkDrive.LastDiskLetterCode = NetworkDrive.LastDiskLetter.charCodeAt();

// Вернуть первую свободную букву дисков
// Обрабатывает в обратном порядке
NetworkDrive.getFreeLetter = function (){
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
    return locReturn;
}

// Типа "деструктор"
NetworkDrive.prototype._delete_ = function (){
    this.RemoveNetworkDrive();
    return this;
}

NetworkDrive.prototype._MakeNetworkDrive=function (){
    var WshNetwork = WScript.CreateObject("WScript.Network");   
    WshNetwork.MapNetworkDrive (this, this.RemoteName,this.UpdateProfile,this.User,this.Password);
    this._OwnMapping = true;
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
    debugTrace(1,"WshNetwork.MapNetworkDrive: "+ this + " => " + this.RemoteName );
    return this;
}

NetworkDrive.prototype.RemoveNetworkDrive=function (){
    if (this._OwnMapping){
        var WshNetwork = WScript.CreateObject("WScript.Network");
        WshNetwork.RemoveNetworkDrive (this);
        this._OwnMapping = false;
    }
    debugTrace(1,"WshNetwork.RemoveNetworkDrive: "+ this + " <=> " + this.RemoteName );
    return this;
}

NetworkDrive.prototype.toString=function (){
    var locReturn = this._LocalName;
    if(! /:$/i.test(locReturn)) locReturn+=":";
    return locReturn;
}
