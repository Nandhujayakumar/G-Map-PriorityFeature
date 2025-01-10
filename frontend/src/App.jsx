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
  const [routePopularity, setRoutePopularity] = useState([]);

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
    }

//     const MAX_BBOX_SIZE = 0.25; // Maximum allowed bbox size

// // Helper function to split bbox into smaller tiles
// const splitBoundingBox = (minLng, minLat, maxLng, maxLat) => {
//   const bboxes = [];
//   for (let lng = minLng; lng < maxLng; lng += MAX_BBOX_SIZE) {
//     for (let lat = minLat; lat < maxLat; lat += MAX_BBOX_SIZE) {
//       bboxes.push({
//         minLng: lng,
//         minLat: lat,
//         maxLng: Math.min(lng + MAX_BBOX_SIZE, maxLng),
//         maxLat: Math.min(lat + MAX_BBOX_SIZE, maxLat),
//       });
//     }
//   }
//   return bboxes;
// };

//     //fetch gps trace
//     const fetchRoutepopularity = async (routeCoordinate) => {
//       const boundingBox = {
//         min_lat: Math.min(...routeCoordinate.map((coord) => coord.lat)),
//         max_lat: Math.max(...routeCoordinate.map((coord) => coord.lat)),
//         min_lng: Math.min(...routeCoordinate.map((coord) => coord.lng)),
//         max_lng: Math.max(...routeCoordinate.map((coord) => coord.lng)),
//       };
    
//       // Split the bbox into smaller tiles
//       const bboxes = splitBoundingBox(
//         boundingBox.min_lng,
//         boundingBox.min_lat,
//         boundingBox.max_lng,
//         boundingBox.max_lat
//       );

//       try{

//       let totalMatchedPoints  = 0;
//       for(const bbox of bboxes){
//       console.log("Fetching GPS data for BBox:", bbox);
//       const gpsTraceUrl = `https://api.openstreetmap.org/api/0.6/trackpoints?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`;;

      
//         const response = await fetch(gpsTraceUrl);
//         const xmlText = await response.text();
//         console.log("API Response:", xmlText);

//         const parser = new DOMParser();
//         const xmlDoc = parser.parseFromString(xmlText, "application/xml");
//         console.log("Parsed XML:", xmlDoc);

//         const namespace = "http://www.topografix.com/GPX/1/0";
//         const gpsPoints = Array.from(xmlDoc.getElementsByTagNameNS(namespace,"trkpt"));
//         console.log("Parsed GPS Points:", gpsPoints);

//         const matchedpoints = gpsPoints.filter((point) => {
//           const lat = parseFloat(point.getAttribute("lat"));
//           const lon = parseFloat(point.getAttribute("lon"));

//           return routeCoordinate.some(
//             (coord) => {
//               const distance = Math.sqrt(
//                 Math.pow(coord.lat - lat, 2) + Math.pow(coord.lng - lon, 2)
//               );
//               return distance < 0.01;
//             }
//           )
//         })
//         totalMatchedPoints =+ matchedpoints.length; //popularity count
//         console.log("Matchpoints : " + totalMatchedPoints);
//       }
      
//       return totalMatchedPoints;
//       }
//       catch (err) {
//         console.error("Error fetching GPS trace", err);
//         return 0;    
//       }
//     };



    const handleRouteDirection = useCallback(() => {
      if (!location || !searchLocation) return;
  
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${location[1]},${location[0]};${searchLocation[1]},${searchLocation[0]}?overview=full&geometries=geojson&alternatives=true`;
  
      fetch(routeUrl)
        .then((res) => res.json())
        .then(async (data) => {
          if (data.routes?.length > 0) {
            const coordinates = data.routes.map((route) => 
                 route.geometry.coordinates.map(([lng, lat]) => ({
                  lat,
                  lng,
                }))
              );
  
            setrouteCoordinate(coordinates); // Save enriched route data

            // const popularityPromises = coordinates.map((route) =>
            //   fetchRoutepopularity(route)
            // );

            // const popularity = await Promise.all(popularityPromises);
            // setRoutePopularity(popularity);
            // console.log("Updated Popularity:", popularity);


          }
          console.log("route length fetched " + data.routes?.length);
           
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
              {/* <Tooltip>
              <div>
                <b>Route Details</b>
                <br />
                <b>Distance:</b> {(route.distance / 1000).toFixed(2)} km
                <br />
                <b>Duration:</b> {(route.duration / 60).toFixed(1)} mins
                <br />
                <b>Popularity:</b> {routePopularity[index] || 0} users
              </div>
            </Tooltip> */}

            </Polyline>
        ))}

      </MapContainer>

      {/* {searchLocation && (
        <button className='btn-directions' onClick={handleRouteDirection}>➡️</button>
      )} */}
      
    </div>
  )
}

export default App;
