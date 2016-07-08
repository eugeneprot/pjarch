function StopDateTimeEvent(message, cause){
    this.message = message || "StopDateTimeEvent";
    this.cause = cause;
    this.name = "StopDateTimeEvent";
//    this.stack = cause.stack;
}
WScript.Echo(">>START");
try{
    try{
        WScript.Echo("1.");
        //throw new Error("Throw ERROR");
        throw new StopDateTimeEvent(" Throw SDTError");
    }
    catch(e){
        if(e.name == "StopDateTimeEvent"){
            WScript.Echo("2."+e.message);
        }else{
            throw e;
        }
    }
}
catch(e){
    WScript.Echo("3."+e.message);
}
WScript.Echo("<<STOP");
