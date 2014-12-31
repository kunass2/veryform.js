/**
	"to make your form better"
 * Copyright (c) 20014 Bartłomiej Semańczyk - bartekss2@gmail.com| http://www.blue-world.pl
 * @version 1.0, 23 June 2014
 */

(function($){

	var form_counter = 0;
	$.fn.formex = function(myopts) {
		var myopts = myopts || {};
		var def_regex = { text : '/[^\\s]+/i', email : '/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i', checkbox : 1, textarea : '/[^\\s]+/i', radio : 1, select : 1, file: true, password: '/[^\\s]+/i' };
		var def_message = { text : 'nic nie wpisano', email : 'niepoprawny e-mail', checkbox : 'nie wybrano', textarea : 'nic nie wpisano', radio : 'nie wybrano', select : 'nie wybrano', file: 'nie wybrano pliku', password: 'zĹe hasĹo' };
		var opts = {
			wrap: false,
			wrapClass: '',
			setMessages : false,
			maxFileSize: 5000000,
			validateOnSubmit: true,
			onSuccess : function() {},
			onFailure : function() {},
			onLoad: function() {},
			onChange: function() {}, //checkbox + radio
			repair : true,
			init : false,
			initElems: '',
			on : 'keyup',
			exclude: '',
			autocomplete: false,
			regex : {},
			message : {}
		};
		$.extend(opts, myopts);

		function Formex(f) {
			var that = this;
			var elems;
			var formdata = { elems: { } };
			this.opts = opts;
			this.counter = 0;

			this.setDataId = function() {
				var o = $(this);
				var data = {};
				var type = o.attr('type');
				var name = o.attr('name');
				data['type'] = type ? type : o[0]['localName'] == 'input' ? 'text' : o[0]['localName'];
				data['name'] = name;
				data['regex'] = '';
				data['enabled'] = true;
				data['valid'] = false;
				data['sum'] = 1;
				data['is'] = 0;
				data['shouldbe'] = 0;

				for (var j in formdata.elems) {
					if (formdata.elems[j]['name'] == name) {
						formdata.elems[j]['sum']++;
						o.data('formex', formdata.elems[j]);
						return;
					}
				}

				formdata.elems[++that.counter] = data;
				// console.log('test', data);
				switch (data.type) {
					case 'textarea' :
					case 'select' :
					case 'file' :
					case 'password' :
					case 'email' :
					case 'text': data['id'] = that.counter; break;
					case 'radio' :
					case 'checkbox' : data.name ? data['id'] = that.counter : o.remove(); break;
				}
				// console.log('listek',formdata.elems[that.counter]);
				o.data('formex', formdata.elems[that.counter]);

			},

			// this.repairRegex = function(o) {
			// 	var data = o.data('formex');
			// 	var rgx = data.regex;
			// 	switch (data.type) {
			// 		case 'text' :
			// 		case 'textarea' :
			// 			!rgx.match(/^\/.*\/[img]{1,3}/g) ? that.setDataParameter.call(o, 'regex', def_regex[data.type]): '';
			// 		break;

			// 		case 'radio':
			// 		case 'checkbox':
			// 		case 'select':
			// 			isNaN(rgx) ? that.setDataParameter.call(o, 'regex', def_regex[data.type]): '';
			// 		break;

			// 		case 'file':
			// 			rgx !== true && rgx !== false ? that.setDataParameter.call(o, 'regex', def_regex[data.type]): '';
			// 		break;
			// 	}
			// };


			this.setValidTable = function() {
				var that = this;
				elems.each(function(){
					o = $(this);
					var data = o.data('formex');
					switch (data.type) {
						case 'radio' :
						case 'checkbox' :
							data.shouldbe = !isNaN(data.regex) ? parseInt(data.regex) : def_regex[data.type];
							o.is(':checked') ? data.is++ : '';
						break;
						case 'select' :
							data.shouldbe = parseInt(data.regex);
							o.val().length > 0 ? data.is = 1: '';
						break;
						case 'file' :
							data.shouldbe = data.regex == 'true' ? 1 : 0;
							o.val().length > 0 ? data.is = 1 : '';
							data['maxFileSize'] = that.opts.maxFileSize;
						break;
						default : data.shouldbe++; break;
					}
					that.checkStatus(o);
				});
			};

			// this.loadTrigger = {
			// 	text : function(o) {
			// 		o.trigger(that.opts.on);
			// 	},
			// 	checkbox : function(o) {
			// 		o.trigger('click').trigger('click');
			// 	},
			// 	textarea : function(o) {
			// 		o.trigger(that.opts.on);
			// 	},
			// 	radio : function(o) {
			// 		o.trigger('change');
			// 	},
			// 	select : function(o) {
			// 		o.trigger('change');
			// 	},
			// 	file : function(o) {
			// 		o.trigger('init');
			// 	}
			// };

			this.wrap = function() {
				if (that.opts.wrap) {
					var elemsToWrap = $();
					var recentid = undefined;
					var data;

					elems.each(function(){
						var o = $(this);
						data = o.data('formex');
						var wrapper = $('<div class="formex_wrap ' + that.opts.wrapClass + ' formex_' + data.name + ' formex_' + data.type + '" style="position: relative;" />');
						if (recentid != data.id) {
							elemsToWrap.wrapAll(wrapper);
							elemsToWrap = $();

							recentid = data.id;
							elemsToWrap = elemsToWrap.add(o);
							elemsToWrap = elemsToWrap.add(o.parents('form').find('label[for=' + o.attr('id') + ']'));
						} else {
							recentid = data.id;
							elemsToWrap = elemsToWrap.add(o);
							elemsToWrap = elemsToWrap.add(o.parents('form').find('label[for=' + o.attr('id') + ']'));
							// console.log('towrap',elemsToWrap);
						}

						// if (that.opts.init) {
						// 	that.loadTrigger[data.type](o);
						// }
					});

					elemsToWrap.wrapAll('<div class="formex_wrap ' + that.opts.wrapClass + ' formex_' + data.name + ' formex_' + data.type + '" style="position: relative;" />');

					if (that.opts.setMessages) {
						$('.formex_wrap').each(function(){
							var elem = $(this).find('.formex_item');
							var data = elem.data('formex');
							!$(this).find('.formex_message').length ? $(this).append('<span style="display: none;" class="formex_message formex_' + data.type + '">' + data.message + '</span>') : '';
						});
					}
				}
			};

			this.checkStatus = function(o) {
				var data = o.data('formex');
					/* positive and negative trigger */
				if (data.enabled) {
					// data.is >= data.shouldbe ? o.trigger('ontrue', o) : o.trigger('onfalse', o);
					data.valid = data.is >= data.shouldbe ? true : false;
				}
				data.valid ? o.trigger('ontrue', o) : o.trigger('onfalse', o);
				// console.log(formdata);
			};

			this.checkGlobalStatus = function() {
						// console.log(formdata.elems);
				var isSuccess = true;
				for (var i in formdata.elems) {
					// console.log('in', i, formdata);
					if (formdata.elems[i]['enabled']) {
						if ( formdata.elems[i]['is'] < formdata.elems[i]['shouldbe']) {
							isSuccess = false;
							that.opts.onFailure(f);
							f.removeClass('formex_success').addClass('formex_failure');
							break;
						}
					}
				}

				if (isSuccess) {
					that.opts.onSuccess(f);
					f.removeClass('formex_failure').addClass('formex_success');
				}
			};

			this.validate = {
				text : function(o) {
					var data = o.data('formex');
					var id = data.id;
					var regex = data.regex.match(/\/(.*)\/(.*)/);
					var val = o.val();
					var regexp_ob = new RegExp(regex[1], regex[2]);
					data.is = val.match(regexp_ob) ? Math.min(++data.is, 1) : Math.max(--data.is, 0);
				},
				checkbox : function(o) {
					var data = o.data('formex');
					var id = data.id;
					o.is(':checked') ? data.is++ : data.is-- ;
				},
				select : function(o) {
					var data = o.data('formex');
					var id = data.id;
					var val = o.val();
					data.is = val.match(/.+/i) ? 1 : 0;
				},

				file : function(o) {
					var data = o.data('formex');
					var id = data.id;
					var val = o.val();
					val.length > 0 && data['recentFileSize'] && data['recentFileSize'] <= data['maxFileSize'] ? data.is = 1 : data.is = 0 ;
				}
			};

			this.setHandlers = function() {
				f.find('input[type=checkbox], input[type=radio]').on("change init", function(e) {

					that.validate['checkbox']($(this));
					that.checkStatus($(this));
					that.opts.onChange.call($(this));

					that.checkGlobalStatus();
				});

				f.find('input[type=text], input[type=email], input[type=password], textarea').on(that.opts.on + ' init', function(e) {
					var which = e.which;
					if (which != 9){
						that.validate['text']($(this));
						that.checkStatus($(this));
						that.checkGlobalStatus();
					}
				});

				f.find('input[type=file]').on('change click init', function() {
					var data = $(this).data('formex');
					filesize = this.files[0] ? this.files[0].size/1024 : undefined;
					data['recentFileSize'] = filesize;
					that.validate['file']($(this));
					that.checkStatus($(this));
					that.checkGlobalStatus();
				});

				f.find('select').on("change init", function(e){
					that.validate['select']($(this));
					that.checkStatus($(this));
					that.checkGlobalStatus();
				});

				elems.on('ontrue', function() {
					$(this).parents('.formex_wrap').find('.formex_message').hide(300);
					$(this).parents('.formex_wrap').removeClass('formex_false').addClass('formex_true');
				});

				elems.on('onfalse', function() {
					$(this).parents('.formex_wrap').find('.formex_message').show(300);
					$(this).parents('.formex_wrap').removeClass('formex_true').addClass('formex_false');
				});

				if (that.opts.validateOnSubmit) {
					f.submit(function(e) {
						var focused = false;
						var error = false;
						elems.each(function(){
							var data = $(this).data('formex');
							var valid = data.valid;

							if (!valid && data.enabled == true) {

								error = true;
								$(this).trigger('init');
								if (!focused) {
									$(this).focus();
									focused = true;
								}
							}
						});
						if (error) {
							// console.log('error', error);
							e.preventDefault();
							e.stopPropagation();
							e.stopImmediatePropagation();
						}
					});
				}
			},

			this.setFormParameters = function() {

				formdata.id = ++form_counter;
				f.data('formex', formdata);
			},

			this.setDataParameter = function(key, value) {
				var data = $(this).data('formex');
				data[key] = value;
			},

			this.init = (function() {
				that.setFormParameters();
				elems = f.find('input[type!=submit][type!=hidden][type!=reset], textarea, select');

				elems.each(function(){
					that.setDataId.call($(this));
					$(this)[0]['localName'] == 'input' && !$(this).attr('type') ? $(this).attr('type', 'text') : '';
					$(this).addClass('formex_item');
					$(this).removeAttr('required');
					!that.opts.autocomplete ? $(this).attr('autocomplete', 'off') : '';
				});

				var excludedElems = f.find(that.opts.exclude);

				elems.each(function(){
					var data = $(this).data('formex');
					data['regex'] = def_regex[data.type];
					data['message'] = def_message[data.type];
				});

				for (var i in that.opts.regex) {
					f.find(i).each(function(){
						that.setDataParameter.call($(this), 'regex', that.opts.regex[i]);
					});
				}

				for (var i in that.opts.message) {
					f.find(i).each(function(){
						that.setDataParameter.call($(this), 'message', that.opts.message[i]);
					});
				}

				excludedElems.each(function(){
					that.setDataParameter.call($(this), 'enabled', false);
				});

				that.setValidTable();
				that.setHandlers();
				that.wrap();
				that.opts.onLoad(f);


			}).call(this);

			return that;
		};
		switch (myopts) {
			case 'enable':
				this.each(function(){
					var data = $(this).data('formex');
					data ? data.enabled = true : '';
				}); break;
			case 'disable':
				this.each(function(){
					var data = $(this).data('formex');
					data ? data.enabled = false : '';
				}); break;
			default: this.each(function(){
					var form = new Formex($(this));
				});
		}
	}
})(jQuery);





//end of file