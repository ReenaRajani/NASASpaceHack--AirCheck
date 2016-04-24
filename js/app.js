$(document).on('ready', function(){
  var center = ol.proj.transform([151.1995516,  -33.8842925], 'EPSG:4326', 'EPSG:3857');

  var layer = new ol.layer.Tile({
    style: 'Road',
    source: new ol.source.MapQuest({layer: 'osm'}) //osm
  });

  var view = new ol.View({
    center: center,
    zoom: 7
  });

  var map = new ol.Map({
          target: 'map',
          layers: [layer],
          view: view
        });

  var setMyLocation = function(){
    console.log('inside setMyLocation');
    if(!navigator.geolocation){
       console.log('no geolocation');
       return;
    }

    function success(position){
      console.log(" position on success", position);
      window.longitude = position.coords.longitude;
      window.latitude = position.coords.latitude;
      console.log("long and lat", window.longitude, window.latitude);
      view.center = ol.proj.transform([window.longitude, window.latitude], 'EPSG:4326', 'EPSG:3857');
    }
    function error(){
      console.log("Could not find your current coordinates");
      view.center = ol.proj.transform([window.longitude, window.latitude], 'EPSG:4326', 'EPSG:3857');
    }

    navigator.geolocation.getCurrentPosition(success, error);
  }
    
  
  setMyLocation();
  
  var overlay = new ol.Overlay({
          element: document.getElementById('overlay'),
          positioning: 'bottom-center'
        });
    console.log(center);

    var marker = new ol.Overlay({
        element: document.getElementById('location'),
        positioning: 'center-center'
      });

   marker.setPosition(ol.proj.fromLonLat([151.2070, -33.8675]));

   map.addOverlay(marker);


  map.on('click', function(event) {
          // extract the spatial coordinate of the click event in map projection units
          var coord = event.coordinate;
          // transform it to decimal degrees
          var degrees = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
          // format a human readable version
          var hdms = ol.coordinate.toStringHDMS(degrees);
          // update the overlay element's content
          var element = overlay.getElement();
          element.innerHTML = hdms;
          // position the element (using the coordinate in the map's projection)
          overlay.setPosition(coord);
          // and add it to the map
          map.addOverlay(overlay);
        });



  $('.submit-button').on('click', function(){
    console.log('button  clicked ')
    var symptom = document.querySelector('input[name="symptom"]:checked').value;
    var severity = document.querySelector('input[name="rating"]:checked').value;
    var geolocation = geoFindMe(symptom, severity);

    });

  map.on('moveend', function(event){
    console.log('event type' + event.type );
    var lonlat = ol.proj.transform(event.map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
    console.log('Recentering position ' + lonlat);
  });

});

var geoFindMe = function( symptom ,severity){

  if (!navigator.geolocation){
    console.log('no geolocation');
    return;
  }
  function success(position) {
    var res ={
      event: symptom,
      rating: severity,
      longitude: position.coords.longitude,
      latitude: position.coords.latitude
    }

    $.post("https://nasapi.herokuapp.com/events", res);
    console.log("position", position);
  };

  function error() {
    console.log("Unable to retrieve your location");
  };
  console.log('locating');
  navigator.geolocation.getCurrentPosition(success, error);

};

