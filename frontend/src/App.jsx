import { useEffect, useState } from 'react'
import {MapContainer, Marker, Popup, useMap} from 'react-leaflet';
import { TileLayer } from 'react-leaflet/TileLayer'
import React from 'react';
import './App.css';
import 'leaflet/dist/leaflet.css'


function MapUpdater({ location }) {
  const map = useMap(); // Access the map instance
  useEffect(() => {
    map.setView(location, map.getZoom()); // Move the map to the new location, keeping the same zoom level
  }, [location, map]);
  return null;
}

function App() {

  const [location, setlocation] = useState([28.704060, 77.102493 ])

  console.log("location :" + location);


  useEffect(() =>{   
      const fetchLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (currentlocation) => {
  
            const lat = currentlocation.coords.latitude;
            const long = currentlocation.coords.longitude;
            const newlocation = [lat, long];

            if (!location || location[0] !== newlocation[0] || location[1] !== newlocation[1] ) {
              
              console.log(lat, long);
              setlocation([lat,long]);
            }
          },
          (error) => {
            console.error("Error fetching location:", error);
          }
        );
      }

      fetchLocation();
      const interval = setInterval(fetchLocation,5000);

      return () => clearInterval(interval);
    }, [location]);


    function GoToCurrentLocationButton({ location }) {
      const map = useMap();
    
      const handleGoToLocation = () => {
        map.flyTo(location, map.getZoom()); // Smoothly moves to the current location
      };
    
      return (
        <button className="location-button" onClick={handleGoToLocation}>
          📍
        </button>
      );
    }
  
  return (
    <div>
      <>
      <MapContainer center={location} zoom={13} style={{ height: "100vh", width: "100vw" }}>
      {/* <MapUpdater location={location} /> */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={location}>
          <Popup>
            You are here !!
          </Popup>
      </Marker>
      <GoToCurrentLocationButton location={location} />
      </MapContainer>
      </>
    </div>
  )
}

export default App;
