function detachWorker(e,n){var t=n.indexOf(e);-1!=t&&n.splice(t,1)}function _messageHandler(e,n){messageEventListeners.forEach(function(t){"function"==typeof t&&t(e,n,function(){})})}var pageMod=require("sdk/page-mod"),tabs=require("sdk/tabs"),messageEventListeners=[],siteWorkers=[];pageMod.PageMod({include:["https://1min-ui-prod.service.lastpass.com/*"],contentScriptFile:[self.data.url("1minsignup/firefox/websiteConnector.js")],contentScriptWhen:"start",attachTo:["top","frame"],onAttach:function(e){siteWorkers.push(e),e.port.on("message",function(n){_messageHandler(n,e.tab.id)}),e.on("detach",function(){detachWorker(this,siteWorkers)}),e.on("pagehide",function(){detachWorker(this,siteWorkers)}),e.on("pageshow",function(){siteWorkers.push(e)})}});var oneMinuteSignup=oneMinuteSignup||{};oneMinuteSignup.ExtensionProxyService={createTab:function(e,n,t,o){tabs.open({url:e,inBackground:!n,onOpen:function(e){"function"==typeof t&&t(new oneMinuteSignup.Tab(e.id,e.url))},onClose:function(e){"function"==typeof o&&o(e.id)}})},updateTab:function(e,n,t){for(var o=0;o<tabs.length;o++){var i=tabs[o];i.id===e&&(i.url=n,"function"==typeof t&&t(i?new oneMinuteSignup.Tab(i.id,i.url):null))}},onMessage:function(e){messageEventListeners.push(e)},onUpdateTab:function(e){tabs.on("ready",function(n){n&&"function"==typeof e&&e(n.id,n.url)})},removeCookies:function(e,n){for(var t=Services.cookies.getCookiesFromHost(e);t.hasMoreElements();){var o=t.getNext();Services.cookies.remove(e,o.name)}"function"==typeof n&&n()},executeScript:function(e,n,t){for(var o=0;o<tabs.length;o++){var i=tabs[o];if(i.id===e){var r=i.attach({contentScript:n});!function(e){r.port.on("message",function(n){_messageHandler(n,e)})}(r.tab.id),"function"==typeof t&&t()}}},executeScriptWithFrameWork:function(e){oneMinuteSignup.ExtensionProxyService.injectScript(e.tabId,["1minsignup/ContentScripts/doNotCloseWarning.js","1minsignup/Framework.js","1minsignup/firefox/ExtensionHostEnvironment.js"],[e.activeScript,e.activeTriggerScript],function(){})},injectScript:function(e,n,t,o){for(var i=0;i<tabs.length;i++){var r=tabs[i];if(r.id===e){var a=r.attach({contentScriptFile:n,contentScript:t});!function(e){a.port.on("message",function(n){_messageHandler(n,e)})}(a.tab.id),"function"==typeof o&&o()}}},sendMessageToSite:function(e){siteWorkers.forEach(function(n){n.port.emit("message",e)})},focusTabById:function(e){for(var n=0;n<tabs.length;n++){var t=tabs[n];t.id===e&&t.activate()}},focusTabByUrl:function(e){for(var n=0;n<tabs.length;n++){var t=tabs[n];t.url.match(e)&&t.activate()}},closeTab:function(e){for(var n=0;n<tabs.length;n++){var t=tabs[n];t.id===e&&t.close()}}};