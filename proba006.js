function debugTrace(AStr){
    if (typeof(__debug__) != "undefined"){
        WScript.Echo(AStr);
    }
}

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

// ///////////////////////////////////////////////////////////////////

function test(AFileName,AText){
    debugTrace("test == BEGIN == " +AFileName);
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var a = fs.CreateTextFile(AFileName, true);
    a.WriteLine(""+AFileName+(new Date));
    a.WriteLine(""+AText);
    a.Close();
    debugTrace("test == END == ");
}

//var __debug__ = true;

var netDrive=new NetworkDrive("N","\\\\TURNKEYFS001\\arch_in_direction","direction","1qazXSW@");
netDrive.MakeNetworkDrive();
test(netDrive + "\\proba.txt","PROBA PROBA PROBA");

var netDrive2=new NetworkDrive(undefined,"\\\\TURNKEYFS001\\arch_in_direction","direction","1qazXSW@");
netDrive2.MakeNetworkDrive();

test(netDrive2 + "\\proba2.txt","PROBA PROBA PROBA");
netDrive2.RemoveNetworkDrive();
netDrive.RemoveNetworkDrive();

var netDrive3=new NetworkDrive(undefined,"\\\\TURNKEYFS001\\arch_in_constructors","constructors","2wsxZAQ!");
netDrive3.MakeNetworkDrive();
test(netDrive3 + "\\proba3.txt","PROBA PROBA PROBA");
netDrive3.RemoveNetworkDrive();

/*
WScript.Echo("Free:"+NetworkDrive.getFreeLetter());

WScript.Echo("URL:"+NetworkDrive.getUrlForLetter("C"));
WScript.Echo("URL:"+NetworkDrive.getUrlForLetter("D"));
WScript.Echo("URL:"+NetworkDrive.getUrlForLetter("E"));
WScript.Echo("URL:"+NetworkDrive.getUrlForLetter("F"));
WScript.Echo("URL:"+NetworkDrive.getUrlForLetter("G"));
WScript.Echo("URL:"+NetworkDrive.getUrlForLetter("H"));
WScript.Echo("URL:"+NetworkDrive.getUrlForLetter("L"));
WScript.Echo("URL:"+NetworkDrive.getUrlForLetter("Z"));

WScript.Echo("Disk:"+NetworkDrive.getLetterForUrl("\\\\vdmmain\\groups"));
WScript.Echo("Disk:"+NetworkDrive.getLetterForUrl("\\\\vdmmain\\grps"));
*/