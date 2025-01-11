package com.gmap.backend.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class BoundingBox {
    
    private double minLat;
    private double minLng;
    private double maxLat;
    private double maxLng;
}
