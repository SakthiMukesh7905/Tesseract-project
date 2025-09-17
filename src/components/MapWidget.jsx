import { Card } from "@mui/material";
import { GoogleMap, MarkerClusterer, useLoadScript } from "@react-google-maps/api";
import { issues } from "../api/mockData";

const containerStyle = { width: "600px", height: "400px" };


export default function MapWidget() {
  const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.REACT_APP_MAP_KEY });
  return (
    <Card sx={{ p:1, minHeight: "400px" }}>
      {isLoaded && (
        <GoogleMap mapContainerStyle={containerStyle} zoom={12} center={{ lat:12.9716, lng:77.5946 }}>
          <MarkerClusterer>
            {clusterer => issues.map(i=>(
              <div key={i.id} lat={i.lat} lng={i.lng} clusterer={clusterer}/>
            ))}
          </MarkerClusterer>
        </GoogleMap>
      )}
    </Card>
  );
}
