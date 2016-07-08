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

StopDateTime.prototype.checkNoStop = function (){
    return ( this.interruptDateTime > new Date);
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

function test(AArg){
    var locSDT = new StopDateTime(AArg);
    WScript.Echo("====> "+locSDT);
    while (true){
        WScript.Echo(new Date);
        if(!locSDT.checkNoStop()) break;
        WScript.Sleep(3000);
    }
}


WScript.Echo("=== START ===");

var locSDT = new StopDateTime({Hours:11, Minutes: 40});
WScript.Echo("====> "+locSDT);
WScript.Echo("chck> "+locSDT.checkNoStop());

var locSDT2 = new StopDateTime({Hours:20, Minutes: 40});
WScript.Echo("====> "+locSDT2);
WScript.Echo("chck> "+locSDT2.checkNoStop());

var locSDT3 = new StopDateTime({Hours:7, Minutes: 15});
WScript.Echo("====> "+locSDT3);
WScript.Echo("chck> "+locSDT3.checkNoStop());

//test({Minutes:1, Seconds: 25});
//test({Seconds: 17});


WScript.Echo("==> "+new StopDateTime({Hours:11, Minutes: 40}));


WScript.Echo("=== STOP ===");

//Year:,Month:,Date:,Hours:Minutes:,Seconds