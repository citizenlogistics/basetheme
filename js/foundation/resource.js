function Resource(table_name, options){
  // represents a table in the in-browser database
  this.tname = table_name;      // table name
  this.db = {};                 // cached indexes
  this.by_tag = {};             // everything in this table
  this.all = [];                // cache of by_tag.values() (sometimes empty)
  this.what_changed = {};       // dirty list
  this.changed_timer = null;    // timer for updating indexes, UI, other things
  this.something_added = false; // whether or not something has been added
  if (options) $.extend(this, options);
}

Resource.add_or_update = function(id, item, xtra){
  return id.resource_class().add_or_update(id, item, xtra);
};

// Don't track changes initially
Resource.handle_changes = false;

$.extend(Resource.prototype, {
  id: function(n) {
    return this.by_tag[ n ];
  },
  
  everything: function(){
    return this.all || $values(this.by_tag);
  },
  
  find: function(spec) {
    if (this.db[spec]) return this.db[spec];

    var spec_words = spec.split(' ');
    var action = spec_words.pop();
    if (action == "undefined") {
      throw 'resource find called with undefined!';
    }
    var start_db = spec_words.length
      ? this.find(spec_words.join(' ')) 
      : (this.all || (this.all = $values(this.by_tag)));

    if (action.charAt(0) == '=')
      return this.db[spec] = start_db.group_by(action.slice(1));      // find things equal to the scalar
    else if (action.charAt(0) == '#')
      return this.db[spec] = start_db.index_by(action.slice(1));      // find unique thing equal to the scalar
    else if (action.charAt(0) == ':')
      return this.db[spec] = start_db.repackage(action.slice(1));     // find things in the list
    else if (action.charAt(0) == ';')
      return this.db[spec] = start_db.semirepackage(action.slice(1)); // full-text search

    var actions = action.split('|');
    return this.db[spec] = actions.map(function(action){ return start_db[action] || []; }).flatten();
  },
  
  add_or_update: function(tag, item, xtra) {
    if (xtra) $.extend(item, xtra);
    if (this.by_tag[tag]) {
      $.extend(this.by_tag[tag], item);
    } else {
      this.something_added = true;
      item.id = tag;
      this.by_tag[tag] = item;
      if (this.all) this.all.push(item);
    }
    this.handle_change(this.by_tag[tag]);
    return this.by_tag[tag];
  },
  
  handle_change: function(item) {
    this.db = {};
    if (this.enhancer) this.enhancer(item);
    if (!Resource.handle_changes) return;
    if (this.changed) {
      if (!this.changed_timer) {
        var self = this;
        this.changed_timer = setTimeout(function(){
          self.changed(self.what_changed);
          if (self.something_added) go.trigger(self.tname.toLowerCase().pluralize() + '_added');
          go.trigger(self.tname.toLowerCase().pluralize() + '_changed');
          self.what_changed = {};
          self.something_added = false;
          self.changed_timer = null;
        }, 0);
      }
      this.what_changed[item.id] = item;
    }
  },  
  
  remove: function(tag) {
    delete this.by_tag[tag];
    this.all = null;
    this.db = {};
  }
  
});

$.extend(String.prototype, {
  resource: function(){
    var c = this.resource_class();
    if (c) return c.by_tag[this];
  },

  resource_class: function(){
    var type = this.resource_type();
    if (type) return eval(type + "s");
  }
});