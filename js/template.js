// ///////////////////////////////////////////////////////////////////////////////////////////////
// Class Template 

function Template(ATemplate, AArguments){
    this._setTemplate(ATemplate);
    this._setParameters(AArguments);
    this.applyTemplate();
}

// Типа "деструктор"
Template.prototype._delete_ = function (){
    for(var locKey in this){
        if((typeof(this[locKey]) != "undefined")&&(typeof(this[locKey]._delete_) != "undefined")){
            this[locKey]._delete_();
        }
    }
    return this;
}

Template.OneDay=(24*60*60*1000);

Template.FillSpaceLeft=function (AStr, ALen, AChr){
    var locChr= AChr|| "0";
    var locStr = ""+AStr;
    while(locStr.length < ALen)
        locStr=locChr+locStr;
    return locStr;
}

Template.prototype.getParameterDate = function (AParameter){
    var locResult;
    switch (AParameter) {
    case "DATETIME": locResult = this._date.toString()   ; break;
    case "YEAR"    : locResult = Template.FillSpaceLeft(this._date.getFullYear(),4); break;
    case "MONTH"   : locResult = Template.FillSpaceLeft(this._date.getMonth(),2)   ; break;
    case "WEEK"    : locResult = Template.FillSpaceLeft(this._date.getWeek(),2)    ; break;
    case "SEVEN"   : locResult = Template.FillSpaceLeft(this._date.getSeven(),2)   ; break;
    case "ONEDAY"  : locResult = Template.FillSpaceLeft(this._date.getOneDay(),3)  ; break;
    case "PAIR"    : locResult = Template.FillSpaceLeft(this._date.getPair(),3)    ; break;
    case "TRIO"    : locResult = Template.FillSpaceLeft(this._date.getTrio(),3)    ; break;
    case "QUAD"    : locResult = Template.FillSpaceLeft(this._date.getQuad(),2)    ; break;
    case "DATE"    : locResult = Template.FillSpaceLeft(this._date.getDate(),2)    ; break;
    case "DAY"     : locResult = Template.FillSpaceLeft(this._date.getDay(),2)     ; break;
    case "HOURS"   : locResult = Template.FillSpaceLeft(this._date.getHours(),2)   ; break;
    case "MINUTES" : locResult = Template.FillSpaceLeft(this._date.getMinutes(),2) ; break;
    case "SECONDS" : locResult = Template.FillSpaceLeft(this._date.getSeconds(),2) ; break;
    default:
        break;
    }
    return locResult;
}

Template.prototype.getParameter = function (AParameter){
    // Обрезаем в начале {$ и в конце }
    var locParameter = AParameter.slice(2,-1).toUpperCase(); 
    return "" + (
        this[locParameter] || 
        this.getParameterDate(locParameter) || 
        AParameter
    );
}

Template.prototype.applyTemplate = function (){
    //var locTemplate = ATemplate || "";
    var locTemplate = this._Template || "";
    var locReg = /\{\$[A-Z0-9_]+\}/ig;
    var locRes ;
    var locLastIndex=0;
    this._Str = "";
    while ((locRes=locReg.exec(locTemplate)) != null){
        this._Str += locTemplate.slice(locLastIndex,locRes.index);
        this._Str += this.getParameter(locTemplate.slice(locRes.index,locReg.lastIndex));
        locLastIndex = locReg.lastIndex;
    }
    this._Str += locTemplate.slice(locLastIndex);
    return this;
}

// Инициализация предопределенных параметров
Template.prototype._setPredefineParameters = function (AParameters){
    function _stretch(AStepDays){
        return function (){return Math.floor((this - (new Date(this.getFullYear(),0,1))) / (AStepDays*Template.OneDay));}
    }
    function _getWeek(){
        return function (){
            var locY = new Date(this.getFullYear(),0,1);
            locY.setDate(locY.getDate()-locY.getDay());
            return Math.floor((this-locY)/(7*Template.OneDay));
        }
    }
    this._date = AParameters.DateTime || new Date;
//    this._date.getWeek   = _stretch(7);
    this._date.getWeek   = _getWeek();
    this._date.getSeven  = _stretch(7);
    this._date.getOneDay = _stretch(1);
    this._date.getPair   = _stretch(2);
    this._date.getTrio   = _stretch(3);
    this._date.getQuad   = _stretch(4);
    
    return this;
}

Template.prototype._setParameters = function (AParameters){
    var locO = AParameters || {};
    this._setPredefineParameters(locO);
    // Параметры пользователя
    for(var locKey in locO){
        this[locKey.toUpperCase()] = locO[locKey];
    }
    return this;
}

Template.prototype.setParameters = function (AParameters){
    this._setParameters(AParameters);
    this.applyTemplate();
    return this;
}

Template.prototype._setTemplate = function (ATemplate){
    this._Template = ATemplate || this._Template || "";
    return this;
}

Template.prototype.setTemplate = function (ATemplate){
    this._setTemplate(ATemplate);
    this.applyTemplate();
    return this;
}

Template.prototype.toString = function (){
    return this._Str;
}
