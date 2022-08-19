import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import StaticMap from 'react-map-gl';

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiaWxpYS10dXJub3V0IiwiYSI6ImNsNzBja29qYjBkMW0zdnFwb2d0aWR4dmgifQ.SqJqgMKQH_BOQckDVI6JyQ"
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
