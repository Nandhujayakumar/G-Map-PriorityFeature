package com.gmap.backend.Service;

import java.io.StringReader;
import java.time.Duration;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;


@Service
public class RouteService {

    private static final String OSM_API_URL = "https://api.openstreetmap.org/api/0.6/trackpoints?bbox=";
    private static final double MATCHING_DISTANCE_THRESHOLD = 0.05;
    private final WebClient webClient;

    

    public RouteService(WebClient.Builder webClientBuilder) {
        HttpClient httpClient = HttpClient.create()
        .responseTimeout(Duration.ofSeconds(30)); // Increase response timeout if needed

    this.webClient = webClientBuilder
        .baseUrl(OSM_API_URL)
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .codecs(clientCodecConfigurer -> 
            clientCodecConfigurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024)) // 16 MB
        .build();
    }

    public Mono<List<Integer>> calculatePopularityForRoutes(List<List<List<Double>>> routes){
        return Flux.fromIterable(routes)  //process each route async
        .flatMap(this::processRoute) //processing eacg route
        .collectList(); //return as a list
    }

    private Mono<Integer> processRoute(List<List<Double>> route){
        return Mono.fromCallable(() -> {
            double minLng = route.stream().mapToDouble(coord -> coord.get(0)).min().orElse(0);
            double minLat = route.stream().mapToDouble(coord -> coord.get(1)).min().orElse(0);
            double maxLng = route.stream().mapToDouble(coord -> coord.get(0)).max().orElse(0);
            double maxLat = route.stream().mapToDouble(coord -> coord.get(1)).max().orElse(0);

            String bboxUrl = OSM_API_URL + minLng + "," + minLat + "," + maxLng + "," + maxLat;

            System.out.println("Generated bboxUrl: " + bboxUrl); // Debug log

            return bboxUrl;
        })
        .flatMap(this::fetchGpsTraceData) //fetch gps data
        .map(response -> countMatchedPoints(response, route)) //process xml to count for the trace
        .onErrorReturn(0);


    }

    private Mono<String> fetchGpsTraceData(String url){
        
        //hhttp call to fetch the data.. 
        return webClient.get()
        .uri(url)
        .retrieve()
        .bodyToMono(String.class)
        .doOnNext(response -> {
            if (response.isEmpty()) {
                System.out.println("No GPS trace data received for URL: " + url);
            } else {
                System.out.println("XML Response Length: " + response.length());
            }
        })
        .doOnError(error -> System.err.println("Error fetching GPS data: " + error.getMessage()));
    }

    private int countMatchedPoints(String xmlData, List<List<Double>> route){
        
        try {
            



            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xmlData)));

            NodeList trackpoints = doc.getElementsByTagName("trkpt");

            System.out.println("Number of trackpoints found: " + trackpoints.getLength());

            int matchedCount = 0;

            for (int i = 0; i < trackpoints.getLength(); i++) {
                
                Element point = (Element) trackpoints.item(i);
                double lat = Double.parseDouble(point.getAttribute("lat"));
                double lon = Double.parseDouble(point.getAttribute("lon"));


                for (List<Double> coord : route) {
                    double distance = Math.sqrt(
                        Math.pow(lat -coord.get(1),2) + Math.pow(lon - coord.get(0), 2)
                    );

                    if (distance < MATCHING_DISTANCE_THRESHOLD) {
                        System.out.println("Matched Point - Trackpoint: (" + lat + ", " + lon +
                                           ") | Route Coordinate: " + coord);
                        matchedCount++;
                        break;
                    }
                }
            }

            System.out.println("Total matched points: " + matchedCount);
            return matchedCount;



        } catch (Exception e) {
            // TODO: handle exception

            e.printStackTrace();
            return 0;
        }

    }
    
}
