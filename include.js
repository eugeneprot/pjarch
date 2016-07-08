// From:
// http://stackoverflow.com/questions/928237/how-can-i-create-a-javascript-library-in-a-separate-file-and-include-it-in-ano

    function includeFile (filename) {
        var fso = new ActiveXObject ("Scripting.FileSystemObject");
        var fileStream = fso.openTextFile (filename);
        var fileData = fileStream.readAll();
        fileStream.Close();
        eval(fileData);
    }

includeFile("externalFile1.js");
includeFile("externalFile2.js");
includeFile("etc.js");