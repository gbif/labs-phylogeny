import React, { Component } from "react";
import mapboxgl from "mapbox-gl";
import Color from 'color';
import './map.css';
import { Menu, Dropdown, Button } from 'antd';
import {DownOutlined} from "@ant-design/icons"


mapboxgl.accessToken =
  "pk.eyJ1IjoiaG9mZnQiLCJhIjoiY2llaGNtaGRiMDAxeHNxbThnNDV6MG95OSJ9.p6Dj5S7iN-Mmxic6Z03BEA";

class Map extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    let menu = (
      <Menu onClick={this.selectBaseLayer}>
        <Menu.Item key="dark-v10">
          Dark        
        </Menu.Item>
        <Menu.Item key="light-v10">
          Light
        </Menu.Item>
        <Menu.Item key="outdoors-v11">
          Outdoor
        </Menu.Item>
        <Menu.Item key="satellite-v9">
          Satellite
        </Menu.Item>
      </Menu>
    );
    this.state = { selected: props.selected || {}, menu, baseLayer: 'light-v10' };
  }

  selectBaseLayer = layer => {
    var layerId = layer.key;
    if (this.state.baseLayer !== layerId) {
      this.map.setStyle('mapbox://styles/mapbox/' + layerId);
      this.updateLayers(this.props.selected, this.props.selected);
      this.setState({baseLayer: layerId});
    }
  };

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.myRef.current,
      style: "mapbox://styles/mapbox/" + this.state.baseLayer,
      zoom: 0,
      center: [0, 0]
    });
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');
    this.map.on("load", x => this.addLayers(this.props.selected));
    this.map.on("style.load", x => this.updateLayers(this.props.selected, this.props.selected));
  }

  componentWillUnmount() {
    this.map.remove();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.updateLayers(prevProps.selected, this.props.selected);
    }
    if (prevProps.shouldRefresh !== this.props.shouldRefresh) {
      this.map.resize();
    }
  }

  updateLayers = (prev, next) => {
    this.removeLayers(prev);
    this.addLayers(next);
  }

  getLayersAsArray = (selected) => {
    return Object.keys(selected).map(x => selected[x]);
  }

  removeLayers = prev => {
    prev = prev || {};
    let list = this.getLayersAsArray(prev);
    list.filter(x => x.taxonKeys && x.taxonKeys.length > 0).forEach(l => {
      let layerName = "occurrences_" + l.layerName;
      var layer = this.map.getSource(layerName);
      if (layer) {
        this.map.removeLayer(layerName);
        this.map.removeSource(layerName);
      }
    });
  }

  addLayers = selected => {
    selected = selected || {};
    let list = this.getLayersAsArray(selected);
    let addLayer = this.addLayer;
    list.filter(x => x.taxonKeys && x.taxonKeys.length > 0).forEach(x => {
      addLayer(x)
    });
  }

  addLayer = (layer) => {
    const query = layer.visibleTaxonKeys.reduce((str, key) => str += `&taxonKey=${key}`, '');
    var tileString = "https://api.gbif.org/v2/map/occurrence/adhoc/{z}/{x}/{y}.mvt?style=scaled.circles&mode=GEO_CENTROID&occurrenceStatus=present&srs=EPSG%3A3857&squareSize=512&hasGeospatialIssue=false&occurrenceStatus=present" + query;
    this.map.addLayer(
      {
        id: "occurrences_" + layer.layerName,
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
          "circle-color": layer.color,
          // "circle-opacity": {
          //   property: "total",
          //   type: "interval",
          //   stops: [[0, 1], [10, 0.8], [100, 0.7], [1000, 0.6], [10000, 0.6]]
          // },
          "circle-stroke-color": Color(layer.color).darken(0.3).hex(),
          "circle-stroke-width": 1
        }
      }
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
        {/* {this.props.totalSelected > this.props.max &&
          <div style={{ zIndex: 100, position: 'absolute', background: 'tomato', color: 'white', padding: '5px 10px', margin: 10, borderRadius: 3, fontWeight: 500 }}>
            Only showing {this.props.selected.length} of {this.props.totalSelected} layers
          </div>
        } */}
        <div style={{ zIndex: 100, position: 'absolute', right: 30, top: 30}}>
          <Dropdown overlay={this.state.menu}>
            <Button>
              Baselayer <DownOutlined />
            </Button>
          </Dropdown>
        </div>
        <div ref={this.myRef} className="map" />
      </div>
    );
  }
}

export default Map;
