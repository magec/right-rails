/**
 * Resizable unit for RightJS
 *
 * See: http://rightjs.org/ui/resizable
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
if (!RightJS) throw "Gimme RightJS";
/**
 * The resizable unit main file
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
var Resizable = new Class(Observer, {
  extend: {
    EVENTS: $('resize initialize destroy start release'),
    
    Options: {
      direction:  null, // 'top', 'left', 'right', 'bottom', null for bidrectional
      
      minWidth:   null,
      maxWidth:   null,
      minHeight:  null,
      maxHeight:  null
    },
    
    instances: [],
    
    /**
     * Tries to find or instanciate the resizable unit
     * by the mouse event
     *
     * @param Event mouse event
     * @return Resizable instance or null
     */
    findBy: function(event) {
      var target = event.target, element;
      if (target.hasClass('right-resizable-handle')) {
        element = target.parent();
        return Resizable.instances[$uid(element)] || new Resizable(element);
      }
    }
  },
  
  /**
   * Basic constructor
   *
   * @param Element reference
   * @param Object options
   */
  initialize: function(element, options) {
    this.element = $(element);
    this.$super(Object.merge(options,
      eval('('+ this.element.get('data-resizable-options') +')')
    ));
    
    Resizable.instances[$uid(this.element)] = this.init();
    this.fire('initialize');
  },
  
  /**
   * destructor
   *
   * @return Resizable this
   */
  destroy: function() {
    this.element
      .removeClass('right-resizable')
      .removeClass('right-resizable-top')
      .removeClass('right-resizable-left')
      .removeClass('right-resizable-right')
      .removeClass('right-resizable-bottom')
      .insert(this.content.childNodes);
      
    this.content.remove();
    this.handle.remove();
    
    Resizable.instances = Resizable.instances.without($uid(this.element));
    
    this.fire('destroy');
  },
  
  /**
   * Overriding the method to recognize the direction
   * option from the element class-name
   *
   * @param Object options
   * @return Resizable this
   */
  setOptions: function(options) {
    // trying to recognize the direction
    $w('top left right bottom').each(function(direction) {
      if (this.element.hasClass('right-resizable-'+direction))
        options.direction = direction;
    }, this);
    
    return this.$super(options);
  },
  
  /**
   * Starts the resizing process
   *
   * @param Event mouse event
   */
  start: function(event) {
    this.prevSizes = this.element.sizes();
    this.prevEvPos = event.position();
    
    // trying to recognize the boundaries
    $w('minWidth maxWidth minHeight maxHeight').each(function(dimension) {
      this[dimension] = this.findDim(dimension);
    }, this);
    
    return Resizable.current = this.fire('start', event);
  },
  
  /**
   * Tracks the event during the resize process
   *
   * @param Event mouse event
   */
  track: function(event) {
    var event_pos = event.position(), prev_pos = this.prevEvPos,
        handle    = this.handle.dimensions(),
        prev_size = this.prevSizes, width = prev_size.x, height = prev_size.y,
        x_diff    = prev_pos.x - event_pos.x,
        y_diff    = prev_pos.y - event_pos.y,
        min_x     = this.minWidth,
        max_x     = this.maxWidth,
        min_y     = this.minHeight,
        max_y     = this.maxHeight,
        options   = this.options,
        direction = options.direction;
  
    // calculating the new size
    width  += (direction == 'left' ? 1 : -1) * x_diff;
    height += (direction == 'top'  ? 1 : -1) * y_diff;
    
    // applying the boundaries
    if (width  < min_x) width  = min_x;
    if (width  > max_x) width  = max_x;
    if (height < min_y) height = min_y;
    if (height > max_y) height = max_y;
    
    // applying the sizes
    if (prev_size.x != width && direction != 'top' && direction != 'bottom') {
      this.setWidth(width);
    }
    if (prev_size.y != height && direction != 'left' && direction != 'right') {
      this.setHeight(height);
    }
    
    // adjusting the previous cursor position so that it didn't had a shift
    if (width == min_x || width == max_x)
      event_pos.x = handle.left + handle.width / 2;
    if (height == min_y || height == max_y)
      event_pos.y = handle.top + handle.height / 2;
    
    this.prevEvPos = event_pos;
    this.prevSizes = this.element.sizes();
    
    this.fire('resize', event);
  },
  
  /**
   * Sets the widget size
   *
   * @param Number width or Object {x:NN, y:NN}
   * @param Number height
   * @return Resizable this
   */
  setSize: function(in_width, in_height) {
    var width = in_width, height = in_height;
    if (isHash(in_width)) {
      width  = in_width.x;
      height = in_width.y;
    }
    return this.setWidth(width).setHeight(height);
  },
  
  /**
   * Sets the width of the widget
   *
   * @param Number width
   * @return Resizable this
   */
  setWidth: function(width) {
    this.element.setWidth(width);
    this.content.setWidth(width - this.contXDiff);
  },
  
  /**
   * Sets the height of the widget
   *
   * @param Number height
   * @return Resizable this
   */
  setHeight: function(height) {
    this.element.setHeight(height);
    this.content.setHeight(height - this.contYDiff);
  },
  
  /**
   * Marks it the end of the action
   *
   * @return Resizable this
   */
  release: function(event) {
    Resizable.current = null;
    return this.fire('release', event);
  },
  
  /**
   * Overloading the standard method so that it was sending
   * current instance as an argument
   *
   * @param String event name
   * @return Resizable this
   */
  fire: function(event, dom_event) {
    return this.$super(event, this, dom_event);
  },
  
