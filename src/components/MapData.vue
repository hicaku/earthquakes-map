<template>
    <div class="mapData">
        <div class="mapContainer" id="mapContainer"></div>
    </div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import Mapbox from "mapbox-gl";
import { useCookies, globalCookiesConfig } from "vue3-cookies";

globalCookiesConfig({
    expireTimes: "60d",
    path: "/",
    domain: "",
    secure: true,
    sameSite: "None",
});

export default class MapData extends Vue {
    private accessToken =
        "pk.eyJ1Ijoic3BlbmNlaGlrbyIsImEiOiJja3oycHNqbTYwMGEyMnpuMGg5M2Jpbmh3In0.eZG6gxWY-T2eEn_7CqEjNA";
    private map!: any;
    private earthquakes!: any;
    private cookies = useCookies().cookies;

    async mounted() {
        Mapbox.accessToken = this.accessToken;

        this.map = new Mapbox.Map({
            container: "mapContainer",
            style: "mapbox://styles/mapbox/dark-v10",
            center: [103.811279, 1.345399],
            zoom: 2,
        });
        this.map.on("load", () => {
            // Add a geojson point source.
            // Heatmap layers also work with a vector tile source.
            this.map.addSource("earthquakes", {
                type: "geojson",
                data: "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&minmagnitude=2.5&limit=5000",
            });

            this.map.addLayer(
                {
                    id: "earthquakes-heat",
                    type: "heatmap",
                    source: "earthquakes",
                    maxzoom: 9,
                    paint: {
                        // Increase the heatmap weight based on frequency and property magnitude
                        "heatmap-weight": [
                            "interpolate",
                            ["linear"],
                            ["get", "mag"],
                            0,
                            0,
                            6,
                            1,
                        ],
                        // Increase the heatmap color weight weight by zoom level
                        // heatmap-intensity is a multiplier on top of heatmap-weight
                        "heatmap-intensity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            0,
                            1,
                            9,
                            3,
                        ],
                        // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                        // Begin color ramp at 0-stop with a 0-transparancy color
                        // to create a blur-like effect.
                        "heatmap-color": [
                            "interpolate",
                            ["linear"],
                            ["heatmap-density"],
                            0,
                            "rgba(33,102,172,0)",
                            0.2,
                            "rgb(103,169,207)",
                            0.4,
                            "rgb(209,229,240)",
                            0.6,
                            "rgb(253,219,199)",
                            0.8,
                            "rgb(239,138,98)",
                            1,
                            "rgb(178,24,43)",
                        ],
                        // Adjust the heatmap radius by zoom level
                        "heatmap-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            0,
                            2,
                            9,
                            20,
                        ],
                        // Transition from heatmap to circle layer by zoom level
                        "heatmap-opacity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            7,
                            1,
                            9,
                            0,
                        ],
                    },
                },
                "waterway-label"
            );

            this.map.addLayer(
                {
                    id: "earthquakes-point",
                    type: "circle",
                    source: "earthquakes",
                    minzoom: 7,
                    paint: {
                        // Size circle radius by earthquake magnitude and zoom level
                        "circle-radius": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            7,
                            [
                                "interpolate",
                                ["linear"],
                                ["get", "mag"],
                                1,
                                1,
                                6,
                                4,
                            ],
                            16,
                            [
                                "interpolate",
                                ["linear"],
                                ["get", "mag"],
                                1,
                                5,
                                6,
                                50,
                            ],
                        ],
                        // Color circle by earthquake magnitude
                        "circle-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "mag"],
                            1,
                            "rgba(33,102,172,0)",
                            2,
                            "rgb(103,169,207)",
                            3,
                            "rgb(209,229,240)",
                            4,
                            "rgb(253,219,199)",
                            5,
                            "rgb(239,138,98)",
                            6,
                            "rgb(178,24,43)",
                        ],
                        "circle-stroke-color": "white",
                        "circle-stroke-width": 1,
                        // Transition from heatmap to circle layer by zoom level
                        "circle-opacity": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            7,
                            0,
                            8,
                            1,
                        ],
                    },
                },
                "waterway-label"
            );
        });
    }
    getCookie(cookieName:string) {
        let name = cookieName + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(";");
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.mapContainer {
    height: 70vh;
    width: 100%;
    margin: 0;
    padding: 0;
    .mapboxgl-canvas {
        width: 100%;
        height: auto;
    }
}
</style>