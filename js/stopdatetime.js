// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class StopDateTime 

function StopDateTime(AArguments){
    this.Year    = AArguments.Year   ;
    this.Month   = AArguments.Month  ;
    this.Date    = AArguments.Date   ;
    this.Hours   = AArguments.Hours  ;
    this.Minutes = AArguments.Minutes;
    this.Seconds = AArguments.Seconds;
 
    var locNow = new Date;
    this.interruptDateTime = new Date(
        (this.Year    != undefined) ? this.Year    : locNow.getFullYear(),
        (this.Month   != undefined) ? this.Month   : locNow.getMonth()   ,
        (this.Date    != undefined) ? this.Date    : locNow.getDate()    ,
        (this.Hours   != undefined) ? this.Hours   : locNow.getHours()   ,
        (this.Minutes != undefined) ? this.Minutes : locNow.getMinutes() ,
        (this.Seconds != undefined) ? this.Seconds : locNow.getSeconds() 
    );
 
    if (this.interruptDateTime <= (new Date)){
        if(this.Year != undefined);
        else if(this.Month   != undefined) this.interruptDateTime.setYear(this.interruptDateTime.getFullYear()+1);
        else if(this.Date    != undefined) this.interruptDateTime.setMonth(this.interruptDateTime.getMonth()+1);
        else if(this.Hours   != undefined) this.interruptDateTime.setDate(this.interruptDateTime.getDate()+1);
        else if(this.Minutes != undefined) this.interruptDateTime.setHours(this.interruptDateTime.getHours()+1);
        else if(this.Seconds != undefined) this.interruptDateTime.setMinutes(this.interruptDateTime.getMinutes()+1);
    }
}

function StopDateTimeEvent(message, cause){
    this.message = message || "StopDateTimeEvent";
    this.cause = cause;
    this.name = "StopDateTimeEvent";
//    this.stack = cause.stack;
}

StopDateTime.prototype.checkNoStop = function (){
    return ( this.interruptDateTime > new Date);
}

StopDateTime.prototype.checkStopEvent = function (){
    if(this.interruptDateTime <= new Date) 
        throw new StopDateTimeEvent(""+this.toString());
    return this;
}

StopDateTime.prototype.toString = function (){
    return "> " +this.interruptDateTime+ " " + 
        ((this.Year    != undefined) ? this.Year    : "*") + " " +
        ((this.Month   != undefined) ? this.Month   : "*") + " " +
        ((this.Date    != undefined) ? this.Date    : "*") + " " +
        ((this.Hours   != undefined) ? this.Hours   : "*") + " " +
        ((this.Minutes != undefined) ? this.Minutes : "*") + " " +
        ((this.Seconds != undefined) ? this.Seconds : "*") ;
}
