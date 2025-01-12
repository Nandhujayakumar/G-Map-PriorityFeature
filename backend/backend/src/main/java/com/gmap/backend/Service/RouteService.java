package com.gmap.backend.Service;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;


@Service
public class RouteService {

    private static final String OSM_API_URL = "https://api.openstreetmap.org/api/0.6/trackpoints?bbox=";
    private static final double MATCHING_DISTANCE_THRESHOLD = 0.01;

    public List<Integer> calculatePopularityForRoutes(List<List<List<Double>>> routes) {
        List<Integer> popularities = new ArrayList<>();

        for (List<List<Double>> route : routes) {
            try {
                double minLng = route.stream().mapToDouble(coord -> coord.get(0)).min().orElse(0);
                double minLat = route.stream().mapToDouble(coord -> coord.get(1)).min().orElse(0);
                double maxLng = route.stream().mapToDouble(coord -> coord.get(0)).max().orElse(0);
                double maxLat = route.stream().mapToDouble(coord -> coord.get(1)).max().orElse(0);

                String bboxUrl = OSM_API_URL + minLng + "," + minLat + "," + maxLng + "," + maxLat;

                String response = fetchGpsTraceData(bboxUrl);
                int matchedPoints = countMatchedPoints(response, route);
                popularities.add(matchedPoints);

            } catch (Exception e) {
                e.printStackTrace();
                popularities.add(0);
            }
        }

        return popularities;
    }

    private String fetchGpsTraceData(String url) throws IOException {
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }

    private int countMatchedPoints(String xmlData, List<List<Double>> route) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new InputSource(new StringReader(xmlData)));

        NodeList trackpoints = doc.getElementsByTagName("trkpt");
        int matchedCount = 0;

        for (int i = 0; i < trackpoints.getLength(); i++) {
            Element point = (Element) trackpoints.item(i);
            double lat = Double.parseDouble(point.getAttribute("lat"));
            double lon = Double.parseDouble(point.getAttribute("lon"));

            for (List<Double> coord : route) {
                double distance = Math.sqrt(
                    Math.pow(lat - coord.get(1), 2) + Math.pow(lon - coord.get(0), 2)
                );
                if (distance < MATCHING_DISTANCE_THRESHOLD) {
                    matchedCount++;
                    break;
                }
            }
        }
        return matchedCount;
    }
    
}
