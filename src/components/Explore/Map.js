import React, { Component } from "react";
import _ from "lodash";
import mapboxgl from "mapbox-gl";
import Color from 'color';
import './map.css';

mapboxgl.accessToken =
  "pk.eyJ1IjoiaG9mZnQiLCJhIjoiY2llaGNtaGRiMDAxeHNxbThnNDV6MG95OSJ9.p6Dj5S7iN-Mmxic6Z03BEA";

class Map extends Component {
  constructor(props) {
    super(props);

    this.addLayer = this.addLayer.bind(this);
    this.updateLayer = this.updateLayer.bind(this);
    this.myRef = React.createRef();
    this.state = {};
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.myRef.current,
      style: "mapbox://styles/mapbox/light-v9",
      zoom: 0,
      center: [0, 0]
    });
    this.map.addControl(new mapboxgl.NavigationControl({showCompass: false}), 'top-left');
		this.map.on("load", this.addLayers);
  }

  componentWillUnmount() {
    this.map.remove();
  }

  componentDidUpdate(prevProps) {
    // if (prevProps.filter.hash !== this.props.filter.hash) {
    //   // this.updateLayer();
		// }
		if (prevProps.shouldRefresh !== this.props.shouldRefresh) {
			this.map.resize();
		}
  }

  updateLayer() {
		return; 
    var layer = this.map.getSource("occurrences");
    if (layer) {
      this.map.removeLayer("occurrences");
      this.map.removeSource("occurrences");
      this.addLayer();
    } else {
      this.addLayer();
    }
	}
	
	addLayers = () => {
		let addLayer = this.addLayer;
		// ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd']
		let catCol = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];
		// this.props.taxonKeys.forEach(l => {
		[
			{key: 2979711, color: '#a6cee3'}, 
			{key: 2979474, color: '#1f78b4'},
			{key: 2979000, color: '#b2df8a'},
			{key: 2978730, color: '#33a02c'},
			{key: 2979799, color: '#fb9a99'},
		].forEach(l => {
			addLayer(l.key, l.color)
		})
	}

  addLayer(taxonKey, color) {
		// taxonKey = 2979474;
    var tileString = "https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:3857&taxonKey=" + taxonKey;
    // var tileString = "https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:3857&bin=hex&hexPerTile=50&taxonKey=2435098";
    this.map.addLayer(
      {
        id: "occurrences_" + taxonKey,
        type: "circle",
        source: {
          type: "vector",
          tiles: [tileString]
        },
        "source-layer": "occurrence",
        paint: {
          // make circles larger as the user zooms from z12 to z22
          "circle-radius": {
            property: "total",
            type: "interval",
            stops: [[0, 2], [10, 3], [100, 5], [1000, 8], [10000, 15]]
          },
          // color circles by ethnicity, using data-driven styles
          "circle-color": color,
          // "circle-opacity": {
          //   property: "total",
          //   type: "interval",
          //   stops: [[0, 1], [10, 0.8], [100, 0.7], [1000, 0.6], [10000, 0.6]]
          // },
          "circle-stroke-color": Color(color).darken(0.3).hex(),
          "circle-stroke-width": 1
        }
      },
      "poi-scalerank2"
    );

    // let map = this.map;
    // this.map.on('click', 'occurrences', function(e) {
    //   // Change the cursor style as a UI indicator.
    //   map.getCanvas().style.cursor = 'pointer';

    //   // Populate the popup and set its coordinates
    //   // based on the feature found.
    //   console.log(e.features[0].properties.species);
    //   if (e.features[0].properties.species) {
    //       new mapboxgl.Popup({closeButton: false})
    //           .setLngLat(e.lngLat)
    //           .setHTML(e.features[0].properties.species + <span>tester</span>)
    //           .addTo(map);
    //   }
    // });
  }

  render() {
    return (
      <div className="mapArea">
        <div ref={this.myRef} className="map" />
      </div>
    );
  }
}

export default Map;
