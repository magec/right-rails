/**
 * Sortable feature for RightJS (requires the Drag'n'Drop feature)
 *
 * See http://rightjs.org/ui/sortable
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
if (!Draggable) throw "Gimme Draggable";
/**
 * The Sortable unit
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
var Sortable = new Class(Observer, {
  extend: {
    EVENTS: $w('update'),
    
    Options: {
      direction:  'auto',     // 'auto', 'vertical', 'horizontal', 'x', 'y'
                  
      tags:       'li',       // the list items tag name
                  
      url:        null,       // the Xhr requests url address, might contain the '%{id}' placeholder
      method:     'put',      // the Xhr requests method
                  
      Xhr:        {},         // additional Xhr options
                  
      idParam:    'id',       // the id value name
      posParam:   'position', // the position value name
      parseId:    true,       // if the id attribute should be converted into an integer before sending
      
      cssRule:    '[rel^=sortable]' // css-rule for automatically processable sortables
    },
    
    // DEPRECATED: scans through the page for auto-discoverable sortables
    rescan: function(scope) { }
  },
  
  /**
   * basic constructor
   *
   * @param mixed element reference
   * @param Object options
   */
  initialize: function(element, options) {
    this.element = $(element);
    this.$super(Object.merge(options, eval('('+this.element.get('data-sortable-options')+')')));
    
    // trying to get the embedded Xhr url address
    var rule = this.options.cssRule.split('[').last(),
        attr = this.element.get(rule.split('^=').first()) || '',
        url  = attr.match(/\[(.+?)\]/);
        
    if (url) this.options.url = url[1];
    
    this.element._sortable = this.init().onUpdate('tryXhr');
  },
  
  // detaches all the events out of the elemnts
  destroy: function() {
    this.getItems.each(function(item) {
      item.undoDraggable().undoDroppable();
    });
    delete(this.element._sortable);
    
    return this;
  },
  
  // callback for the moved elements
  moved: function(element) {
    var items    = this.getItems();
    var position = items.indexOf(element);
    
    if (position > -1 && position != element.current_position) {
      this.fire('update', element, position);
      
      items.each(function(item, index) {
        item.current_position = index;
      });
    }
    
    // resetting the left/top positions so it didn't jump next time
    element.setStyle({left:'auto', top: 'auto'});
  },
  
  // tries to send an Xhr request about the element relocation
  tryXhr: function(element, position) {
    if (this.options.url) {
      var url = this.options.url, params = {};
      
      // building the Xhr request options
      var options = Object.merge({
        method: this.options.method,
        params: {}
      }, this.options.Xhr);
      
      // grabbing the id
      var id = element.id || '';
      if (this.options.parseId && id) {
        id = id.match(/\d+/) || '';
      }
      
      // assigning the parameters
      if (url.include('%{id}')) {
        url = url.replace('%{id}', id);
      } else {
        params[this.options.idParam] = id;
      }
      params[this.options.posParam] = position;
      
      // merging the params with possible Xhr params
      if (isString(options.params)) options.params += '&'+Object.toQueryString(params);
      else options.params = Object.merge(options.params, params);
      
      // calling the server
      Xhr.load(url, options);
    }
  },
  
// protected
  
  // inits the sortable unit
  init: function() {
    var items = this.getItems();
    
    if (items.length) {
      var callback  = this.moved.bind(this);
      
      // guessing the direction
      var direction = this.options.direction != 'auto' ? this.options.direction :
        ['left', 'right'].include(items[0].getStyle('float')) ? 'x' : 'y';
      
      // the draggable options
      var drag_options = {
        range:  this.element,
        axis:   direction,
        revert: true,
        revertDuration: 0,
        onStop: function() {
          callback(this.element);
        }
      };
      
      // the droppable options
      var drop_options = {
        overlap:      direction,
        containment:  items,
        onHover: function(draggable) {
          if (items.include(draggable.element)) {
            // calculating the swapping direction
            var drag_dims = draggable.element.dimensions();
            var this_dims = this.element.dimensions();

            var before = draggable.axisY ? (
                drag_dims.top > this_dims.top
              ) : (
                drag_dims.left > this_dims.left
              );

            this.element.insert(draggable.clone, before ? 'before' : 'after');
          }
        }
      };
      
      // processing the items
      items.each(function(item, index) {
        item.makeDraggable(drag_options).makeDroppable(drop_options).current_position = index;
      });
    }
    
    return this;
  },
  
  // returns the list of the items
  getItems: function() {
    return this.element.subNodes(this.options.tags);
  }
  
  
});

/**
 * Document level hooks for sortables
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
document.onMousedown(function(event) {
  var target = event.target, element = [target].concat(target.parents()).first('match', Sortable.Options.cssRule);
  
  if (element) {
    var sortable = element._srotable || new Sortable(element);
    
    if (target._draggable) {
      target._draggable.dragStart(event);
    }
  };
});

/**
 * Element level features for the Sortable unit
 *
 * Copyright (C) 2009-2010 Nikolay V. Nemshilov
 */
Element.include({
  /**
   * Tries to make a sortable unit out of the element
   *
   * @param Object options
   * @return Element this
   */
  makeSortable: function(options) {
    new Sortable(this, options);
    return this;
  },
  
  /**
   * Destroy the sortable functionality on the element
   *
   * @return Element this
   */
  undoSortable: function() {
    if (this._sortable) this._sortable.destroy();
    return this;
  }
});