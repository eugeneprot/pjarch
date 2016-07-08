function main(){
var ForWriting = 2;
var TristateTrue = -1;

var textPref = '{"xxx": "AA \u05D5 BB"}';

var pref = JSON.parse(textPref);
textPref = JSON.stringify(pref)

// Create the new file.
var fso = new ActiveXObject("Scripting.FileSystemObject");

//create as unicode
fso.CreateTextFile("Preferences_temp", true, true);
var fileObj = fso.GetFile("Preferences_temp");

//open for unicode
var textStream = fileObj.OpenAsTextStream(ForWriting, TristateTrue);
textStream.Write(textPref);
textStream.Close();
}
