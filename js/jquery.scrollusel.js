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
		offset: 0,
		speed: 500,
		start: ':first',
		width: 'auto',
	};

	function Plugin(element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options, $(this.element).data());
		this._defaults = defaults;
		this._name = pluginName;
		this.vars = {
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
			var copy, index, start, total;

			index = $(that.element).find('.item'+that.settings.start).index() < 0 ? 0 : $(that.element).find('.item'+that.settings.start).index();
			total = $(that.element).find('.item').length;

			switch (that.settings.align) {
				case 'right':
					copy = 1;
					start = total -2;
					break;
				case 'center':
					copy = Math.ceil(total / 2);
					start = Math.floor(total / 2 - 1);
					break;
				default:
				case 'left':
					copy = total - 2;
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
					copy = Math.abs(copy - Math.abs(index - total));
					break;
			}

			$(that.element).find('.item:gt('+copy+')').insertBefore($(that.element).find('.item:first'));
			$(that.element).find('.item:eq('+start+')').addClass('active');
		},

		adjust: function() {
			var that = this;
			var pane = 0;
			var widest = 0;

			that.vars.width = $(that.element).width();

			$(that.element).find('.item').each(function(k, v) {
				var w = that.settings.width == 'full' ? that.vars.width : that.settings.width;
				$(this).css('width', w);
				w = $(this).width();
				widest = widest < w ? w : widest;
				pane += w;
			});

			$(that.element).find('.pane').css('width', pane + widest);

			that.resetPosition();
		},

		getOffset: function() {
			var active = $(this.element).find('.item.active');
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
			return 0 - offset + this.settings.offset;
		},

		resetPosition: function() {
			$(this.element).find('.pane').css('left', this.getOffset() + 'px');
		},

		scroll: function(direction, clone, insert, to) {
			var that = this;
			var active = $(this.element).find('.item.active');

			if (that.vars.running) return;
			that.vars.running = true;

			clearTimeout(that.vars.timeout);

			$(that.element).find('.item:'+clone).clone()[insert]($(that.element).find('.item:'+to));

			that.resetPosition();

			$(active)[direction]('.item').addClass('active');
			$(active).removeClass('active');
			$(active).find('.products.active').removeClass('active');

			$(that.element).find('.pane').clearQueue().animate({
				left: this.getOffset()
			}, that.settings.speed, function() {
				$(that.element).find('.item:'+clone).remove();
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

	$(document).ready(function() {
    	$('.'+pluginName)[pluginName]();
	});

})(jQuery, window, document);