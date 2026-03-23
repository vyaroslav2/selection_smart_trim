import os
from aqt import mw, gui_hooks

# Dynamically get the addon folder name
addon_package = __name__.split(".")[0]

def on_webview_will_set_content(web_content, context):
    # url format: /_addons/Folder_Name/web/file.js
    url = f"/_addons/{addon_package}/web/smart_trim.js"
    
    # Check if already appended to avoid duplicates in some views
    if url not in web_content.js:
        web_content.js.append(url)

# This hook covers Browser, Editor, and Reviewer
gui_hooks.webview_will_set_content.append(on_webview_will_set_content)

# Important: This makes the /web folder accessible to the webview
mw.addonManager.setWebExports(addon_package, r"web/.*")