// protected

  init: function() {
    var class_name         = 'right-resizable',
        handle_class_name  = 'right-resizable-handle',
        content_class_name = 'right-resizable-content';
    
    // assigning the main element class
    if (this.options.direction) class_name += '-'+ this.options.direction;
    this.element.addClass(class_name);
    
    // checking for the content block
    this.content = this.element.first('*.'+ content_class_name) || $E('div', {
      'class': content_class_name
    }).insert(this.element.childNodes).insertTo(this.element);
    
    // checking for the handle element
    this.handle = (this.element.first('*.'+ handle_class_name) || $E('div', {
      'class': handle_class_name
    })).insertTo(this.element);
    
    // used later during the resize process
    this.contXDiff = this.element.offsetWidth  - this.content.offsetWidth;
    this.contYDiff = this.element.offsetHeight - this.content.offsetHeight;
    
    return this;
  },
  
  // finds dimensions of the element
  findDim: function(dimension) {
    var style = this.options[dimension] || this.element.getStyle(dimension);
    
    if (style && /\d+/.test(style) && style.toFloat() > 0) {
      var what  = dimension.include('Width') ? 'width' : 'height',
          dummy = (this.dummy || (this.dummy = $E('div', {
            style: 'visibility:hidden;z-index:-1'
          })))
          .setStyle(what, style)
          .insertTo(this.element, 'before');
          
      var size = dummy['offset' + what.capitalize()];
      dummy.remove();
      
      return size;
    }
  }
});

/**
 * Document level hooks for resizables
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
document.on({
  mousedown: function(event) {
    var resizable = Resizable.findBy(event);
    if (resizable) {
      event.stop();
      Resizable.current = resizable.start(event);
    }
  },
  
  mousemove: function(event) {
    var resizable = Resizable.current;
    if (resizable) {
      event.stop();
      resizable.track(event);
    }
  },
  
  mouseup: function(event) {
    var resizable = Resizable.current;
    if (resizable) {
      resizable.release(event);
    }
  }
});

window.on('blur', function(event) {
  var resizable = Resizable.current;
  if (resizable) {
    resizable.release(event);
  }
});

/**
 * Element level hook to make things resizable
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
Element.include({
  /**
   * Makes a resizeable out of the element
   *
   * @param Object options
   * @return Element this
   */
  makeResizable: function(options) {
    new Resizable(this, options);
    return this;
  },
  
  /**
   * Destroys a resizable functionality
   *
   * @return Element this
   */
  undoResizable: function() {
    var resizable = Resizable.instances[$uid(this)];
    if (resizable) resizable.destroy();
    return this;
  }
});document.write("<style type=\"text/css\">.right-resizable,.right-resizable-top,.right-resizable-left,.right-resizable-right,.right-resizable-bottom,.right-resizable-content .right-resizable-handle{margin:0;padding:0;overflow:none;border:none;background:none;width:auto;height:auto;min-width:none;max-width:none;min-height:none;max-height:none}.right-resizable,.right-resizable-top,.right-resizable-left,.right-resizable-right,.right-resizable-bottom{position:relative;min-width:8em;min-height:8em;border:1px solid #DDD}.right-resizable-content{overflow:auto;padding:.5em;position:relative}.right-resizable-handle{position:absolute;background-image:url(/images/rightjs-ui/resizable.png);background-repeat: no-repeat;background-color:#DDD;cursor:move}.right-resizable .right-resizable-handle{right:0;bottom:0;background-position:-2px -2px;background-color:transparent;width:16px;height:16px}.right-resizable-top .right-resizable-handle,.right-resizable-bottom .right-resizable-handle{height:8px;width:100%;background-position:center -26px;cursor:row-resize}.right-resizable-left .right-resizable-handle,.right-resizable-right .right-resizable-handle{top:0px;width:8px;height:100%;background-position:-26px center;cursor:col-resize}.right-resizable-top .right-resizable-content{padding-top:1em}.right-resizable-top .right-resizable-handle{top:0}.right-resizable-bottom .right-resizable-content{padding-bottom:1em}.right-resizable-bottom .right-resizable-handle{bottom:0}.right-resizable-left .right-resizable-content{padding-left:1em}.right-resizable-left .right-resizable-handle{left:0}.right-resizable-right .right-resizable-content{padding-right:1em}.right-resizable-right .right-resizable-handle{right:0}</style>");