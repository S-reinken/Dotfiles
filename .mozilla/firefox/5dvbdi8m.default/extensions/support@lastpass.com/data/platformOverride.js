!function(e){var n={},t=0,o=null,a=function(e){var t=n[e.requestID];delete n[e.requestID],t&&(e.success?t.success(e.data):t.error())};e.doAjax=function(e){var o={success:e.success,error:e.error};delete e.success,delete e.error;var a=++t;n[a]=o,e.data=e.data||{},e.data.wxsessid=bg.lp_phpsessid,window.postMessage({cmd:"ajax",requestID:a,params:e},window.location.origin)},window.addEventListener("message",function(e){e.origin===window.location.origin&&"object"==typeof e.data&&"ajaxResponse"===e.data.cmd&&a(e.data)}),e.initialize=function(){var e=function(e){var n=document.createElement("iframe");n.setAttribute("class","backgroundFrame"),n.src="backgroundFrame.html";var t=window.location.href.indexOf("?");t>-1&&(n.src+=window.location.href.substring(t)),n.addEventListener("load",function(){o=n.contentWindow,e.messageShim&&o.LPPlatform.setMessageShim(e.messageShim),o.LPPlatform.getBackgroundInterface({context:e.context,getData:e.getData,pollBackground:e.pollBackground,interfaceDefinition:e.interfaceDefinition,callback:function(n){window.bg=n,Topics.get(Topics.INITIALIZED).publish(),e.callback&&e.callback()}})}),document.body.appendChild(n)};return function(n){"interactive"===window.document.readyState?e(n):window.addEventListener("DOMContentLoaded",function(){e(n)})}}(),e.setLoginPopoverSize=function(e,n){bg.LPPlatform.resizePanel(n+2,e+2)},e.setDropdownPopoverSize=function(e,n){bg.LPPlatform.resizePanel(n+2,e+2)},e.doClosePopup=function(){bg.LPPlatform.closePanel()},e.closeTab=function(){bg.LPPlatform.closeTab()},e.checkBrowserPasswordManager=function(e){bg.get("remembersignons")&&e()},e.getImportHandler=function(){return!0===bg.get("g_one_minute_signup_enabled")?"addEmailSites":"importerHandler"},e.resizeTo=function(e,n){bg.LPPlatform.resizeDialogWindow(e,n)},e.handlePreferenceChanges=function(e){return function(n){e(n),bg.setup_hotkeys()}}(e.handlePreferenceChanges)}(LPPlatform);