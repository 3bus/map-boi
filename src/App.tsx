import { useEffect, useMemo, useState } from "react";
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
import busStops from "../geojson/BusStops.json";
import trainRoutes from "../geojson/TrainRoutes.json";
import trainStops from "../geojson/TrainStops.json";
import adt from "../geojson/TrafficService.json";
import { scaleLinear, scaleThreshold } from "d3-scale";

import tripData from "../public/trips.json";

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
//-36.849219, 174.764254
const INITIAL_VIEW_STATE = {
  longitude: 174.764254,
  latitude: -36.849219,
  zoom: 13,
  pitch: 45,
  bearing: 0,
};

export const COLOR_SCALE = scaleThreshold()
  .domain([2400, 4000, 8800, 11200, 15000, 23200, 30000, 45400, 85000, 109400])
  .range([
    [26, 152, 80],
    [102, 189, 99],
    [166, 217, 106],
    [217, 239, 139],
    [255, 255, 191],
    [254, 224, 139],
    [253, 174, 97],
    [244, 109, 67],
    [215, 48, 39],
    [168, 0, 0],
  ]);

const goodTripColor = [40, 255, 50, 100];
const badTripColor = [255, 40, 40, 100];
const goodAnimationSpeed = 1;
const badAnimationSpeed = 0.2;
const goodTrailLength = 100;
const badTrailLength = 25;

let isGoodMode = false;

document.addEventListener("keydown", (e) => {
  console.log({ key: e.key });
  if (e.key === " ") {
    isGoodMode = !isGoodMode;
  }
});

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiaWxpYS10dXJub3V0IiwiYSI6ImNsNzBja29qYjBkMW0zdnFwb2d0aWR4dmgifQ.SqJqgMKQH_BOQckDVI6JyQ";
function App({
  trailLength = 180,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 500, // unit corresponds to the timestamp in source data
}) {
  const animationSpeed = isGoodMode ? goodAnimationSpeed : badAnimationSpeed;
  const getLineColor = (point) => {
    let adtCount = point.properties.adt;
    if (adtCount >= 5000) {
      return COLOR_SCALE(adtCount);
    } else {
      return [0, 0, 0, 0];
    }
  };

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

  const busRouteMemo = useMemo(() => {
    return (busRoutes as any).features.reduce((acc: any, feature: any) => {
      return [
        ...acc,
        ...feature.geometry.coordinates.map((coordinates: any) => {
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: [...coordinates, ...coordinates.slice().reverse()],
            },
          };
        }),
      ];
    }, []);
  }, []);

  const layers = [
    new GeoJsonLayer({
      id: "trainroutes",
      data: trainRoutes as any,
      getPolygon: (d) => d.geometry.coordinates,
      getLineWidth: 10,
      getLineColor: [34, 246, 225],
      getFillColor: (d) => [34, 246, 225],
    }),
    new GeoJsonLayer({
      id: "trainstops",
      data: trainStops as any,
      getPolygon: (d) => d.geometry.coordinates,
      getLineWidth: 50,
      getLineColor: [45, 214, 90],
      getFillColor: (d) => [45, 214, 90],
    }),
    new GeoJsonLayer({
      id: "busstops",
      data: busStops as any,
      getPolygon: (d) => d.geometry.coordinates,
      getLineWidth: 30,
      getLineColor: [199, 86, 120],
      getFillColor: (d) => [199, 86, 120],
    }),

    new TripsLayer({
      id: "trips",
      data: busRouteMemo,
      getPath: (d) => d.geometry.coordinates,
      getTimestamps: (d) =>
        d.geometry.coordinates.map(
          (a: any, idx: number, arr: []) =>
            (loopLength / arr.length) * ((idx + arr.length / 2) % arr.length),
        ),
      getColor: isGoodMode ? goodTripColor : badTripColor,
      getWidth: 10,
      fadeTrail: true,
      trailLength: isGoodMode ? goodTrailLength : badTrailLength,
      currentTime: time,
    }),
    new GeoJsonLayer({
      id: "averagedailytraffic",
      data: adt as any,
      getPolygon: (d) => d.geometry.coordinates,
      getLineWidth: 45,
      getLineColor,
    }),
  ];

  const mapboxBuildingLayer = {
    id: "3d-buildings",
    source: "carto",
    "source-layer": "building",
    type: "fill-extrusion",
    minzoom: 0,
    paint: {
      "fill-extrusion-color": "rgb(50, 50, 50)",
      "fill-extrusion-opacity": 0.8,
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
