import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import config from '@arcgis/core/config';
import Track from '@arcgis/core/widgets/Track';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Search from '@arcgis/core/widgets/Search';

// Importuri noi pentru rutare
import * as route from "@arcgis/core/rest/route";
import RouteParameters from "@arcgis/core/rest/support/RouteParameters";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";

import { FirebaseService, IPunctColectare } from 'src/app/services/firebase'; 

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.scss']
})
export class EsriMapComponent implements OnInit, OnDestroy {
  @ViewChild('mapViewNode', { static: true }) private mapViewEl: ElementRef;
  view: MapView;
  
  // Endpoint-ul serviciului de rute ArcGIS
  private routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
  
  private routeLayer: GraphicsLayer;
  private track: Track;

  constructor(private fbs: FirebaseService) { }

  ngOnInit(): void {
    config.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurKE-LqnQJv5ZftEj6_bxNtQG6vNR3GkqjbvMOicmrThaxVKq5kAQ9sy5gihvr9_2fjkcUNuqBkdTPsUIK9mc8flhJL0R_Yo7u4f-rMBv0sGf9szVhDXnL_iWa35KmYKWXMOWTkiQLbMc0Xn6V3U_7KU-r5JzNslkBIptJ0SEomLRV91NMvvzcDEaNN_87Z09W4KVJCswjpJGvir4dS73otw.AT1_MwiabmZ1";

    const map = new Map({
      basemap: "streets-vector"
    });

    this.routeLayer = new GraphicsLayer(); // Strat pentru desenarea rutei
    map.add(this.routeLayer);

    this.view = new MapView({
      container: this.mapViewEl.nativeElement,
      map: map,
      center: [24.9668, 45.9432],
      zoom: 7
    });

    // --- LOGICA PENTRU CĂUTARE ȘI RUTARE ---
    const searchWidget = new Search({
      view: this.view,
      allPlaceholder: "Caută magazin sau adresă"
    });

    // Când selectezi un rezultat din bara de căutare, calculăm ruta
    searchWidget.on("select-result", (event) => {
      this.calculateRoute(event.result.feature.geometry as Point);
    });

    this.view.ui.add(searchWidget, "top-right");

    this.track = new Track({
      view: this.view,
      useHeadingEnabled: false
    });
    this.view.ui.add(this.track, "top-left");

    const pointsLayer = new GraphicsLayer();
    map.add(pointsLayer);

    // Încărcare puncte din Firebase
    this.fbs.getChangeFeedPuncte().subscribe((puncte: IPunctColectare[]) => {
      pointsLayer.removeAll();
      puncte.forEach(p => {
    const pointGeometry = new Point({
        longitude: Number(p.long),
        latitude: Number(p.lat),
        // CORECOȚIE: Folosim wkid în loc de wgs84
        spatialReference: { wkid: 4326 } 
    });

    const graphic = new Graphic({
        geometry: pointGeometry,
        symbol: {
            type: "simple-marker",
            color: [34, 139, 34],
            size: "12px",
            outline: { color: "white", width: 1 }
        } as any,
        attributes: p,
        popupTemplate: {
            title: "{name}",
            content: `
              <p><b>Adresă:</b> {address}</p>
              <p><b>Status:</b> {status}</p>
            `,
            actions: [{ 
                title: "Navighează aici", 
                id: "navigate-to-store", 
                className: "esri-icon-directions",
                type: "button" as any 
            }]
        }
    });
    pointsLayer.add(graphic);
});
    });

    // Ascultăm click-ul pe butonul "Navighează aici" din Popup
   this.view.popup.on("trigger-action", (event) => {
  if (event.action.id === "navigate-to-store") {
    // Obținem feature-ul selectat curent în popup
    const selectedGraphic = this.view.popup.selectedFeature;
    
    if (selectedGraphic && selectedGraphic.geometry) {
        // Trimitem geometria (care acum are SpatialReference) către rutare
        this.calculateRoute(selectedGraphic.geometry as Point);
    }
  }
});
  }

  // --- FUNCȚIA DE CALCULARE A RUTEI ---
  async calculateRoute(destination: Point) {
    this.routeLayer.removeAll(); // Ștergem rutele vechi

    // 1. Obținem locația de start (de la widget-ul Track sau centrul hărții)
    let startPoint = this.track.graphic?.geometry as Point;
    
    if (!startPoint) {
      alert("Vă rugăm să activați localizarea (butonul Track) pentru a calcula ruta.");
      return;
    }

    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: [
          new Graphic({ geometry: startPoint }),
          new Graphic({ geometry: destination })
        ]
      }),
      returnDirections: true
    });

    try {
      const data = await route.solve(this.routeUrl, routeParams);
      if (data.routeResults.length > 0) {
        const routeResult = data.routeResults[0].route;
        routeResult.symbol = {
          type: "simple-line",
          color: [5, 150, 255], // Albastru deschis
          width: 4
        } as any;
        
        this.routeLayer.add(routeResult);
        console.log("Rută calculată cu succes!");
      }
    } catch (error) {
      console.error("Eroare la calcularea rutei:", error);
      alert("Nu s-a putut calcula ruta. Verificați conexiunea sau permisiunile API Key.");
    }
  }

  ngOnDestroy(): void {
    if (this.view) this.view.destroy();
  }
}