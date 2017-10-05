
with (
(function (globalContext) {
    var hasOwnProperty = function(object, property) {
      if (object) {
        return Object.prototype.hasOwnProperty.call(object, property) || object.hasOwnProperty(property);
      }
      return false;
    };
    var isGlobalProperty = function(property) {
      var value = globalContext[property];
      if (hasOwnProperty(globalContext, property)) {
          return !(value instanceof Element || value instanceof HTMLCollection) || Object.getOwnPropertyNames(globalContext).includes(property);
      }
      else {
        return (typeof(EventTarget) !== 'undefined' && hasOwnProperty(EventTarget.prototype, property)) ||
               (typeof(ContentScriptGlobalScope) !== 'undefined' && hasOwnProperty(ContentScriptGlobalScope.prototype, property));
      }
    };
    var proxiedFunctions = Object.create(null);
    var proxy = new Proxy(Object.create(null), {
        get: function (target, property, receiver) {
            var isProxiedFunction = Object.prototype.hasOwnProperty.call(proxiedFunctions, property);

            if (property === Symbol.unscopables || !(isGlobalProperty(property) || isProxiedFunction))
                return void 0;

            var value = isProxiedFunction ? proxiedFunctions[property] : globalContext[property];

            if (!isProxiedFunction && typeof(value) === 'function') {
                value = proxiedFunctions[property] = new Proxy(value, {
                    construct: function (target, argumentsList, newTarget) {
                        return Reflect.construct(target, argumentsList, newTarget);
                    },
                    apply: function (target, thisArg, argumentsList) {
                        return Reflect.apply(target, thisArg === proxy ? globalContext : thisArg, argumentsList);
                    }
                });
            }

            return value;
        },
        set: function (target, property, value) {
            globalContext[property] = value;
            delete proxiedFunctions[property];
        },
        has: function () {
            return true;
        }
    });
    return proxy;
})(this)
) {

var oneMinuteSignupMessageType={ResetRequestScript:"ResetRequestScript",ResetScript:"ResetScript",LogoutScript:"LogoutScript",UserInformationNeeded:"UserInformationNeeded",NavigateToTab:"NavigateToTab",SaveDiscoveredApps:"SaveDiscoveredApps",Done:"Done",Error:"Error",Log:"Log",SavedToVault:"SavedToVault",GetToken:"GetToken",LaunchApplication:"LaunchApplication",CloseTab:"CloseTab",GetOauthToken:"getOauthToken",ReceivedOauthToken:"token"};window.addEventListener("message",function(e){e.origin===window.location.origin&&function(e){return Object.values(oneMinuteSignupMessageType).indexOf(e)>=0}(message.data.type)&&self.port.emit("message",e.data)},!1),window.onload=function(){document.body.setAttribute("lastpass-extension-id",self.id||"0"),document.body.setAttribute("lastpass-extension-version",self.version||"0")},self.port.on("message",function(e){window.postMessage(e,"https://1min-ui-prod.service.lastpass.com")});

}