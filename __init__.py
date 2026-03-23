import os
from aqt import mw, gui_hooks

# Get the addon directory name (the folder name)
addon_package = __name__

def on_webview_will_set_content(web_content, context):
    """
    Injects the JS file into the webview content.
    """
    # Define the path to the JS file relative to the addon root
    js_file = "web/smart_trim.js"
    
    # Create a web-accessible URL for the JS file
    url = f"/_addons/{addon_package}/{js_file}"
    
    # Append the script tag to the head of the web content
    web_content.js.append(url)

# In modern Anki versions, we use .append() instead of .add_hook()
gui_hooks.webview_will_set_content.append(on_webview_will_set_content)

# Tell Anki to expose the 'web' folder to the internal web server
mw.addonManager.setWebExports(addon_package, r"web/.*")