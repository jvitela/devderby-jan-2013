(function($) {

  var DragDropStore = {
    id:       null,
    data:     null,
    source:   null,
    transfer: null,

    init: function(id, event) {
      this.id       = id;
      this.transfer = this.getDataTransfer(event); 
      this.transfer.setData('text', this.id);
      return this;
    },

    getDataTransfer: function(event) {
      if (event.originalEvent) {
        event = event.originalEvent;
      }
      return event.dataTransfer;
    }
  };

	var Draggable = function(element, options) {
		this.options = options;
		this.el  = element;
		this.$el = $(element);
		this.$el
			.addClass("draggable")
			.attr("draggable", "true")
			.on("dragstart", $.proxy(this.onDragStart, this))
			.on("dragend", $.proxy(this.onDragEnd, this));
	}

	Draggable.prototype = {
		constructor: Draggable,

		onDragStart: function(event) {
			var opts = this.options,
		      id 	 = opts.id;

			this.$el.addClass("drag-start");
			// it is required to set some data, otherwise doesn't work
			DragDropStore.init(id, event);
			DragDropStore.source = this.el;
			DragDropStore.data = this.options.data;
			DragDropStore.transfer.effectAllowed = opts.effectAllowed;

			if (this.options.dragImage && DragDropStore.transfer.setDragImage) {
			  DragDropStore.transfer.setDragImage(this.options.dragImage, this.options.dragImagePos.x, this.options.dragImagePos.y);
			}

			this.$el.trigger('dd-dragstart.'+id, [id, DragDropStore.transfer]);
		},

		onDragEnd: function(event) { 
		  var id = this.options.id;
			this.$el.removeClass("drag-start");
			this.$el.trigger('dd-dragend.'+id, [DragDropStore.data, DragDropStore.transfer]);
		},

		data: function(info) {
			if (!info) {
				return DragDropStore.data;
			}
			DragDropStore.data = info;
		}
	};

	$.fn.draggable = function(option) {
		return $(this).each(function () {
			var $this 	= $(this);
			var data 	= $this.data('draggable');
			var options = $.extend({}, $.fn.draggable.defaults, $this.data(), typeof option == 'object' && option)
			if ( !data ) {
				data = new Draggable(this, options)
				$this.data('draggable', data);
			}
			if (typeof option == 'string') data[option]();
		});
	};

	$.fn.draggable.defaults = {
		id:				"custom",
		data: 			"custom",
		effectAllowed:	"move",
		dragImage:		false,
		dragImagePos:	{x:0, y:0}
	};

	var Droppable = function (element, options) {
		this.options = options;
		this.el  = element;
		this.$el = $(element);
		this.$el
			.addClass("droppable")
			.on("dragover",	 $.proxy(this.onDragOver, this))
			.on("dragenter", $.proxy(this.onDragEnter, this))
			.on("dragleave", $.proxy(this.onDragLeave, this))
			.on("drop", 	 $.proxy(this.onDrop, this));

		this.dragActive = 0;
		this.dragPrevented = false;
	}

	Droppable.prototype = {
		constructor: Droppable,

		onDragOver: function ( event) {
			var id = DragDropStore.id;
			// Do not allow to drop on itself
			if( this.dragPrevented || DragDropStore.source===this.el ) {
				return true;
			}

			// Necessary. Allows us to drop
			event.preventDefault();

			this.$el.trigger("dd-dragover."+id, [DragDropStore.data, DragDropStore.transfer]);

			return false;
		},

		onDragEnter: function ( event ) {
			var id = DragDropStore.id;
			// Do not allow to drop on itself
			if( id==="" || DragDropStore.source===this.el ) {
				return true;
			}

			this.dragActive += 1;
			if( this.dragActive>1 ) {
				return true;
			}

			// verify exclusions
			var accepts = this.options.accepts;
			if( accepts && !$(DragDropStore.source).is( accepts ) ) {
				this.dragPrevented = true;
				return true;
			}

			this.$el
				.addClass("drag-over")
				.trigger("dd-dragenter."+id, [DragDropStore.data, DragDropStore.transfer]);

			return false;
		},

		onDragLeave: function ( event ) {
			var id = DragDropStore.id;
			// Do not allow to drop on itself
			if( DragDropStore.source===this.el ) {
				return;
			}

			this.dragActive -= 1;
			if( this.dragActive>0 ) {
				return;
			}

			// clean up
			this.dragActive = 0;
			if( this.dragPrevented ) {
				this.dragPrevented = false;
				return;
			}

			this.$el
				.removeClass("drag-over")
				.trigger("dd-dragleave."+id, [DragDropStore.data, DragDropStore.transfer]);
		},

		onDrop: function ( event ) {
			var id = DragDropStore.id;
			// Stops some browsers from redirecting.
			event.stopPropagation();

			this.dragActive = 0;

			if( this.dragPrevented ) {
				this.dragPrevented = false;
				return false;
			}

			// Do not allow to drop on itself
			if( DragDropStore.source===this.el ) {
				return false;
			}

			this.$el
				.removeClass("drag-over")
				.trigger("dd-drop."+id, [DragDropStore.data, DragDropStore.source, DragDropStore.transfer]);

			return false;
		}
	};


	$.fn.droppable = function(option) {
		return $(this).each(function () {
			var $this 	= $(this);
			var data 	= $this.data('droppable');
			var options = $.extend({}, $.fn.droppable.defaults, $this.data(), typeof option == 'object' && option)
			if ( !data ) {
				data = new Droppable(this, options)
				$this.data('droppable', data);
			}
			if (typeof option == 'string') data[option]();
		});
	};

	$.fn.droppable.defaults = {
		accepts: false
	};

})(jQuery);