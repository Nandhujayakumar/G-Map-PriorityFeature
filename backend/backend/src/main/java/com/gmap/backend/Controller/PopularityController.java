package com.gmap.backend.Controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gmap.backend.Service.RouteService;


@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:5173")
public class PopularityController {

    private static final Logger logger = LoggerFactory.getLogger(PopularityController.class);

    @Autowired
    private RouteService routeService;

    @PostMapping(value = "/popularity", produces = "application/json")
    public ResponseEntity<List<Integer>> getRoutePopularity(@RequestBody List<List<List<Double>>> routes) {
        try {
            List<Integer> popularities = routeService.calculatePopularityForRoutes(routes);
            return ResponseEntity.ok(popularities);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    

}
