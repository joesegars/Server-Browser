To run the project, open solution in Visual Studio 2015. Build the project then either deploy to IIS or use the built in IIS express server to open the index.html page. Front end code is located in the TestProject/client directory

* App features

- Configurable home directory
- View directory
- Navigate up a directory (click ".." folder)
- Navigate to sub folders
- Clickable breadcrumb path
- Deep URL linking
- Dispaly file count, folder count, and total file size
- Add folder
- Refresh current folder
- Delete folder
- Live search
- Download file
- Right click context menu
- Error display


* Configurable home directory

In app.js there is a variable at the top of the file called SERVER_HOME_DIRECTORY.
This can be used to configure a home directory on the server to start in
It can be configured to any valid path on the server
URL can be an absolute path such as "C:\\Windows\\Temp"
Alternatively you can use a relative path to the web server such as "\\AppServer"
The default is "."


* Browsing folders

You can browse folders simply by clicking one in the directory display. You can also navigate
up a directory by clicking on the ".." folder at the top of the list.


* Breadcrumb path

The current directory path is displayed in the app via a dynamic breadcrumb bar. You can
click on any element in the path and navigate directly to it.


* Deep URL linking

This app supports deep url linking via the hash bang pattern. The current state of the UI is
maintained as part of the URL. As such you can load directly into a folder by including the path
after the hash. For example, to load into a folder located at C:\Windows\MyFolder the url should look
like this:

http://<server url>/index.html#!/C:\Windows\MyFolder

If no folder is provided in the hash, the app will navigate to the default folder specified by
the SERVER_HOME_DIRECTORY variable in app.js (default is ".")


* Directory stats

The bottom status bar displays stats about the current view. NOTE: total file size only
includes the files currently in view, and not those in sub directories


* Delete/Download

Delete and download functionality is available via a right click context menu on the folder display.
Simply right click on a file or folder to view these options. NOTE: download is only available for files.


* Live Search

The search bar can be used to actively filter folders and files by name as you type. Clear the search
field to return to the full default view


* Errors

Any errors encountered will display at the bottom of the app