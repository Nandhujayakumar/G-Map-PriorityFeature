package com.gmap.backend.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gmap.backend.Service.RouteService;


@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:5173")
public class PopularityController {

    @Autowired
    private RouteService routeService;

    @PostMapping("/popularity")
    public ResponseEntity<List<Map <String, Object>>> getRoutePopularity(@RequestBody List<List<Map<String, Double>>> routes) {
        List<Map<String, Object>> popularityData = routeService.calculateRoutePopularity(routes);
        return ResponseEntity.ok(popularityData);
    }
    

}
