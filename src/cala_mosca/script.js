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
	center: [39,0],
	zoom: 8,
	//maxZoom:19,
	scrollWheelZoom: false,
	layers: [esriLayer,topograficoICV]
});
