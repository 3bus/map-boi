import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import StaticMap from 'react-map-gl';

const MAPBOX_ACCESS_TOKEN = import.meta.env.MAPBOX_ACCESS_TOKEN
function App() {
  const [count, setCount] = useState(0);

  const data: never[] = [];
  return (
    <DeckGL
      longitude={-122.45}
      latitude={37.78}
      zoom={12}
      layers={[new ScatterplotLayer({ data })]}
    >

    <StaticMap
      mapStyle="mapbox://styles/mapbox/dark-v9"
      mapboxAccessToken={MAPBOX_ACCESS_TOKEN} />

    </DeckGL>
  );
}

export default App;
