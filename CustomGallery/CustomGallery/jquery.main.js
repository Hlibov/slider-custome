jQuery(function() {
	
});

jQuery(window).on('load', function() {
	initCustomGallery();
});

//switching slides on prev/next slide line 246


//init custom gallery
function initCustomGallery(){
	jQuery('.custom-gallery').each(function(){
		var holder = jQuery(this);

		imagesLoaded(holder, function(){
			holder.carousel({
				mask: '.mask',
				slides: '.slide',
				switchTime: '4000',
				prevBtnSelector: '.prev',
				nextBtnSelector: '.next',
				autorotation: false
			});
		});
	});

	function imagesLoaded(newItems, complete) {
		var self = this;
		if (jQuery.isFunction(window.picturefill)) {
			picturefill();
		}
		setTimeout(function() {
			var newImages = newItems.find('img'),
			imagesCount = newImages.length,
			loadedCount = 0;

			if (imagesCount) {
				newImages.each(function() {
					var image = jQuery(this);
					jQuery('<img />').on('load error', function() {
						loadedCount++;
						if (loadedCount === imagesCount) {
							complete();
						}
					}).attr('src', image.attr('src'));
				});

			} else {
				complete();
			}
		}, 100);
	}
}


/*
 * Responsive Layout helper
 */
ResponsiveHelper = (function($){
	// init variables
	var handlers = [],
		prevWinWidth,
		win = $(window),
		nativeMatchMedia = false;

	// detect match media support
	if(window.matchMedia) {
		if(window.Window && window.matchMedia === Window.prototype.matchMedia) {
			nativeMatchMedia = true;
		} else if(window.matchMedia.toString().indexOf('native') > -1) {
			nativeMatchMedia = true;
		}
	}

	// prepare resize handler
	function resizeHandler() {
		var winWidth = win.width();
		if(winWidth !== prevWinWidth) {
			prevWinWidth = winWidth;

			// loop through range groups
			$.each(handlers, function(index, rangeObject){
				// disable current active area if needed
				$.each(rangeObject.data, function(property, item) {
					if(item.currentActive && !matchRange(item.range[0], item.range[1])) {
						item.currentActive = false;
						if(typeof item.disableCallback === 'function') {
							item.disableCallback();
						}
					}
				});

				// enable areas that match current width
				$.each(rangeObject.data, function(property, item) {
					if(!item.currentActive && matchRange(item.range[0], item.range[1])) {
						// make callback
						item.currentActive = true;
						if(typeof item.enableCallback === 'function') {
							item.enableCallback();
						}
					}
				});
			});
		}
	}
	win.bind('load resize orientationchange', resizeHandler);

	// test range
	function matchRange(r1, r2) {
		var mediaQueryString = '';
		if(r1 > 0) {
			mediaQueryString += '(min-width: ' + r1 + 'px)';
		}
		if(r2 < Infinity) {
			mediaQueryString += (mediaQueryString ? ' and ' : '') + '(max-width: ' + r2 + 'px)';	
		}
		return matchQuery(mediaQueryString, r1, r2);
	}

	// media query function
	function matchQuery(query, r1, r2) {
		if(window.matchMedia && nativeMatchMedia) {
			return matchMedia(query).matches;
		} else if(window.styleMedia) {
			return styleMedia.matchMedium(query);
		} else if(window.media) {
			return media.matchMedium(query);
		} else {
			return prevWinWidth >= r1 && prevWinWidth <= r2;
		}
	}

	// range parser
	function parseRange(rangeStr) {
		var rangeData = rangeStr.split('..');
		var x1 = parseInt(rangeData[0], 10) || -Infinity;
		var x2 = parseInt(rangeData[1], 10) || Infinity;
		return [x1, x2].sort(function(a, b){
			return a - b;
		});
	}

	// export public functions
	return {
		addRange: function(ranges) {
			// parse data and add items to collection
			var result = {data:{}};
			$.each(ranges, function(property, data){
				result.data[property] = {
					range: parseRange(property),
					enableCallback: data.on,
					disableCallback: data.off
				};
			});
			handlers.push(result);

			// call resizeHandler to recalculate all events
			prevWinWidth = null;
			resizeHandler();
		}
	};
}(jQuery));

 /*
 * jQuery CustomGallery plugin
 */
