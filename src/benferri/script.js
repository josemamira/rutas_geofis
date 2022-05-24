var imageContainerMargin = 70;  // Margin + padding

// This watches for the scrollable container
var scrollPosition = 0;
$('div#contents').scroll(function() {
  scrollPosition = $(this).scrollTop();
});

function initMap() {
	
	

// Base map layer
let topograficoICV = L.tileLayer( "https://terramapas.icv.gva.es/mapabase_topografico/wmts/1.0.0/topografico_continuo_epsg3857/default/GMEPSG3857/{z}/{y}/{x}.png" ,{
	maxNativeZoom: 19,
	maxZoom: 19,
	attribution: "| <a href='https://idev.gva.es/es'>IDEV&copy;ICV</a> | Develop by <a href='https://github.com/josemamira' target='_blank'>José Manuel Mira</a>"
	}
);

let esriUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
esriLayer = L.tileLayer(esriUrl, {  
	maxNativeZoom: 19,
	maxZoom: 19,
	id: 'mapbox.streets',   
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community' 
});

// control de capas
var baseMaps = {	
	"Ortofoto": esriLayer,
	"topográfico": topograficoICV
};

var map = L.map('map', {
	center: [38.1403,-0.9660],
	zoom: 38.1403/-0.9660,
	//maxZoom:19,
	scrollWheelZoom: false,
	layers: [esriLayer,topograficoICV]
});

	
	
	
	
/*
  // This creates the Leaflet map with a generic start point, because code at bottom automatically fits bounds to all markers
  var map = L.map('map', {
    center: [0, 0],
    zoom: 5,
    scrollWheelZoom: false
  });

  // This displays a base layer map (other options available)
  var lightAll = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo(map);

  // This customizes link to view source code; add your own GitHub repository
  map.attributionControl
  .setPrefix('View <a href="http://github.com/jackdougherty/leaflet-storymap" target="_blank">code on GitHub</a>, created with <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>');
*/


var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// Cargar GeoJSON desde un archivo externo
var ruta = L.geoJson(null, { style: myStyle
    //onEachFeature: popup
    });

$.getJSON("ruta_benferri.geojson", function (data) {
    ruta.addData(data);
});

ruta.addTo(map);

map.fitBounds([
    [38.14853,-0.98593], 
    [38.13553,-0.95503] 
]);	

  
  // This loads the GeoJSON map data file from a local folder
  $.getJSON('map.geojson', function(data) {
    var geojson = L.geoJson(data, {
      onEachFeature: function (feature, layer) {
        (function(layer, properties) {
          // This creates numerical icons to match the ID numbers
          // OR remove the next 6 lines for default blue Leaflet markers
          var numericMarker = L.ExtraMarkers.icon({
            icon: 'fa-number',
            number: feature.properties['id'],
            markerColor: 'blue'
          });
          layer.setIcon(numericMarker);

          // This creates the contents of each chapter from the GeoJSON data. Unwanted items can be removed, and new ones can be added
          var containerSource = $("#container-template").html();
          var containerTemplate = Handlebars.compile(containerSource);

          var output = {
            "containerId": 'container' + feature.properties['id'],
            "chapter": feature.properties['chapter'],
            "imgSrc": feature.properties['image'],
            "srcHref": feature.properties['source-link'],
            "srcText": feature.properties['source-credit'],
            "description": feature.properties['description']
          }
          var html = containerTemplate(output);
          $('#contents').append(html);

          var i;
          var areaTop = -100;
          var areaBottom = 0;

          // Calculating total height of blocks above active
          for (i = 1; i < feature.properties['id']; i++) {
            areaTop += $('div#container' + i).height() + imageContainerMargin;
          }

          areaBottom = areaTop + $('div#container' + feature.properties['id']).height();

          $('div#contents').scroll(function() {
            if ($(this).scrollTop() >= areaTop && $(this).scrollTop() < areaBottom) {
              $('.image-container').removeClass("inFocus").addClass("outFocus");
              $('div#container' + feature.properties['id']).addClass("inFocus").removeClass("outFocus");

              map.flyTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0] ], feature.properties['zoom']);
            }
          });

          // Make markers clickable
          layer.on('click', function() {
            $("div#contents").animate({scrollTop: areaTop + "px"});
          });

        })(layer, feature.properties);
      }
    });

    $('div#container1').addClass("inFocus");
    $('#contents').append("<div class='space-at-the-bottom'><a href='#space-at-the-top'><i class='fa fa-chevron-up'></i></br><small>Subir</small></a></div>");
    map.fitBounds(ruta.getBounds());
    geojson.addTo(map);
    
    var overlayMaps = {
		"Paradas": ruta,
		"Ruta": geojson,
	}; 
	
	L.control.layers(baseMaps, overlayMaps).addTo(map);
    
    
    
  });
}

initMap();
