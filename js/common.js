// ///////////////////////////////////////////////////////////////////////////////////////////////

function debugTrace(ALevel, AStr){
//    if (typeof(__debug__) != "undefined"){
    if (typeof(__debug__) == "number"){
        if(__debug__ >= ALevel)
            WScript.Echo((new Date) + " : " + AStr);
    }
}

function f(n) {
	// Format integers to have at least two digits.
	return n < 10
		? "0" + n
		: n;
}

function dateTimeToStr(ADate){
	var locDate = ADate || new Date();
	return "" +
		locDate.getFullYear() +
		f(locDate.getMonth()+1) +
		f(locDate.getDate()) +
		f(locDate.getHours()) +
		f(locDate.getMinutes()) +
		f(locDate.getSeconds()) ;
}

function pathSplit(APath){
    var locReturn=undefined;
    var locResult=APath.match(/^((?:[a-z]:)|(?:\\\\))\\?([^\\].*[^\\])?\\?$/i);
    if(locResult){
        locReturn = new Array;
        locReturn.push(locResult[1]); // добавляем диск
        if (locResult[2]){
            locReturn=locReturn.concat(locResult[2].split("\\"));
        }
    }
    return locReturn;
}

