// ///////////////////////////////////////////////////////////////////////////////////////////////
function debugTrace(ALevel, AStr){
//    if (typeof(__debug__) != "undefined"){
    if (typeof(__debug__) == "number"){
        if(__debug__ >= ALevel)
            WScript.Echo(AStr);
    }
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

// /////////////////
function getParamDate(AParam){
    var locResult;
    var locDate=new Date;
    switch (AParam) {
    case 'YEAR': 
        locResult = "1812";
        break;
    default:
        break;
    }
    return locResult;
}
function getParam(AParam){
    var locParam = AParam.slice(2,-1).toUpperCase();
    var locResult;
    if ((locResult = getParamDate(locParam)) == undefined){
        locResult = "????"
    }
    return ""+locResult+"";
}

function strTemplate(AString){
    WScript.Echo("BEGIN => "+AString);
    var locReg = /\{\$[A-Z0-9_]+\}/ig;
    var locRes ;
    var locLastIndex=0;
    var locResult = "";
    while ((locRes=locReg.exec(AString)) != null){
        locResult += AString.slice(locLastIndex,locRes.index);
        locResult += getParam(AString.slice(locRes.index,locReg.lastIndex));
        locLastIndex = locReg.lastIndex;
    }
    locResult += AString.slice(locLastIndex);
    return locResult;
}
/*
WScript.Echo(strTemplate(" Napoleon go home in {$Year} year."));

var locTmp = new Template(" Napoleon go {$Sezon} home in {$Year} year.");
WScript.Echo("" + locTmp);
*/
//var locTmp2 = new Template("YEAR: {$YEAR}; MONTH: {$MONTH}; DATE: {$DATE}; HOURS: {$HOURS}; MINUTES: {$MINUTES}; SECONDS: {$SECONDS}.");
WScript.Echo(new Template("YEAR: {$YEAR}; MONTH: {$MONTH}; Week: {$week}; DATE: {$DATE}; Day: {$Day}; \n HOURS: {$HOURS}; MINUTES: {$MINUTES}; SECONDS: {$SECONDS}."));

var locTmp = new Template("YEAR: {$YEAR}; MONTH: {$MONTH}; Week: {$week}; DATE: {$DATE}; Day: {$Day}; \n HOURS: {$HOURS}; MINUTES: {$MINUTES}; SECONDS: {$SECONDS}. MyName: {$MYNAME}, LastName: {$LastName}.",{MyName: "Eugene"});
WScript.Echo("1: locTmp = "+locTmp);
//WScript.Sleep(15000);
WScript.Echo("2: locTmp = "+locTmp.reInit({lastname: "Prot"}));
WScript.Echo("3: locTmp = "+locTmp.reInit({year: "1812"}));
WScript.Echo("4: locTmp = "+locTmp.setTemplate("{$myname} {$lastname}"));

//WScript.Echo(""+Template.getWeek(new Date));

/*
WScript.Echo(strTemplate(""));
WScript.Echo(strTemplate("asdfghjkl"));
WScript.Echo(strTemplate("asd{$QWE}fgh{$POI}jkl"));
WScript.Echo(strTemplate("{$QWE}fgh{$POI}jkl"));
WScript.Echo(strTemplate("asd{$QWE}fgh{$POI}"));
WScript.Echo(strTemplate("asd{$QWE}fgh"));
WScript.Echo(strTemplate("asd{$QWE}{$POI}jkl"));
WScript.Echo(strTemplate("asd{$QWE}{$POI}"));
WScript.Echo(strTemplate("{$QWE}{$POI}jkl"));
WScript.Echo(strTemplate("{$QWE}{$POI}"));
WScript.Echo(strTemplate("{$QWE}"));

WScript.Echo(strTemplate("asd{$QWEfgh{$Po1_I}"));
WScript.Echo(strTemplate("asd{$QWE}}fgh{$POI}"));
WScript.Echo(strTemplate("asd{${QWE}fgh{$POI}"));

*/





