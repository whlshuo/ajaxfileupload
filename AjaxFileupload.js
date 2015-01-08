/*********************************************************************************************************/
// JavaScript Document
jQuery.extend({
	
	
	createUploadIframe : function(id, uri) {
		// create frame
		var frameId = 'jUploadFrame' + id;
		/**判断浏览器版本     开始*/
		var FR = {};
		//浏览器判断
		//是否IE
		FR.isIE = !!document.documentMode;
		$.each([7, 8, 9, 10, 11], function(n,v){
			FR['isIE' + v] = FR.isIE && document.documentMode === v;
		});
		//设备判断
		var ua = navigator.userAgent.toLowerCase();
		FR.isIPhone = /iphone/i.test(ua);
		FR.isIPad = /ipad/i.test(ua);
		FR.isIOS = FR.isIPhone || FR.isIPad;
		FR.isAndroid = /android/i.test(ua);
		FR.isTouch = FR.isIOS || FR.isAndroid;
		
		/**判断浏览器版本     结束*/
		/*
		 * 新代码 开始
		 */
		if(!FR.isIE || FR['isIE11'] || FR['isIE10'] || FR['isIE9']){
			var io = document.createElement('iframe');   
	        io.id = frameId;   
	        io.name = frameId;  
		} else if(FR['isIE8'] || FR['isIE7']){
			var io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');   
          	if(typeof uri== 'boolean'){   
            	io.src = 'javascript:false';   
          	} else if(typeof uri== 'string'){   
            	io.src = uri;   
          	}   
		}
		/*
		 * 新代码 结束
		 */
		/*
		 * 原代码 开始
		 */
//		if (window.ActiveXObject) {
//			var io = document.createElement('<iframe id="' + frameId
//					+ '" name="' + frameId + '" />');
//			if (typeof uri == 'boolean') {
//				io.src = 'javascript:false';
//			} else if (typeof uri == 'string') {
//				io.src = uri;
//			}
//		} else {
//			var io = document.createElement('iframe');
//			io.id = frameId;
//			io.name = frameId;
//		}
		/*
		 * 原代码 结束
		 */
		io.style.position = 'absolute';
		io.style.top = '-1000px';
		io.style.left = '-1000px';

		document.body.appendChild(io);

		return io;
	},
	createUploadForm : function(id, fileElementId) {
		// create form
		var formId = 'jUploadForm' + id;
		var fileId = 'jUploadFile' + id;
		var form = jQuery('<form  action="" method="POST" name="' + formId
				+ '" id="' + formId + '" enctype="multipart/form-data"></form>');
		var oldElement = jQuery('#' + fileElementId);
		var newElement = jQuery(oldElement).clone();
		jQuery(oldElement).attr('id', fileId);
		jQuery(oldElement).before(newElement);
		jQuery(oldElement).appendTo(form);
		// set attributes
		jQuery(form).css('position', 'absolute');
		jQuery(form).css('top', '-1200px');
		jQuery(form).css('left', '-1200px');
		jQuery(form).appendTo('body');
		return form;
	},

	ajaxFileUpload : function(s) {
		// TODO introduce global settings, allowing the client to modify them
		// for all requests, not only timeout
		s = jQuery.extend({}, jQuery.ajaxSettings, s);
		var id = s.fileElementId;
		var form = jQuery.createUploadForm(id, s.fileElementId);
		var io = jQuery.createUploadIframe(id, s.secureuri);
		var frameId = 'jUploadFrame' + id;
		var formId = 'jUploadForm' + id;

		if (s.global && !jQuery.active++) {
			// Watch for a new set of requests
			jQuery.event.trigger("ajaxStart");
		}
		var requestDone = false;
		// Create the request object
		var xml = {};
		if (s.global) {
			jQuery.event.trigger("ajaxSend", [xml, s]);
		}

		var uploadCallback = function(isTimeout) {
			// Wait for a response to come back
			var io = document.getElementById(frameId);
			try {
				if (io.contentWindow) {
					xml.responseText = io.contentWindow.document.body
							? io.contentWindow.document.body.innerHTML
							: null;
					xml.responseXML = io.contentWindow.document.XMLDocument
							? io.contentWindow.document.XMLDocument
							: io.contentWindow.document;

				} else if (io.contentDocument) {
					xml.responseText = io.contentDocument.document.body
							? io.contentDocument.document.body.innerHTML
							: null;
					xml.responseXML = io.contentDocument.document.XMLDocument
							? io.contentDocument.document.XMLDocument
							: io.contentDocument.document;
				}
			} catch (e) {
//				jQuery.handleError(s, xml, null, e);
				var text = xml.responseText;
				if(text == null || text == undefined || text == ''){
					xml = {};
					xml.status = 0;
				} else if(text.indexOf('401')>=0){
					xml.status = 401;
				}
				status = 'error';
				if(s.error){
					s.error(xml, xml, status);
				}
				return;
			}
			if (xml || isTimeout == "timeout") {
				requestDone = true;
				var status;
				try {
					status = isTimeout != "timeout" ? "success" : "error";
					// Make sure that the request was successful or notmodified
					if (status != "error") {
						// process the data (runs the xml through httpData
						// regardless of callback)
						var data = jQuery.uploadHttpData(xml, s.dataType);
						if (s.success) {
							// ifa local callback was specified, fire it and
							// pass it the data
							s.success(data, status);
						};
						if (s.global) {
							// Fire the global callback
							jQuery.event.trigger("ajaxSuccess", [xml, s]);
						};
					} else {
//						jQuery.handleError(s, xml, status, e);
						var text = xml.responseText;
						if(text == null || text == undefined || text == ''){
							xml = {};
							xml.status = 0;
						} else if(text.indexOf('401')>=0){
							xml.status = 401;
						}
						status = 'error';
						if(s.error){
							s.error(xml, xml, status);
						}
						return;
					}

				} catch (e) {
//					jQuery.handleError(s, xml, status, e);
					var text = xml.responseText;
					if(text == null || text == undefined || text == ''){
						xml = {};
						xml.status = 0;
					} else if(text.indexOf('401')>=0){
						xml.status = 401;
					}
					status = 'error';
					if(s.error){
						s.error(xml, xml, status);
					}
					return;
				};
				if (s.global) {
					// The request was completed
					jQuery.event.trigger("ajaxComplete", [xml, s]);
				};

				// Handle the global AJAX counter
				if (s.global && !--jQuery.active) {
					jQuery.event.trigger("ajaxStop");
				};
				if (s.complete) {
					s.complete(xml, status);
				};

				jQuery(io).unbind();

				setTimeout(function() {
							try {
								jQuery(io).remove();
								jQuery(form).remove();

							} catch (e) {
//								jQuery.handleError(s, xml, null, e);
								var text = xml.responseText;
								if(text == null || text == undefined || text == ''){
									xml = {};
									xml.status = 0;
								} else if(text.indexOf('401')>=0){
									xml.status = 401;
								}
								status = 'error';
								if(s.error){
									s.error(xml, xml, status);
								}
								return;
							}

						}, 100);

				xml = null;

			};
		}
		// Timeout checker
		if (s.timeout > 0) {
			setTimeout(function() {

						if (!requestDone) {
							// Check to see ifthe request is still happening
							uploadCallback("timeout");
						}

					}, s.timeout);
		}
		try {
			var form = jQuery('#' + formId);
			jQuery(form).attr('action', s.url);
			jQuery(form).attr('method', 'POST');
			jQuery(form).attr('target', frameId);
			if (form.encoding) {
				form.encoding = 'multipart/form-data';
			} else {
				form.enctype = 'multipart/form-data';
			}
			jQuery(form).submit();

		} catch (e) {
//			jQuery.handleError(s, xml, null, e);
			var text = xml.responseText;
			if(text == null || text == undefined || text == ''){
				xml = {};
				xml.status = 0;
			} else if(text.indexOf('401')>=0){
				xml.status = 401;
			}
			status = 'error';
			if(s.error){
				s.error(xml, xml, status);
			}
			return;
		}
		if (window.attachEvent) {
			document.getElementById(frameId).attachEvent('onload',
					uploadCallback);
		} else {
			document.getElementById(frameId).addEventListener('load',
					uploadCallback, false);
		}
		return {
			abort : function() {
			}
		};

	},

	uploadHttpData : function(r, type) {
		var data = !type;
		data = type == "xml" || data ? r.responseXML : r.responseText;
		// ifthe type is "script", eval it in global context
		if (type == "script") {
			jQuery.globalEval(data);
		}
		// Get the JavaScript object, ifJSON is used.
		if (type == "json") {
			data = data.replace(/<[^>]+>/g,"");
			eval("data = " + data);
			//data = $.parseJSON(data);
		}
		// evaluate scripts within html
		if (type == "html") {
			jQuery("<div>").html(data).evalScripts();
		}
		return data;
	}
});
/*********************************************************************************************************/