dim MyFile, gfso, rootpath, arhroot, archExe, WshShell
dim regExpInclude, regExpExclude, patrn

sub CrtFolder(AFolderName)
   Dim fso, f
'   WScript.echo(AFolderName)
'   Set fso = CreateObject("Scripting.FileSystemObject")
   Set f = gfso.CreateFolder(AFolderName)
end sub

' example: =printf("Some text '{0}', more text: '{1}'", A1, A2)
' Здесь не прокатит. Нужно попробовать через регулярные выражения
'Function printf(mask As String, ParamArray tokens()) As String
'    Dim i As Long
'    For i = 0 To UBound(tokens)
'        mask = Replace$(mask, "{" & i & "}", tokens(i))
'    Next
'    printf = mask
'End Function


function CreateDirectoryPath(DirPath)
'   Set objFSO = CreateObject("Scripting.FileSystemObject")
   Set objFSO = gfso
   If not objFSO.FolderExists(DirPath) Then
	   aDirectories = Split(DirPath, "\")
	   sCreateDirectory = aDirectories(0)
	   For iDirectory = 1 To UBound(aDirectories)
		   sCreateDirectory = sCreateDirectory & "\" & aDirectories(iDirectory)
		   If Not objFSO.FolderExists(sCreateDirectory) Then
			   objFSO.CreateFolder(sCreateDirectory)
		   End If
	   Next
   End If
End Function

function ArcFile(ASrcFileName)
  arcfile = arhroot & mid(AsrcFileName, Len(rootpath)+1)
end function

sub fileToArch(AFile)
   dim s, retVal
   s = AFile.path
   'retVal=regExp.Test(s)
   'if retVal then
   if regExpInclude.Test(s) and (regExpExclude.Pattern="" or not regExpExclude.Test(s)) then 
'   if regExpInclude.Test(s) then 
     MyFile.WriteLine(s)
 '  set WshShell = WScript.CreateObject("WScript.Shell")
'     WshShell.Run archExe & " """ & ArcFile(s) & ".zip"" """ & s & """",8,True
     WshShell.Run archExe & " """ & ArcFile(s) & ".7z"" """ & s & """",0,False
   end if
end sub

sub runFolder(APath)
   Dim fso, curFolder, files, subfolders, curSubFolder, curFile
'   Set fso = CreateObject("Scripting.FileSystemObject")
   Set curFolder = gfso.GetFolder(APath)
   set files = curFolder.files
   Set subfolders = curFolder.SubFolders
   for each curFile in files
     call fileToArch(curFile)
   next
   For Each curSubFolder in subfolders
      ' call CrtFolder(ArcFile(APath&"\"&cursubfolder.name))
	  call CreateDirectoryPath(ArcFile(APath&"\"&cursubfolder.name))
      runFolder(APath&"\"&cursubfolder.name)
   Next
end sub

rootpath = "D:\prot\pjarch\proba\src"
arhroot = "D:\prot\pjarch\proba\dst"
'patrn=".*(?!\.jpg)"
'archExe = """C:\Program Files\7-Zip\7z.exe"" a -tzip "
archExe = """C:\Program Files\7-Zip\7z.exe"" a "
Set gfso = CreateObject("Scripting.FileSystemObject")
set WshShell = WScript.CreateObject("WScript.Shell")
Set MyFile = gfso.CreateTextFile("recurs.txt", True)
'set regExp = new RegExp
'regExp.Pattern=patrn
'regExp.IgnoreCase=True

set regExpInclude = new RegExp 
regExpInclude.IgnoreCase=True
regExpInclude.Pattern=".*"

set regExpExclude = new RegExp
regExpExclude.IgnoreCase=True
'regExpExclude.Pattern="\.(jpg|png|zip)$"
regExpExclude.Pattern=""

call CreateDirectoryPath(rootpath)
call runFolder(rootpath)

MyFile.Close

WScript.echo "Все!"