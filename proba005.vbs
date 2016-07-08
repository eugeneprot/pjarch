Sub ShowDriveList
    Dim fs, d, dc, s, n
    Set fs = CreateObject("Scripting.FileSystemObject")
    Set dc = fs.Drives
    For Each d in dc
        s = "" & d.DriveLetter & " - " 
	WScript.echo s
	
'        If d.DriveType = 3 Then
'            n = d.ShareName
'        Else
'            n = d.VolumeName
'        End If
'        s = s & n & vbCrLf
    Next
'    MsgBox s
'	WScript.echo s
End Sub

call ShowDriveList