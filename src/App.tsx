import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import DeckGL from "@deck.gl/react/typed";
import {
  GeoJsonLayer,
  LineLayer,
  PathLayer,
  PolygonLayer,
  ScatterplotLayer,
} from "@deck.gl/layers/typed";
import StaticMap, { Layer, Map } from "react-map-gl";
import { AmbientLight, LightingEffect, PointLight } from "@deck.gl/core/typed";
import { TripsLayer } from "@deck.gl/geo-layers/typed";
import "mapbox-gl/src/css/mapbox-gl.css";
import busRoutes from "../geojson/BusRoutes.json";

// Source data CSV
const DATA_URL = {
  BUILDINGS:
    "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json", // eslint-disable-line
  TRIPS: "http://localhost:5173/trips.json", // eslint-disable-line
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70] as [number, number, number],
};

const DEFAULT_THEME = {
  buildingColor: Uint8Array.from([74, 80, 87]),
  trailColor0: Uint8Array.from([253, 128, 93]),
  trailColor1: Uint8Array.from([23, 184, 190]),
  material,
  effects: [lightingEffect],
};

const INITIAL_VIEW_STATE = {
  longitude: 174.907429167043006,
  latitude: -37.201706387778003,
  zoom: 13,
  pitch: 45,
  bearing: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

const landCover = [
  [
    [-36.84, 174.76],
    [-36.74, 174.76],
    [-36.74, 174.86],
    [-36.84, 174.86],
  ],
];
const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiaWxpYS10dXJub3V0IiwiYSI6ImNsNzBja29qYjBkMW0zdnFwb2d0aWR4dmgifQ.SqJqgMKQH_BOQckDVI6JyQ";
function App({
  buildings = DATA_URL.BUILDINGS,
  trips = DATA_URL.TRIPS,
  trailLength = 180,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 1800, // unit corresponds to the timestamp in source data
  animationSpeed = 1,
}) {
  const [time, setTime] = useState(0);
  const [animation] = useState<{ id: number | undefined }>({ id: undefined });

  const animate = () => {
    setTime((t) => (t + animationSpeed) % loopLength);
    animation.id = window.requestAnimationFrame(animate);
  };

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => {
      if (animation.id !== undefined) window.cancelAnimationFrame(animation.id);
    };
  }, [animation]);

  const dataTransformation = (busRoutes as any).features.reduce(
    (acc: any, route: any) => {
      if (acc[route.properties.ROUTENUMBER])
        return {
          ...acc,
          [route.properties.ROUTENUMBER]: {
            ...acc[route.properties.ROUTENUMBER],
            geometry: {
              ...acc[route.properties.ROUTENUMBER].geometry,
              coordinates: [
                ...acc[route.properties.ROUTENUMBER].geometry.coordinates,
                ...route.geometry.coordinates,
              ],
            },
          },
        };
      return { ...acc, [route.properties.ROUTENUMBER]: route };
    },
    {},
  );

  const layers = [
    new GeoJsonLayer({
      id: "busroutes",
      data: busRoutes as any,
      getPolygon: (d) => d.geometry.coordinates,
      getLineWidth: 5,
      getLineColor: [255, 140, 0],
      getFillColor: (d) => [255, 140, 0],
    }),
    // new TripsLayer({
    //   id: "trips",
    //   data: trips,
    //   getPath: (d) => d.path,
    //   getTimestamps: (d) => d.timestamps,
    //   getColor: (d) => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
    //   opacity: 0.3,
    //   widthMinPixels: 2,
    //   rounded: true,
    //   trailLength,
    //   currentTime: time,

    //   shadowEnabled: false,
    // }),
  ];

  const mapboxBuildingLayer = {
    id: "3d-buildings",
    source: "carto",
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 0,
    paint: {
      "fill-extrusion-color": "rgb(74, 80, 87)",
      "fill-extrusion-opacity": 0.6,
      "fill-extrusion-height": ["get", "render_height"],
    },
  };
  return (
    <DeckGL
      layers={layers}
      effects={theme.effects}
      initialViewState={initialViewState}
      controller={true}
    >
      <StaticMap
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        reuseMaps
        mapStyle={mapStyle}
        // preventStyleDiffing={true}
        onLoad={(e) => {
          e.target.addLayer(mapboxBuildingLayer);
        }}
      />
    </DeckGL>
  );
}

export default App;
