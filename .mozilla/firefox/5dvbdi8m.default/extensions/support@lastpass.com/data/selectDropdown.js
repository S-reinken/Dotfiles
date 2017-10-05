DropdownInput=function(t,e,o){DialogInput.ErrorDisplayInput.call(this),this.inputObject=new DialogInput.Input(t,o&&o.dialog),this.shown=!1,this.onChangeCallback=null,this.disabled=!1,this.dropdownEnabled=!0,this.searchValue="",this.clearSearchValueTimeout=null,this.dynamic=!0,this.selectedOption=null,this.build(e,o),function(t){t.clearSearchValue=function(){t.searchValue=""}}(this)},DropdownInput.prototype=Object.create(DialogInput.ErrorDisplayInput.prototype),DropdownInput.prototype.constructor=DropdownInput,DropdownInput.prototype.ATTR_DROPDOWN_VALUE="dropdownValue",function(t){DropdownInput.prototype.adjustView=function(){DialogInput.ErrorDisplayInput.prototype.adjustView.apply(this,arguments);var t=this.inputObject.getElement();t.css("margin",""),this.dropdownElement.parent().css({"margin-top":t.css("margin-top"),"margin-right":t.css("margin-right"),"margin-bottom":t.css("margin-bottom"),"margin-left":t.css("margin-left")}),t.css("margin",0);var e=t.css("border-bottom-right-radius");this.dropdownElement.css({"margin-top":"-"+e,"border-bottom-left-radius":e,"border-bottom-right-radius":e})},DropdownInput.prototype.build=function(t,e){var o=this.inputObject.getElement();if("SELECT"===o.prop("nodeName")){this.dynamic=!1,t=[];for(var n=o.children(),i=0,r=n.length;i<r;++i){var s=n[i];t.push({value:s.getAttribute("value"),label:s.textContent.trim(),class:s.getAttribute("class")})}var p=LPTools.createElement("input",{class:"dialogInput",type:"text",readonly:!0});o.before(p),o.remove(),this.inputObject.setElement(p),o=this.inputObject.getElement()}this.dropdownElement=$(LPTools.createElement("div","dropdownMenu selectDropdownList")),this.dropdownElement.append(LPTools.createElement("ul"));var l=$(LPTools.createElement("div","dropdownContainer"));o.before(l),l.append(o),l.append(this.dropdownElement),this.setOptions(t),e&&e.additionalDropdownClasses&&this.dropdownElement.addClass(e.additionalDropdownClasses),function(t){var e=!1;o.unbind("blur").bind("blur",function(){e?(o.focus(),e=!1):t.hide()}),o.unbind("keypress").bind("keypress",function(e){t.dropdownEnabled&&e.charCode>0&&t.handleKeypress(String.fromCharCode(e.charCode))}),o.unbind("keydown").bind("keydown",function(e){var o=e.keyCode||e.which;switch(o){case 8:case 46:t.dropdownEnabled&&t.handleDelete(o);break;case 40:!1===t.shown&&(t.handleDownArrow(),e.preventDefault(),e.stopPropagation())}}),t.toggleHandler=function(e){t.toggle(e)},t.enableClickToggle(),t.dropdownElement.children().first().unbind("mousedown").bind("mousedown",function(e){t.setValue(t.getDropdownValue(e.target)),e.stopPropagation(),e.preventDefault()}),t.dropdownElement.unbind("mousedown").bind("mousedown",function(t){t.stopPropagation(),t.preventDefault(),LPPlatform.canPreventBlur()||(e=!0)})}(this),o.addClass(this.getDropdownClass())},DropdownInput.prototype.enableClickToggle=function(){this.inputObject.getElement().bind("mousedown",this.toggleHandler).addClass("clickToggles")},DropdownInput.prototype.disableClickToggle=function(){this.inputObject.getElement().unbind("mousedown",this.toggleHandler).removeClass("clickToggles")},DropdownInput.prototype.enableDropdown=function(){this.dropdownEnabled||(this.getElement().removeClass("dropdownDisabled"),this.dropdownEnabled=!0)},DropdownInput.prototype.disableDropdown=function(){this.dropdownEnabled&&(this.getElement().addClass("dropdownDisabled"),this.dropdownEnabled=!1)},DropdownInput.prototype.getElement=function(){return this.inputObject.getElement()},DropdownInput.prototype.getDialog=function(){return this.inputObject.getDialog()},DropdownInput.prototype.buildError=function(){return this.buildErrorElement({alignTop:!0,element:this.dropdownElement.parent()})},DropdownInput.prototype.validate=function(){return!0},DropdownInput.prototype.getDropdownClass=function(){return"selectDropdown"},DropdownInput.prototype.setValues=function(t){var e=[];if(t)for(var o=0,n=t.length;o<n;++o){var i=t[o];e.push({value:i,label:i})}this.setOptions(e)},DropdownInput.prototype.default=function(){this.inputObject.default()},DropdownInput.prototype.addOption=function(t){this.options[t.value]=t},DropdownInput.prototype.removeValue=function(t,e){e&&this.setValue(e),delete this.options[t],this.dropdownElement.find("li["+DropdownInput.prototype.ATTR_DROPDOWN_VALUE+'="'+t+'"]').remove(),LPTools.hasProperties(this.options)||(this.inputObject.getElement().removeClass("toggled"),this.dropdownElement.hide())},DropdownInput.prototype.setOptions=function(t,e){if(t){this.options={},this.orderedOptions=[];var o=this.dropdownElement.children().first();o.empty();for(var n=0,i=t.length;n<i;++n){var r=t[n];r.index=n,void 0===r.element?r.element=LPTools.createElement("li",{dropdownValue:r.value,class:r.class},r.label):r.element.setAttribute(this.ATTR_DROPDOWN_VALUE,r.value),e&&(r.element.className=e),void 0!==r.click&&LPPlatform.addEventListener(r.element,"mousedown",r.click),o.append(r.element),this.options[r.value]=r,this.orderedOptions.push(r)}}},DropdownInput.prototype.focus=function(){this.getElement().focus()},DropdownInput.prototype.onChange=function(t){this.onChangeCallback=t},DropdownInput.prototype.fireOnChange=function(t){null!==this.onChangeCallback&&this.onChangeCallback(t)},DropdownInput.prototype.getDropdownValue=function(t){return $(t).closest("["+DropdownInput.prototype.ATTR_DROPDOWN_VALUE+"]").attr(DropdownInput.prototype.ATTR_DROPDOWN_VALUE)},DropdownInput.prototype.addKeyBoardNavigation=function(){LPTools.addKeyBoardNavigation(this.dropdownElement.children().first().children(),{mouseEvent:"mousedown",useRightArrow:!1,focusHandler:this.getKeyboardNavigationFocusHandler()})},DropdownInput.prototype.getKeyboardNavigationFocusHandler=function(){return null},DropdownInput.prototype.show=function(){!this.disabled&&this.dropdownEnabled&&!this.shown&&LPTools.hasProperties(this.options)&&(this.shown=!0,this.inputObject.getElement().addClass("toggled"),this.addKeyBoardNavigation(),this.dropdownElement.show(),this.dropdownElement.scrollTop(0),Topics.get(Topics.DROPDOWN_SHOWN).publish(this))},DropdownInput.prototype.positionAbsoluteBody=function(){var t=function(t,e){e.hide();var o=t.get(0).scrollHeight>t.height();e.show();var n=e.get(0);o||t.css("overflow","hidden");var i=n.getBoundingClientRect();o||t.css("overflow","auto"),document.body.appendChild(n),e.css({width:i.width,left:i.left,top:i.top-parseInt(e.css("margin-top"))})};return function(){var e=this,o=this.inputObject.getElement(),n=o.LP_scrollParent();if(n.length>0){t(n,this.dropdownElement);var i=function(){e.hide(),n.unbind("scroll.selectDropdown",i)};n.unbind("scroll.selectDropdown").bind("scroll.selectDropdown",i);var r=function(){e.dropdownElement.insertAfter(o),e.dropdownElement.css({width:"",left:"",top:""}),Topics.get(Topics.DROPDOWN_HIDE).unsubscribe(r)};Topics.get(Topics.DROPDOWN_HIDE).subscribe(r)}}}(),DropdownInput.prototype.hide=function(){this.shown&&LPTools.hasProperties(this.options)&&(this.shown=!1,LPTools.removeKeyBoardNavigation(),this.dropdownElement.hide(),this.inputObject.getElement().removeClass("toggled"),Topics.get(Topics.DROPDOWN_HIDE).publish(this))},DropdownInput.prototype.toggle=function(t){this.shown?this.hide():this.show(!0),void 0!==t&&t.stopPropagation()},DropdownInput.prototype.disable=function(){this.disabled||(this.getElement().parent().append(LPTools.createElement("div","dialogInputOverlay")),this.inputObject.disable(),this.disabled=!0)},DropdownInput.prototype.enable=function(){this.disabled&&(this.getElement().parent().children().last().remove(),this.inputObject.enable(),this.disabled=!1)},DropdownInput.prototype.setReadOnly=function(){this.getElement().prop("readonly",!0)},DropdownInput.prototype.removeReadOnly=function(){this.getElement().prop("readonly",!0)},DropdownInput.prototype.getValue=function(){var t=this.inputObject.getValue();if(this.selectedOption&&this.selectedOption.label===t)return this.selectedOption.value;if(this.dropdownEnabled&&this.options)for(var e in this.options)if(t===this.options[e].label){t=e;break}return t},DropdownInput.prototype.getInputValue=function(t){return t.label},DropdownInput.prototype.clear=function(){DialogInput.ErrorDisplayInput.prototype.clear.apply(this,arguments),this.setValue("")},DropdownInput.prototype.setValue=function(t){if(this.dropdownEnabled&&this.options&&this.options[t]){var e=this.options[t];this.inputObject.setValue(this.getInputValue(e)),this.optionIndex=e.index,this.selectedOption=e}else this.inputObject.setValue(t),this.selectedOption=null;this.hide(),this.fireOnChange(t)},DropdownInput.prototype.handleKeypress=function(t){this.searchValue+=t,this.updateValue(this.searchValue),this.clearSearchValueTimeout&&clearTimeout(this.clearSearchValueTimeout);var e=this.clearSearchValue;this.clearSearchValueTimeout=setTimeout(function(){e()},500)},DropdownInput.prototype.handleDelete=function(t){this.searchValue="",this.updateValue(this.searchValue)},DropdownInput.prototype.handleDownArrow=function(){this.show(),LPTools.setNavIndex(this.optionIndex)},DropdownInput.prototype.queryMatches=function(t,e,o){var n=t.label.toLowerCase(),i=e.toLowerCase(),r=n.indexOf(i);return o?r>-1:0===r},DropdownInput.prototype.updateValue=function(t){for(var e=0,o=this.orderedOptions.length;e<o;++e){var n=this.orderedOptions[e];if(this.queryMatches(n,t)){this.setValue(n.value);break}}}}(document);