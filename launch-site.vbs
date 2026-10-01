Option Explicit
Dim shell, files, projectDirectory, command
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
projectDirectory = files.GetParentFolderName(WScript.ScriptFullName)
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File " & Chr(34) & files.BuildPath(projectDirectory, "launch-site.ps1") & Chr(34)
shell.Run command, 0, False
