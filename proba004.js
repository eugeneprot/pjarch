 var WshNetwork = WScript.CreateObject("WScript.Network");
 var oDrives = WshNetwork.EnumNetworkDrives();
 var oPrinters = WshNetwork.EnumPrinterConnections();
 WScript.Echo("Network drive mappings:");
 for(i = 0; i < oDrives.length; i += 2) {
    WScript.Echo("Drive " + oDrives.Item(i) + " = " + oDrives.Item(i + 1));
 }
 WScript.Echo();
 WScript.Echo("Network printer mappings:");
 for(i = 0; i < oPrinters.length; i += 2) {
    WScript.Echo("Port " + oPrinters.Item(i) + " = " + oPrinters.Item(i + 1));
 }