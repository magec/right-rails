/**
 * Ruby On Rails common Ajax operations conventional wrapper
 * and underscored aliases for core methods
 *
 *    http://github.com/MadRabbit/right-rails
 *
 * Copyright (C) Nikolay V. Nemshilov aka St.
 */
;var RR={Options:{format:'js',flashId:'flashes',flashHideFx:'slide',flashHideDelay:3200,highlightUpdates:true,removeFx:'fade',rescanWithScopes:true},update_flash:function(c){var e=$(this.Options.flashId);if(e)this.replace(e,c).hide_flash();return this},hide_flash:function(){if(this.Options.flashHideDelay>-1){var e=$(this.Options.flashId);if(e&&e.visible())e.hide.bind(e,this.Options.flashHideFx).delay(this.Options.flashHideDelay)}return this},highlight:function(i){if(this.Options.highlightUpdates)$(i).highlight();return this},insert:function(a,w){return this.highlight($(a).insert(w).lastChild).rescan(a)},replace:function(i,s){$(i).replace(s);return this.highlight(i).rescan(i)},remove:function(i){var e=$(i);if(e){var r=e.remove.bind(e).chain(Lightbox.rescan);if(this.Options.removeFx)e.hide(this.Options.removeFx,{onFinish:r});else r}},remotize_form:function(i){var f=$(i);if(f)f.remotize().enable().action+='.'+this.Options.format;return this},replace_form:function(i,s){var f=$(i);if(f){f.replace(s);this.remotize_form(i)}return this.rescan(i)},show_form_for:function(i,s){$(i).select('form').each('remove');$(i).insert(s);return this.remotize_form($(i).first('form')).rescan(i)},hijack_links:function(){this._links=this._links||[];$$('a.edit, a.destroy').each(function(l){var u=$uid(l);if(!this._links[u]){this._links[u]=true;if(l.hasClass('destroy'))l.onclick=eval('({f:'+l.onclick.toString().replace('.submit','.send')+'})').f;else if(l.hasClass('edit')){l.onclick=function(e){e.stop();Xhr.load(l.href+'.'+this.Options.format)}.bind(this)}}},this);return this},rescan:function(s){this.hijack_links();$w('Lightbox Calendar Autocompleter Draggable Droppable Sortable Tabs Slider Rater Selectable').each(function(n){if(self[n])self[n].rescan(this.Options.rescanWithScopes?s:null)},this);return this}};document.onReady(function(){RR.hide_flash().rescan()});[String.prototype,Array.prototype,Function.prototype,Object,Options,Observer,Observer.prototype,window,document].each(function(o){for(var k in o)try{if(/[A-Z]/.test(k)&&typeof(o[k])=='function'){var u=k.underscored();if(o[u]===null||o[u]===undefined)o[u]=o[k]}}catch(e){}});[Element,Event,Form,Form.Element].each(function(o){var a={},m=o.Methods;for(var k in m)if(/[A-Z]/.test(k)&&typeof(m[k])=='function')a[k.underscored()]=m[k];o.addMethods(a)});$alias(String.prototype,{index_of:'indexOf',last_index_of:'lastIndexOf',to_f:'toFloat',to_i:'toInt',gsub:'replace',downcase:'toLowerCase',upcase:'toUpperCase',index:'indexOf',rindex:'lastIndexOf',strip:'trim'});$alias(Array.prototype,{collect:'map',detect:'filter',index_of:'indexOf',last_index_of:'lastIndexOf',index:'indexOf',rindex:'lastIndexOf'});