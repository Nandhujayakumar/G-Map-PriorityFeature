package com.gmap.backend.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


@Service
public class RouteService {

   private final RestTemplate restTemplate = new RestTemplate();

    public List<Map<String, Object>> calculateRoutePopularity(List<List<Map<String, Double>>> routes) {
        List<Map<String, Object>> popularityData = new ArrayList<>();

        for (List<Map<String, Double>> route : routes) {
            // Calculate bounding box for route
            double minLat = Double.MAX_VALUE, maxLat = Double.MIN_VALUE;
            double minLng = Double.MAX_VALUE, maxLng = Double.MIN_VALUE;

            for (Map<String, Double> point : route) {
                double lat = point.get("lat");
                double lng = point.get("lng");
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
            }

            // Bounding box max size enforcement for OSM API
            if ((maxLng - minLng) > 0.25 || (maxLat - minLat) > 0.25) {
                System.out.println("(maxLng - minLng) > 0.25 || (maxLat - minLat) > 0.25)");
                popularityData.add(Map.of(
                        "route", route,
                        "popularity", 0
                ));
                continue;
            }

            // Fetch GPS data trace for bounding box
            String gpsTraceUrl = String.format(
                "https://api.openstreetmap.org/api/0.6/trackpoints?bbox=%f,%f,%f,%f",
                minLng, minLat, maxLng, maxLat
            );

            try {
                String response = restTemplate.getForObject(gpsTraceUrl, String.class);

                // Count the number of trackpoints as popularity
                int popularity = response != null ? response.split("<trkpt ").length - 1 : 0;
                System.out.println("popularity : " + popularity);

                popularityData.add(Map.of(
                        "route", route,
                        "popularity", popularity
                ));
            } catch (Exception e) {
                System.out.println("inside catch");
                popularityData.add(Map.of(
                        "route", route,
                        "popularity", 0
                ));
            }
        }

        System.out.println(popularityData);
        return popularityData;
    }


    
}