;(function($) {
	function Carousel(options) {
		this.options = $.extend({
			mask: '.mask',
			slides: '.slide',
			activeClass: 'active',
			prevSlideClass: 'prev-slide',
			nextSlideClass: 'next-slide',
			autorotation: true,
			switchTime: '4000',
			pagerHolder: '.pagination',
			pagerListItem: '<li><a href="#"></a></li>',
			pagerListItemText: 'a',
			prevBtnSelector: '.prev',
			nextBtnSelector: '.next',
			generatePagination: true,
			useMaxHeight: true
		}, options);
		this.init();
	}
	
	Carousel.prototype = {
		init: function() {
			if (this.options.holder) {
				this.findElements();
				this.attachEvents();
				this.makeCallback('onInit', this);
			}
		},
		findElements: function() {
			this.win = $(window);
			this.holder = $(this.options.holder);
			this.mask = this.holder.find(this.options.mask);
			this.slides = this.holder.find(this.options.slides);
			this.currentIndex = 0;
			this.activeSlide = this.slides.eq(this.currentIndex).addClass(this.options.activeClass);
			this.pagerHolder = this.holder.find(this.options.pagerHolder);
			this.prevBtn = this.holder.find(this.options.prevBtnSelector);
			this.nextBtn = this.holder.find(this.options.nextBtnSelector);
		},
		attachEvents: function() {
			// add handler
			var self = this;
			var isTouchDevice = /Windows Phone/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

			if (this.options.generatePagination) {
				this.buildPagination();
			}

			this.switchSlide();

			if (this.options.autorotation) {
				this.startAutorotation();
			}

			this.resizeHandler = function(){
				self.setMaskSize();
			}

			this.prevClickHandler = function(e){
				e.preventDefault();
				self.prevSlide();
			}

			this.nextClickHandler = function(e){
				e.preventDefault();
				self.nextSlide();
			}

			if (window.Hammer && isTouchDevice) {
				Hammer(self.holder[0])
					.on("swipeleft", self.nextClickHandler)
					.on("swiperight", self.prevClickHandler);
			}

			this.win.on('resize orientationchange', this.resizeHandler);
			this.prevBtn.on('click', this.prevClickHandler);
			this.nextBtn.on('click', this.nextClickHandler);
			
			//switch slides on prev/next clicking
			this.slides.on('click', function(e){
				var $target = $(e.target);
				if ($target.is(self.options.slides) || $target.closest(self.options.slides)) {
					var c = $target.closest(self.options.slides).index();
					self.numSlide(c);
				}
			});
		},
		showSlide: function(){
			var self = this;

			this.animFlag = true;
			this.holder.addClass('is-animating');

			this.slides
				.removeClass(this.options.nextSlideClass)
				.removeClass(this.options.prevSlideClass)
				.removeClass(this.options.activeClass);

			this.slides.eq(this.prevIndex).addClass(this.options.prevSlideClass);
			this.activeSlide = this.slides.eq(this.currentIndex).addClass(this.options.activeClass);
			this.slides.eq(this.nextIndex).addClass(this.options.nextSlideClass);
			
			this.setMaskSize();

			CssAnimationHelper.addAnimation({
				item: self.activeSlide,
				once: true,
				complete: function(element) {
					self.animFlag = false;
					self.holder.removeClass('is-animating');
				}
			});

			if (this.options.autorotation) {
				this.startAutorotation();
			}
		},
		nextSlide: function() {
			if (this.animFlag) return;

			if (this.currentIndex < this.slides.length - 1) {
				this.currentIndex++;
			} else {
				this.currentIndex = 0;
			}

			this.switchSlide();

			if (this.options.autorotation) {
				this.startAutorotation();
			}
		},
		prevSlide: function() {
			if (this.animFlag) return;

			if (this.currentIndex <= 0) {
				this.currentIndex = this.slides.length - 1;
			} else {
				this.currentIndex--;
			}

			this.switchSlide();

			if (this.options.autorotation) {
				this.startAutorotation();
			}
		},
		switchSlide: function(){
			if (this.currentIndex === this.slides.length - 1) {
				this.nextIndex = 0;
			} else {
				this.nextIndex = this.currentIndex + 1;
			}

			this.prevIndex = this.currentIndex - 1;

			this.showSlide();
			if (this.options.generatePagination) {
				this.switchPagination();
			}
		},
		numSlide: function(c) {
			if(this.currentIndex != c) {
				this.currentIndex = c;
				this.switchSlide();
			}
		},
		buildPagination: function(){
			var self = this;

			this.slides.each(function(i){
				$(self.options.pagerListItem).appendTo(self.pagerHolder).find(self.options.pagerListItemText).text(i+1);
			});

			this.pagerLinks = this.pagerHolder.find(self.options.pagerListItemText);

			this.attachPaginationEvents();
		},
		switchPagination: function(){
			this.pagerLinks.parent().removeClass(this.options.activeClass);
			this.pagerLinks.parent().eq(this.currentIndex).addClass(this.options.activeClass);
		},
		attachPaginationEvents: function() {
			var self = this;

			this.pagerLinksHandler = function(e) {
				e.preventDefault();

				self.numSlide(self.pagerLinks.index(e.currentTarget));

				if (self.options.autorotation) {
					self.startAutorotation();
				}
			};

			this.pagerLinks.on('click', this.pagerLinksHandler);
		},
		setMaskSize: function(){
			if (this.options.useMaxHeight) {
				this.mask.css({
					height: this.getMaxHeight()
				});
			} else {
				this.mask.css({
					height: this.activeSlide.outerHeight()
				});
			}
		},
		getMaxHeight: function(){
			maxHeight = 0;

			this.slides.each(function(){
				var slide = $(this);

				if (maxHeight < slide.outerHeight()) {
					maxHeight = slide.outerHeight();
				}
			});

			return maxHeight;
		},
		startAutorotation: function() {
			var self = this;

			clearTimeout(this.timer);
			this.timer = setTimeout(function(){
				self.nextSlide();
			}, self.options.switchTime);
		},
		makeCallback: function(name) {
			if (typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	};

	// jQuery plugin interface
	$.fn.carousel = function(opt) {
		return this.each(function() {
			jQuery(this).data('Carousel', new Carousel($.extend(opt, { holder: this })));
		});
	};
}(jQuery));

var CssAnimationHelper = {
	init: function() {
		this.transitionEvent = this.getTransitionEvent();
		this.animationEvent = this.getAnimationEvent();
	},
	getTransitionEvent: function() {
		var t,
			el = document.documentElement,
			transitions = {
				'transition': 'transitionend',
				'OTransition': 'oTransitionEnd',
				'MozTransition': 'transitionend',
				'WebkitTransition': 'webkitTransitionEnd'
			};

		for (t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	},
	getAnimationEvent: function() {
		var t,
			el = document.documentElement,
			transitions = {
				'animation': 'animationend',
				'OAnimation': 'oAnimationEnd',
				'MozAnimation': 'animationend',
				'webkitAnimation': 'webkitAnimationEnd'
			};

		for (t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	},
	addAnimation: function(obj) {
		if (!this.transitionEvent || !this.animationEvent) {
			this.init();
		}
		var self = this;
		var animFunction = function(e) {
			var target = jQuery(e.target);
			if (target.is(obj.item)) {
				if (obj.once) {
					obj.item.off(obj.type === 'animation' ? self.animationEvent : self.transitionEvent, animFunction);
				}
				if (jQuery.isFunction(obj.complete)) obj.complete();
			}
		};
		obj.item.on(obj.type === 'animation' ? self.animationEvent : self.transitionEvent, animFunction);
	}
};
