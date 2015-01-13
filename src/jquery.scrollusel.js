;(function($, window, document, undefined) {

	var pluginName = 'scrollusel',
		defaults = {
			speed: 500,
			start: ':first',
			width: 'auto',
			position: 'left',
			offset: 0,
		};

	function Plugin (element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, $(this.element).data(), options);
		this._defaults = defaults;
		this._name = pluginName;
		this.vars = {
			running: false,
			width: 0
		};
		this.init();
	}

	$.extend(Plugin.prototype, {
		init: function() {
			var that = this;
			
			that.setStart();

			$(that.element).find('.prev').click(function(e) {
				that.scroll('prev', 'last', 'insertBefore', 'first');
				e.preventDefault();
			});

			$(that.element).find('.next').click(function(e) {
				that.scroll('next', 'first', 'insertAfter', 'last');
				e.preventDefault();
			});

			$(that.element).on('click', '.item .check', function(e) {
				$(this).parents('.products').toggleClass('active');
				e.preventDefault();
			});

			$(window).resize(function() {
				that.generate();
			});

			that.generate();
		},

		setStart: function() {
			var that = this;
			var index = $(that.element).find('.item'+that.settings.start).index() < 0 ? 0 : $(that.element).find('.item'+that.settings.start).index();

			$(that.element).find('.item:eq('+index+')').addClass('active');

			switch (index) {
				case 0:
					var times = 1;
					break;
				case 1:
					var times = $(that.element).find('.item').length;
					break;
				default:
					var times = $(that.element).find('.item').length - index + 1;
					break;
			}

			for (var i = times; i > 0; i--) {
				$(that.element).find('.item:last').insertBefore($(that.element).find('.item:first'));
			};
		},

		generate: function() {
			var that = this;
			var pane = 0;
			var widest = 0;

			that.vars.width = $(that.element).width();

			$(that.element).find('.item').each(function(k, v) {
				var w = that.settings.width == 'full' ? that.vars.width : that.settings.width;
				$(this).css('width', w);
				w = $(this).width();
				widest = widest < w ? w : widest
				pane += w;
			});

			$(that.element).find('.pane').css('width', pane + widest);

			that.resetPosition();
		},

		getOffset: function() {
			var active = $(this.element).find('.item.active');
			var position = $(active).position().left;
			var offset = position;
			switch (this.settings.position) {
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
			});
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

})(jQuery, window, document);