// Groundcrew-specific extensions to String
$.extend(String.prototype, {
  gcify_url: function(){
    if (this.charAt(0) == '/') {
      if (window && window.location.href.indexOf("localhost:9292") >= 0) {
        return "http://localhost:9292" + this;
      } else {
        return "http://groundcrew.us" + this;
      }
    }
    else return this;
  },

  to_obj: function() {
    return eval('(' + this + ')');
  },
  
  resource: function(){
    return this.resource_class().by_tag[this];
  },
  
  resource_type: function(){
    if (this.startsWith('e')) return 'Event';
    if (this.match(/^p\w+_\w+_\w+/)) return 'Op'; // old-style op ids
    if (this.startsWith('v')) return 'Op';
    if (this.startsWith('p')) return 'Agent';
    if (this.startsWith('l')) return 'Landmark';
    // city has no resource class, but may be assigned to This.item
    if (this.startsWith('City__')) return null;
    throw 'unknown resource type for ' + this;
  },

  resource_class: function(){
    return eval(this.resource_type() + "s");
  }

});
