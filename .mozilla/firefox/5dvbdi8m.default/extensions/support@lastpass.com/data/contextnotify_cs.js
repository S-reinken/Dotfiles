function do_save_site_success_msg(t){if(g_show_save_success_msg){return popup_notification_msg(t,{waitms:1500,loc:"ur",id:"__lpsavemsgdiv",msg:lpgs("You have saved your password to your LastPass Vault.")})}return!1}function do_iframe_sad_msg(t){if(g_show_safari_csp_msg){return popup_notification_msg(t,{waitms:3500,loc:"urv",id:"__lpsadmsgdiv",msg:lpgs("The LastPass popup has been blocked from loading on this site. Please fill using the LastPass Icon.")})}return!1}function popup_notification_msg(t,i){if(t||(t=LP_derive_doc()),!t||!i)return!1;var e=i.loc,o=i.id,n=i.waitms,r=i.msg,a=sprintf;"undefined"!=typeof g_isie&&g_isie&&(init_LPfn(),LPfn&&(a=LPfn.sprintf));var p=window;if(!p&&"undefined"!=typeof LP){p=LP.getBrowser().ContentWindow}if(!(t&&i&&r&&o&&e&&p))return!1;var s=t.createElement("DIV");if(s.id=o,g_40notify){var d=t.createElement("div");d.style.height="12px",d.style.backgroundColor=g_40colors.header;var l=t.createElement("img");l.src=g_40_icons["8x8"];l.style.cssText="vertical-align:top !important; margin:2px !important;",d.appendChild(l);var c=t.createElement("div"),m="position:absolute !important; border-style:transparent !important; border-width:1px !important; border-color:transparent !important; font-size:9px; font-family: Arial,Helvetica,sans-serif; height:11px !umportant ; width: 11px !important; top:0px !important; right:0px !important; background-color: transparent; margin: 0 !important; ; padding: 0px 2px !important; text-align:center; cursor: pointer; color: white; display:inline-block;";c.style.cssText=m,LP_elt_set_text(c,"X"),d.appendChild(c),s.appendChild(d)}else{var c=t.createElement("div"),m="position:absolute !important; border-style:transparent !important; border-width:1px !important; border-color:transparent !important; font-size:9px; font-family: Arial,Helvetica,sans-serif; height:11px !umportant ; width: 11px !important; top:0px !important; right:0px !important; background-color: transparent; margin: 0 !important; ; padding: 0px 2px !important; text-align:center; cursor: pointer; ";c.style.cssText=m,LP_elt_set_text(c,"X"),s.appendChild(c)}var g=t.createElement("div");g.id=o+"_text",s.appendChild(g),g_40notify&&(g.style.cssText="padding: 5px 5px 5px 15px !important;"),r&&LP_elt_set_text(g,r);var u=LP_getWindowWidth(p);if(!u)return!1;var _=LP_getWindowHeight(p);_||(_=0);var A=0,x=0;switch(e){case"ul":A="25px",x="25px";break;case"ulv":A=25+LP_pos_viewport(p)[0]+"px",x=25+LP_pos_viewport(p)[1]+"px";case"dock":break;case"urv":A=u-parseInt("210px")-30+"px",x=25+LP_pos_viewport(p)[1]+"px";break;case"ur":default:A=u-parseInt("210px")-30+"px",x="25px"}var b="position:absolute !important; visibility:visible !important; z-index:"+CLICKABLE_ICON_ZINDEX+" !important; border-style:transparent !important; border-width:1px !important; border-color:#4c4c4c !important; font-size:14px; font-family: Arial,Helvetica,sans-serif; width: 210px !important; top:"+x+" !important; left:"+A+" !important; background-color: #e6e6e6; margin: 4px !important; border-radius: 4px; padding: 5px 5px 5px 15px !important; background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAMAAABhq6zVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3BpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMi1jMDAxIDYzLjEzOTQzOSwgMjAxMC8xMC8xMi0wODo0NTozMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpDQ0JFNTgxNzA4MjA2ODExOTJCMEZBNzdDQkU2Qjg4RiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1RTA4N0Y4OEZCQUYxMUUyOTAyNEMwRUQyN0ZDRTk1QyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1RTA4N0Y4N0ZCQUYxMUUyOTAyNEMwRUQyN0ZDRTk1QyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgRWxlbWVudHMgMTEuMCBNYWNpbnRvc2giPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyMEEzMzFENkUxMjA2ODExOTJCMEZBNzdDQkU2Qjg4RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDQ0JFNTgxNzA4MjA2ODExOTJCMEZBNzdDQkU2Qjg4RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqEZ7U4AAAAwUExURfL6+uHMzaoWLIoDFKVJJ2oEFsQaK7cCHMtfaNWrEcFJOsg2PsqnqdWGi584RAAAAIK7gZ4AAAAQdFJOU////////////////////wDgI10ZAAAAWUlEQVR42jzMUQ4AMQQEUKpoFnX/2+403exEZN4H1DHsZjQ9/kcOgsN4fVhURXVhxkRsBkxnPmCOg8xEzRyAuAOJEwVk0cIPAbbIriG5D6Zi31Fq/dOvAAMADDMDTO9yI2MAAAAASUVORK5CYII=); background-repeat:no-repeat; background-position: left top;background-attachment: scroll;";if(void 0!==s.style.opacity?b+="opacity: 1.0;":b+="filter:alpha(opacity=100)",g_40notify){var f=a("url(%s)",g_40_icons["8x8"]),b="position:absolute !important; visibility:visible !important; z-index:"+CLICKABLE_ICON_ZINDEX+" !important; border-style:transparent !important; border-width:1px !important; border-color:#4c4c4c !important; font-size:14px; font-family: Arial,Helvetica,sans-serif; width: 210px !important; top:"+x+" !important; left:"+A+" !important; background-color: #e6e6e6; margin: 0px !important; padding:0px !important; border-radius: 4px; background-image:"+f+"; background-repeat:no-repeat; background-position: left top;background-attachment: scroll;";void 0!==s.style.opacity?b+="opacity: 1.0;":b+="filter:alpha(opacity=100)",s.style.cssText=b}else s.style.cssText=b;return void 0!==t.body?t.body.appendChild(s):t.getElementById("main")&&t.getElementById("main").appendChild(s),n&&"number"==typeof n&&n>0&&setTimeout(function(){return close_popup_notification_msg(t,s.id,0),!1},n),LP_addEventHandler(c,"click",function(){return close_popup_notification_msg(t,s.id,null),!1}),!0}function close_popup_notification_msg(t,i,e){if(t||(t=LP_derive_doc()),!t||!i)return!1;var o=t.getElementById(i);if(o){if(void 0===e?e=0:"string"==typeof e&&(e=parseInt(e)),null===e||isNaN(e))return o.parentNode.removeChild(o),!1;e<FADE_MAXSTATES?(void 0!==o.style.opacity?o.style.opacity=(100-100/FADE_MAXSTATES*(e+1))/100:o.style.filter="alpha(opacity="+(100-20*(e+1))+")",e++,setTimeout(function(){return close_popup_notification_msg(t,o.id,e),!1},10)):o.parentNode.removeChild(o)}return!1}function destroy_save_site_success_msg(t,i,e){return close_popup_notification_msg(t,i,e)}function do_save_suggest_msg(t,i){}function draw_context_tip(t,i){}function destroy_save_suggest_msg(t,i,e){return!1}var MSGDIVID="__lpsuggestmsgdiv",g_tutorial_flags,TUTORIAL_FLAG_LPOV=1,TUTORIAL_FLAG_CONTEXT=2,g_context_tip_shown=0;