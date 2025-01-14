import { useEffect, useState , useCallback} from 'react'
import {MapContainer, Marker, Popup, useMap, Polyline, Tooltip} from 'react-leaflet';
import { TileLayer } from 'react-leaflet/TileLayer'
import "leaflet-routing-machine";
import React from 'react';
import * as L from "leaflet";
import './App.css';
import "leaflet/dist/leaflet.css"; // Import leaflet CSS
import SearchBar from './component/Searchbar';


function MapUpdater({ location }) {
  const map = useMap(); // Access the map instance
  useEffect(() => {
    map.setView(location, map.getZoom()); // Move the map to the new location, keeping the same zoom level
  }, [location, map]);
  return null;
}

const MaplocationUpdater = ({location})=>{

  const map = useMap();

      useEffect(() => {
        map.flyTo(location, 13, { duration: 0.5 });
      }, [location, map]);

  return null;
};

function App() {

  const [location, setlocation] = useState([28.704060, 77.102493 ])
  const [searchLocation, setSearchLocation] = useState(null);
  const [routeCoordinate , setrouteCoordinate] = useState([]);
  const [popularity, setPopularity] = useState([]);

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

    const handleSelectionLocation = (newlocation) => {
      setSearchLocation(newlocation);
    }

    const handleClearSearchlocation = () =>{
      setSearchLocation(null);
      setrouteCoordinate([])
      setPopularity([])
    }


    const handleRouteDirection = useCallback(() => {
      if (!location || !searchLocation) return;
  
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${location[1]},${location[0]};${searchLocation[1]},${searchLocation[0]}?overview=full&geometries=geojson&alternatives=true`;
  
      fetch(routeUrl)
        .then((res) => res.json())
        .then((data) => {

          console.log("API response:", data);
          if (data.routes?.length > 0) {
            const routes = data.routes.map((route) => 
                 route.geometry.coordinates.map(([lng, lat]) => ({
                  lat,
                  lng,
                }))
              );

              setrouteCoordinate(routes);
  
              fetch("http://localhost:8080/api/routes/popularity", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(
                  routes.map((route) =>
                  route.map((point) => [point.lng, point.lat]))
                ),
              })
                .then((res) => res.json())                 
               .then((popularity) => {
                console.log("Popuilarity api response : ", popularity)

                  setPopularity(popularity);
                  // setrouteCoordinate(routes);
                  
                })
                .catch((err) =>
                  console.error("Error fetching popularity data:", err)
                );
                
            }
          })
          .catch((err) => console.error("Error fetching route data:", err));
      }, [location, searchLocation]);

  
  return (
    <div>
      <SearchBar onSelectLocation={handleSelectionLocation} onClearSearchLocation={handleClearSearchlocation}
        onDirectionClick={handleRouteDirection}
      />
      <MapContainer center={location} zoom={13} style={{ height: "100vh", width: "100vw" }}>

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={location}>
          <Popup>
            You are here !!
          </Popup>
      </Marker>


      {searchLocation && (
        <Marker position={searchLocation} />
      )}

      <MapUpdater location={location} />
      <GoToCurrentLocationButton location={location} />

      {routeCoordinate.map((route, index) => (
          <Polyline key={index} positions={route.map(({ lat, lng }) => [lat, lng])} 
            pathOptions={
              {
                color: index === 0 ? "green" : "blue",
                weight: index === 0 ? 6 : 4,
                opacity: index === 0 ? 0.9 : 0.6,
              }
            }
            >
              <Tooltip>
              <div>
                <b>Route Details</b>
                <br />
                <b>Popularity:</b> {popularity[index] || 0} users
              </div>
            </Tooltip>

            </Polyline>
        ))}

      </MapContainer>
    </div>
  )
}

export default App;
