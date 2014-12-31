var elems = $('some elems');
this.wrap = function() {
	if (that.opts.wrap) {

		elems.each(function(){
			var o = $(this);
			var wrapper = $('<div class="formex_wrap />');
			o.wrapAll(wrapper);
		});

		if (that.opts.setMessages) {
			$('.formex-wrap'); //puste

		}
	}
}

this.init = function() {
	this.wrap();
}