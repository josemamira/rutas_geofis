var imageContainerMargin = 70;  // Margin + padding

// This watches for the scrollable container
var scrollPosition = 0;
$('div#contents').scroll(function() {
  scrollPosition = $(this).scrollTop();
});

function initMap() {
	
	

/*
// LAYERS NO USADAS Y COMENTADAS
// OpenCycleMap
let cycleattrib = '<b>OpenCycleMap.org</b>';
let cycle = L.tileLayer('https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=15d0d1c29d9f47389a6f8e2e5635f062', {
	maxNativeZoom: 19,
	maxZoom: 19,
    attribution: cycleattrib
});

// IDEV WMS para leaflet. Funciona pero es muy lento. Mejor usar el idevWMS
var url = "http://terramapas.icv.gva.es/cgi-bin/mapserv6.fcgi?map=/srv_apl/mapserv/servicios/01_cartografia/01_series/map/topografico_continuo.map";
var idevWMS = L.tileLayer.wms( url ,{
	layers: "MAPA_BASE_CONTINUO",
	//style: "normal",
	//tilematrixSet: "ETRS89CV",
	format: "image/png",
	attribution: "<a href='https://idev.gva.es/es'>IDEV</a>&copy;ICV"
	}
);

// OSM
let osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxNativeZoom: 19,
	maxZoom: 19,
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap<\/a> contributors'
});
*/

// Base map layer
let topograficoICV = L.tileLayer( "https://terramapas.icv.gva.es/mapabase_topografico/wmts/1.0.0/topografico_continuo_epsg3857/default/GMEPSG3857/{z}/{y}/{x}.png" ,{
	maxNativeZoom: 19,
	maxZoom: 19,
	attribution: "<a href='https://idev.gva.es/es'>IDEV</a>&copy;ICV"
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
	center: [38.5645,-0.0503],
	zoom: 16,
	//maxZoom:19,
	scrollWheelZoom: false,
	layers: [esriLayer,topograficoICV]
});



var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// Cargar GeoJSON desde un archivo externo
var ruta = L.geoJson(null, { style: myStyle
    //onEachFeature: popup
    });

$.getJSON("ruta.geojson", function (data) {
    ruta.addData(data);
});

ruta.addTo(map);


  
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
    $('#contents').append("<div class='space-at-the-bottom'><a href='#space-at-the-top'><i class='fa fa-chevron-up'></i></br><small>Top</small></a></div>");
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
