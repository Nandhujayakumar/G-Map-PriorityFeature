package com.gmap.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.gmap.backend.Service.RouteService;

import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:5173")
public class PopularityController {

    @Autowired
    private RouteService routeService;

    @PostMapping(value = "/popularity", produces = "application/json")
    public Mono<ResponseEntity<List<Integer>>> getRoutePopularity(@RequestBody List<List<List<Double>>> routes) {

            return routeService.calculatePopularityForRoutes(routes)
            .map(ResponseEntity::ok)
            .onErrorResume(e -> Mono.just(ResponseEntity.status(500).body(null)));
            
    }
    

}
