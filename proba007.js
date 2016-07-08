function ShowDriveList()
{
   var fso, s, n, e, x;
   fso = new ActiveXObject("Scripting.FileSystemObject");
   e = new Enumerator(fso.Drives);
   for (; !e.atEnd(); e.moveNext())
   {
      s="";
      x = e.item();
      switch (x.DriveType)
    {
      case 0: t = "Unknown"; break;
      case 1: t = "Removable"; break;
      case 2: t = "Fixed"; break;
      case 3: t = "Network"; break;
      case 4: t = "CD-ROM"; break;
      case 5: t = "RAM Disk"; break;
    }
   s = "Drive " + x.DriveLetter + ": - " + t;
      if (x.DriveType == 3)
         n = x.ShareName;
      else if (x.IsReady)
         n = x.VolumeName;
     s +=  " - " + n;
   if (x.IsReady)
      s += " " + "[Drive is Ready.]";
   else
      s += " " + "[Drive is not Ready.]";
      WScript.Echo(s);
   }
}

function ShowFreeSpace(drvPath)
{
   var fso, d, s;
   fso = new ActiveXObject("Scripting.FileSystemObject");
   d = fso.GetDrive(fso.GetDriveName(drvPath));
   s = "Drive " + drvPath + " - " ;
   s += d.VolumeName + "<br>";
   s += "Free Space: " + d.FreeSpace/1024 + " Kbytes";
   return(s);
}
ShowDriveList();