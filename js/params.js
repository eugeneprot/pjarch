// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class Parameters 

function Parameters(AArguments){
    this.changeRootSrc(AArguments.rootSrc || "");
    this.changeRootDst(AArguments.rootDst || "");
	this.archExe = AArguments.archExe || "\"C:\\Program Files\\7\-Zip\\7z.exe\" a \-y \-ssw \-t7z ";
	this.archExt = AArguments.archExt || "7z";
	this.setIncludePattern(AArguments.includePattern || /.*/i);
	this.setExcludePattern(AArguments.excludePattern || /\.(bin|tmp|bak|exe|com|js|bat|cmd|dll|bin|vault|mp.*|avi|wav)$/i);
    this.setWithoutPackPattern(AArguments.withoutPackPattern || /\.(jpg|jpeg|rar|djvu|png|zip|7z)$/i);
    this.overwriteExistsFile = (AArguments.overwriteExistsFile || false);
    this.stopDateTime = AArguments.stopDateTime;
}

// Типа "деструктор"
Parameters.prototype._delete_ = function (){
    for(var locKey in this){
        if((typeof(this[locKey]) != "undefined")&&(typeof(this[locKey]._delete_) != "undefined")){
            this[locKey]._delete_();
        }
    }
    return this;
}

Parameters.prototype.changeRootSrc=function (ARootSrc){
	this.rootSrc = (""+ARootSrc).replace(/\\$/,""); // delete symbol \ if this last char in string
	return this;
}

Parameters.prototype.checkNoStop = function (){
    return (
        (typeof(this.stopDateTime)=="undefined")||
        (this.stopDateTime.checkNoStop())
    );
}

Parameters.prototype.checkStopEvent = function (){
    if (typeof(this.stopDateTime)!="undefined"){
        this.stopDateTime.checkStopEvent();
    }
    return this;
}

Parameters.prototype.changeRootDst=function (ARootDst){
	this.rootDst = (""+ARootDst).replace(/\\$/,"");
	return this;
}

Parameters.prototype.changeSrcToDst=function (APath){
	return this.rootDst + APath.substring(this.rootSrc.length);
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
