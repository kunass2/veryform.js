/**
	"to make your form better"
 * Copyright (c) 20014 BartĹomiej SemaĹczyk - bartekss2@gmail.com| http://www.blue-world.pl
 * @version 0.9, Friday, 18 April 2014
 */

(function($){

	var form_counter = 0;
	$.fn.formex = function(myopts) {
		var myopts = myopts || {};
		var def_regex = { text : '/[^\\s]+/i', checkbox : 1, textarea : '/[^\\s]+/i', radio : 1, select : 1, file: true, password: '/[^\\s]+/i' };
		var def_message = { text : 'nic nie wpisano', checkbox : 'nie wybrano', textarea : 'nic nie wpisano', radio : 'nie wybrano', select : 'nie wybrano', file: 'nie wybrano pliku', password: 'zĹe hasĹo' };
		var opts = {
			wrap: false,
			setMessages : true,
			maxFileSize: 30,
			onSuccess : function() { },
			onFailure : function() { },
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

			this.tmpTable = [];
			this.opts = opts;
			this.counter = 0;
			this.setDataType = {
				input : function(o) {
					!o.attr('type') ? o.attr('type', 'text') : undefined;
				},
				textarea : function(o) {
					!o.attr('type') ? o.attr('type', 'textarea') : undefined;
				},
				select : function(o) {
					!o.attr('type') ? o.attr('type', 'select') : undefined;
				}
			};

			this.setDataId = {
				text : function(o) {
					o.attr('data-form-id', ++that.counter);
				},
				checkbox : function(o) {
					if (o.attr('name')) {
						var table = that.tmpTable;
						var name = o.attr('name');
						table[name] == undefined ? table[name] = ++that.counter : '';
						for (var i in table) {
							if ( i == name ) {
								var id = o.attr('id');
								o.attr('data-form-id', table[i]);
								f.find('label[for=' + id + ']').attr('data-form-id', table[i]);
								break;
							}
						}
					} else {
						o.remove();
					}
				},

				radio : function(o) {
					that.setDataId['checkbox'](o);
				},

				textarea : function(o) {
					that.setDataId['text'](o);
				},

				select : function(o) {
					that.setDataId['text'](o);
				},

				file : function(o) {
					// o.attr('data-form-filesize', that.opts.maxFileSize);
					that.setDataId['text'](o);
				},

				password: function(o) {
					that.setDataId['text'](o);
				}

				//number, date, hidden, submit, email
			};

			this.objectToTmpTable = function(obj) {
				var table = this.tmpTable;
				for ( var i in obj) {
					f.find(i).each(function(){
						var a = [];
						a[0] = $(this);
						a[1] = obj[i];
						table.push(a);
					})
				};
			};

			this.setDataParam = function(name, o, def) {
				if (!o.attr(name)) {
					var t = this.tmpTable;
					var i = t.length;
					while ( --i >= 0 && t.length > 0 ) {
						if (o[0] === t[i][0][0]) {
							o.attr(name, t[i][1]);
							return;
						}
					};
					o.attr(name, def[o.attr('type')]);
				}
			};

			this.repairRegex = function(o) {
				var type = o.attr('type');
				var rgx = o.attr('data-form-regex');
				switch (type) {
					case 'text' :
					case 'textarea' :
						!rgx.match(/^\/.*\/[img]{1,3}/g) ? o.attr('data-form-regex', def_regex[type]): '';
					break;

					case 'radio':
					case 'checkbox':
					case 'select':
						isNaN(rgx) ? o.attr('data-form-regex', def_regex[type]): '';
					break;

					case 'file':
						rgx !== true && rgx !== false ? o.attr('data-form-regex', def_regex[type]): '';
					break;
				}
			};

			this.clearTmpTable = function() {
				this.tmpTable = [];
			};

			this.setValidTable = function() {
				for ( var i = 1; i <= this.counter; i++ ) {
					var elems = f.find('[data-form-id=' + i + ']');
					var type = elems.eq(0).attr('type');
					var is = 0;
					var shouldbe = 0;
					that.tmpTable[i] = [];
					switch (type) {
						case 'radio' :
						case 'checkbox' :
							shouldbe = !isNaN(elems.eq(0).attr('data-form-regex')) ? parseInt(elems.eq(0).attr('data-form-regex')) : def_regex[type];
							elems.each(function(){
								$(this).is(':checked') ? is++ : '';
							}); break;
						case 'select' :
							shouldbe = parseInt(elems.eq(0).attr('data-form-regex'));
							elems.eq(0).val().length > 0 ? is = 1: ''; break;
						case 'file':
							shouldbe = elems.eq(0).attr('data-form-regex') == 'true' ? 1 : 0;
							elems.eq(0).val().length > 0 ? is = 1 : '';
							// console.log(that.opts.maxFileSize);
							that.tmpTable[i]['maxFileSize'] = that.opts.maxFileSize;

							break;
						default : ++shouldbe; break;
					}

					that.tmpTable[i]['is'] = is;
					that.tmpTable[i]['shouldbe'] = shouldbe;
					elems.each(function(){
						$(this).data('data-form',that.tmpTable[i]);
					})
				}
			};

			this.loadTrigger = {
				text : function(o) {
					o.trigger(that.opts.on);
				},
				checkbox : function(o) {
					o.trigger('click').trigger('click');
				},
				textarea : function(o) {
					o.trigger(that.opts.on);
				},
				radio : function(o) {
					o.trigger('change');
				},
				select : function(o) {
					o.trigger('change');
				},
				file : function(o) {
					o.trigger('init');
				}
			};

			this.wrap = function() {
				if (that.opts.wrap) {
					for (var i = 1; i <= this.counter; i++) {
						var elems = f.find('[data-form-id=' + i + ']');
						var elemsToWrap = $();

						elems.each(function(){
							if ($(this).parent().next('[data-form-id=' + $(this).attr('data-form-id') + ']').length) {
								elemsToWrap = elemsToWrap.add($(this).parent());
							} else {
								elemsToWrap = elemsToWrap.add($(this));
							}
						});

						elemsToWrap.wrapAll('<div class="formex_wrap formex_' + elems.eq(0).attr('name') + ' formex_' + elems.eq(0).attr('type') + '" style="position: relative;" />');
						if (that.opts.setMessages) {
							elems.parents('.formex_wrap').append('<span style="display: none;" class="formex_message formex_' + elems.eq(0).attr('type') + '">' + elems.eq(0).attr('data-form-message') + '</span>');
						}
						if (that.opts.init) {
							that.loadTrigger[elems.eq(0).attr('type')](elems.eq(0));
						}
					}
				}
			};

			this.checkStatus = function(o) {
				var id = o.attr('data-form-id');
				that.tmpTable[id]['is'] >= that.tmpTable[id]['shouldbe'] ?
/* positive and negative trigger */
					o.trigger('ontrue', o) :
					o.trigger('onfalse', o);
			};

			this.checkGlobalStatus = function() {
				for (var i in that.tmpTable) {

					if ( that.tmpTable[i]['is'] < that.tmpTable[i]['shouldbe']) {
						that.opts.onFailure(f);
						f.removeClass('formex_success').addClass('formex_failure');
						break;
					} else if (i == that.tmpTable.length - 1) {
						that.opts.onSuccess(f);
						f.removeClass('formex_failure').addClass('formex_success');
					}
				}
				// console.log(that.tmpTable);

			};

			this.validate = {
				text : function(o) {
					var id = o.attr('data-form-id');
					var regex = o.attr('data-form-regex').match(/\/(.*)\/(.*)/);
					var val = o.val();
					var regexp_ob = new RegExp(regex[1], regex[2]);
					val.match(regexp_ob) ?
						that.tmpTable[id]['is'] = Math.min(++that.tmpTable[id]['is'], 1) :
						that.tmpTable[id]['is'] = Math.max(--that.tmpTable[id]['is'] , 0) ;
				},
				checkbox : function(o) {
					var id = o.attr('data-form-id');
					o.is(':checked') ? that.tmpTable[id]['is']++ : that.tmpTable[id]['is']-- ;
				},
				select : function(o) {
					var val = o.val();
					var id = o.attr('data-form-id');
					val.match(/.+/i) ? that.tmpTable[id]['is'] = 1 : that.tmpTable[id]['is'] = 0 ;
				},

				file : function(o) {
					var val = o.val();
					var id = o.attr('data-form-id');
					console.log('before',that.tmpTable[id]);
					val.length > 0 && that.tmpTable[id]['recentFileSize'] && that.tmpTable[id]['recentFileSize'] <= that.tmpTable[id]['maxFileSize'] ? that.tmpTable[id]['is'] = 1 : that.tmpTable[id]['is'] = 0 ;
					console.log('after',that.tmpTable[id]);
				}
			};

			this.setHandlers = function() {

				f.find('input[type=checkbox].formex-item, input[type=radio].formex-item').on("change click", function(e) {
					that.validate['checkbox']($(this));
					that.checkStatus($(this));
					that.checkGlobalStatus();
					that.opts.onChange.call($(this));
				});

				f.find('input[type=text].formex-item, input[type=password].formex-item, textarea.formex-item').on(that.opts.on, function(e) {
					var which = e.which;
					if (which != 9){
						that.validate['text']($(this));
						that.checkStatus($(this));
						that.checkGlobalStatus();
					}
				});

				f.find('input[type=file].formex-item').on('change click init', function() {
					// console.log(this.files[0]);
					filesize = this.files[0] ? this.files[0].size/1024 : undefined;
					that.tmpTable[$(this).attr('data-form-id')]['recentFileSize'] = filesize;
					that.validate['file']($(this));
					that.checkStatus($(this));
					that.checkGlobalStatus();
				});

				f.find('select.formex-item').on("change", function(e){
					that.validate['select']($(this));
					that.checkStatus($(this));
					that.checkGlobalStatus();
				});

				f.find('[data-form-id]').on('ontrue', function() {
					$(this).parents('.formex_wrap').find('.formex_message').hide(300);
					$(this).parents('.formex_wrap').removeClass('formex_false').addClass('formex_true');
				});

				f.find('[data-form-id]').on('onfalse', function() {
					$(this).parents('.formex_wrap').find('.formex_message').show(300);
					$(this).parents('.formex_wrap').removeClass('formex_true').addClass('formex_false');
				});
			};

			this.init = (function() {
				f.attr('data-formex-id', form_counter++);
				var elems = f.find('input[type!=submit][type!=hidden][type!=reset], textarea, select').not(that.opts.exclude);
				elems.each(function(){
					$(this).addClass('formex-item');
					that.setDataType[$(this)[0]['localName']]($(this));
				});

				that.clearTmpTable();

				that.objectToTmpTable(that.opts.regex);
				elems.each(function(){
					that.setDataParam('data-form-regex', $(this), def_regex);
					$(this).removeAttr('required');
				});

				elems.each(function(){
					that.setDataId[$(this).attr('type')]($(this));
					!that.opts.autocomplete ? $(this).attr('autocomplete', 'off') : '';
					that.opts.repair ? that.repairRegex($(this)) : '';
				});

				that.clearTmpTable();

				that.objectToTmpTable(that.opts.message);
				elems.each(function(){
					that.setDataParam('data-form-message', $(this), def_message);
				});

				// var initElems = $(that.opts.initElems);

				// if (!that.opts.init) {
				// 	// console.log(initElems);
				// 	initElems.each(function(){
				// 		// console.log($(this));
				// 		that.loadTrigger[$(this).attr('type')]($(this));
				// 	});
				// }

				that.clearTmpTable();

				that.setValidTable();
				that.setHandlers();
				that.wrap();
				that.opts.onLoad(f);
				f.data('data-formex', that);

			}).call(this);
		};
		switch (myopts) {
			case 'sth': ''; break;
			default: this.each(function(){
					var form = new Formex($(this));
				}); break;
		}
	}
})(jQuery);





//end of file