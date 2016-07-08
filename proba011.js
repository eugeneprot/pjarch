function DateTimeInc(AArguments){
    if (AArguments.constructor === Date){
        this.Year    = AArguments.getFullYear();
        this.Month   = AArguments.getMonth()   ;
        this.Date    = AArguments.getDate()    ;
        this.Hours   = AArguments.getHours()   ;
        this.Minutes = AArguments.getMinutes() ;
        this.Seconds = AArguments.getSeconds() ;
    }else{
        var locDateTime = AArguments.DateTime || new Date;
        this.Year    = (AArguments.Year    != undefined) ? AArguments.Year    : locDateTime.getFullYear();
        this.Month   = (AArguments.Month   != undefined) ? AArguments.Month   : locDateTime.getMonth()   ;
        this.Date    = (AArguments.Date    != undefined) ? AArguments.Date    : locDateTime.getDate()    ;
        this.Hours   = (AArguments.Hours   != undefined) ? AArguments.Hours   : locDateTime.getHours()   ;
        this.Minutes = (AArguments.Minutes != undefined) ? AArguments.Minutes : locDateTime.getMinutes() ;
        this.Seconds = (AArguments.Seconds != undefined) ? AArguments.Seconds : locDateTime.getSeconds() ;
    }
}

DateTimeInc.prototype.getDateTime = function (){
    return new Date(
        this.Year    ,   
        this.Month   ,   
        this.Date    ,   
        this.Hours   ,   
        this.Minutes ,   
        this.Seconds    
    );
}

DateTimeInc.prototype.IncYear    = function (){
    this.Year++;
    return this;
}
DateTimeInc.prototype.IncMonth   = function (){ // 0-11
    if(this.Month < 11){ this.Month++;}
    else{ this.Month = 0; this.IncYear();}
    return this;
}
DateTimeInc.prototype.IncDate    = function (){// 1-(28,29,30,31)??
    //???
    return this;
}
DateTimeInc.prototype.IncHours   = function (){ // 00-23
    if(this.Hours < 23){ this.Hours++;}
    else{ this.Hours = 0; this.IncDate();}
    return this;
}
DateTimeInc.prototype.IncMinutes = function (){ // 00-59
    if(this.Minutes < 59){ this.Minutes++;}
    else{ this.Minutes = 0; this.IncHours();}
    return this;
}
DateTimeInc.prototype.IncSeconds = function (){ // 00-59
    if(this.Seconds < 59){ this.Seconds++;}
    else{ this.Seconds = 0; this.IncMinutes();}
    return this;
}

