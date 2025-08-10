a Simple browser extension that uses YATA API to add a Javascript popup with battle states estimates to the top of profile pages in the online game Torn city. You'll need to provide a limited access Torncity API key in order to use this, said key is stored locally.

----
**How to Use?**

On Firefox:
- Download the files from this repo, extract and use the files from the "manifest **V2**" folder
- Go to about:debugging
- Enable "Developer Mode" if it's not enabled
- Click on "Load Temporary Add-on"
- Load the "manifest.json" file inside of the "manifest V2" folder
- Click on the extension and add a limited access Torncity API key (preferably your YATA key)

 To make it permenant:
- Go to about:config
- Search for `xpinstall.signatures.required` and set it to `false`


On Chrome:
- Download the files from this repo, extract and use the files from the "manifest **V3**" folder
- Open up Settings
- Click on Extensions
- Enable the slider for "Developer options"
- Click on "Load unpacked" and select the extracted folder
- Click on the extension and add a limited access Torncity API key (preferably your YATA key)

---
**TODO**
- ~~Switch over to manifest V3~~
- Publish as a Firefox Addon 