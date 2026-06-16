Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\photoclass"
WshShell.Run "npm run dev", 0, False
