$.extend(Resource.prototype, {
  in_city: function(city, more) {
    return this.find("=city_id " + city) || [];
  },

  here: function(n) {
    var result;
    if (This.city) {
      result = this.find("=city_id " + This.city_id) || [];
    } else {
      result = this.everything() || [];
    }
    if (This.q) {
      var query = This.q.toLowerCase();
      result = result.grep(function(x){
        var strings = (x.upfor + " " + x.has + " " + x.title).toLowerCase();
        return strings.match(query);
      });
    }
    if (n) result = result.slice(0, n);
    return result;
  },

  nearby: function(lat, lng, distance_in_meters) {
    var x = new GLatLng(lat, lng);
    return this.here().grep(function(thing){
      var y = new GLatLng(thing.lat, thing.lng);
      var distance = x.distanceFrom(y);
      return distance < distance_in_meters;
    });
  }

});
