/*!
 * scrollousel,  version: 0.3.0
 * http://lszymkowiak.com/scrollousel
 * Copyright 2015 Łukasz Szymkowiak <dev@lszymkowiak.com>
 * Licensed under MIT (https://github.com/lszymkowiak/scrollousel/blob/master/LICENSE)
 */

;(function($, window, document, undefined) {

	var pluginName = 'scrollusel';
	var defaults = {
		autoplay: [0, 'left', true],
		align: 'left',
		// infinity: false,
		offset: 0,
		speed: 500,
		start: ':first',
		width: 'auto',
		width_xs: false,
		width_sm: false,
		width_md: false,
		width_lg: false,
		onInit: null,
	};

	function Plugin(element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options, $(this.element).data());
		this._defaults = defaults;
		this._name = pluginName;
		this.vars = {
			// active: 1,
			items: 0,
			running: false,
			timeout: null,
			width: 0
		};
		this.init();
	}

	$.extend(Plugin.prototype, {
		init: function() {
			var that = this;

			that.shift();

			$(that.element).find('.prev').click(function(e) {
				that.scroll('prev', 'last', 'insertBefore', 'first');
				e.preventDefault();
			});

			$(that.element).find('.next').click(function(e) {
				that.scroll('next', 'first', 'insertAfter', 'last');
				e.preventDefault();
			});

			if (parseInt(that.settings.autoplay[0]) > 0 && that.settings.autoplay[2] === true) {
				$(that.element).mouseenter(function(e) {
					clearTimeout(that.vars.timeout);
				}).mouseleave(function() {
					that.autoplay();
				});
			}

			$(window).resize(function() {
				that.adjust();
			}).load(function() {
				if ($(that.element).is(':hover') === false) {
					that.autoplay();
				}
			});
	
			that.adjust();
		},

		shift: function() {
			var that = this;
			var copy, index, start;

			index = $(that.element).find('.item'+that.settings.start).index() < 0 ? 0 : $(that.element).find('.item'+that.settings.start).index();
			that.vars.items = $(that.element).find('.item').length;

			switch (that.settings.align) {
				case 'right':
					copy = 1;
					start = that.vars.items -2;
					break;
				case 'center':
					copy = Math.ceil(that.vars.items / 2);
					start = Math.floor(that.vars.items / 2 - 1);
					break;
				default:
				case 'left':
					copy = that.vars.items - 2;
					start = 1;
					break;
			}

			switch (index) {
				case 0:
					break;
				case 1:
					copy += 1;
					break;
				default:
					copy = Math.abs(copy - Math.abs(index - that.vars.items));
					break;
			}

			$(that.element).find('.item:gt('+copy+')').insertBefore($(that.element).find('.item:first'));
			$(that.element).find('.item:eq('+start+')').addClass('active');
		},

		adjust: function() {
			var that = this;
			var pane = 0;
			var widest = 0;
			var iw = 0;

			that.vars.width = $(that.element).width();

			var w = that.calculateWidth();
			
			$(that.element).find('.item').each(function(k, v) {
				$(this).css('width', w);
				iw = $(this).width();
				widest = widest < iw ? iw : widest;
				pane += iw;
			});

			$(that.element).find('.pane').css('width', pane + widest);

			that.resetPosition();
		},

		calculateWidth: function() {
			var that = this;
			var w = that.settings.width;
			var width = window.innerWidth;

			if (that.settings.width_xs && width >= that.settings.width_xs[0]) {
				w = that.settings.width_xs[1];
			}
			if (that.settings.width_sm && width >= that.settings.width_sm[0]) {
				w = that.settings.width_sm[1];
			}
			if (that.settings.width_md && width >= that.settings.width_md[0]) {
				w = that.settings.width_md[1];
			}
			if (that.settings.width_lg && width >= that.settings.width_lg[0]) {
				w = that.settings.width_lg[1];
			}

			if (w == 'full') {
				w = that.vars.width;
			} else if (String(w).substr(w.length - 1) === '%') {
				w = that.vars.width * parseInt(w) / 100;
			}

			return w;
		},

		getOffset: function() {
			var active = $(this.element).find('.item.active');
			// console.log(active);
			var position = $(active).position().left;
			var offset = position;
			switch (this.settings.align) {
				case 'right':
					offset -= this.vars.width - $(active).width();
					break;
				case 'center':
					offset -= this.vars.width / 2 - $(active).width() / 2;
					break;
			}

			return 0 - offset + (String(this.settings.offset).substr(this.settings.offset.length - 1) === '%' ? (parseInt(this.settings.offset) * this.vars.width / 100) : parseInt(this.settings.offset));
		},

		resetPosition: function() {
			$(this.element).find('.pane').css('left', this.getOffset() + 'px');
		},

		scroll: function(direction, clone, insert, to) {
			var that = this;
			var active = $(this.element).find('.item.active');

			if (that.vars.running) return;
			that.vars.running = true;
			// that.vars.active += (direction == 'next' ? 1 : -1);

			clearTimeout(that.vars.timeout);

			// console.log(that.vars.active+' > '+that.vars.items);
			// if (that.settings.infinity === false && that.vars.active > that.vars.items) {
			// 	console.log('end prev');
			// 	that.vars.active = 1;
			// } else if (that.settings.infinity === false && that.vars.active < 1) {
			// 	console.log('end prev');
			// } else if (that.vars.infinity == true) {
			// 	$(that.element).find('.item:'+clone).clone()[insert]($(that.element).find('.item:'+to));
			// 	that.resetPosition();
			// }
			// console.log(find);

			$(that.element).find('.item:'+clone).clone()[insert]($(that.element).find('.item:'+to));
			that.resetPosition();

			$(active)[direction]().addClass('active');
			// $(that.element).find('.item:eq('+that.vars.active+')').addClass('active');
			$(active).removeClass('active');

			$(that.element).find('.pane').clearQueue().animate({
				left: this.getOffset()
			}, that.settings.speed, function() {
				// if (that.vars.infinity == true) {
					$(that.element).find('.item:'+clone).remove();
				// }
				that.resetPosition();
				that.vars.running = false;
				that.autoplay();
			});
		},

		autoplay: function() {
			var that = this;
			if (parseInt(that.settings.autoplay[0]) > 0) {
				that.vars.timeout = setTimeout(function() {
					if (that.settings.autoplay[1] == 'right') {
						that.scroll('prev', 'last', 'insertBefore', 'first');
					} else {
						that.scroll('next', 'first', 'insertAfter', 'last');
					}
				}, that.settings.autoplay[0]);
			}
		}
	});

	$.fn[pluginName] = function(options) {
		this.each(function() {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});

		return this;
	};

	$(window).load(function() {
		$('.'+pluginName)[pluginName]();
	});


})(jQuery, window, document);