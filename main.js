window.onload=init;

function init()
{
    const fullscreen = new ol.control.FullScreen(); //to show fullscreen button on the top-right 
    const curpos = new ol.control.MousePosition( {projection:'EPSG:4326'}); //show pointer coordinates
    //https://openlayers.org/en/latest/examples/mouse-position.html
    const inset = new ol.control.OverviewMap({
        layers:[new ol.layer.Tile({source: new ol.source.OSM({collapsed:false})
        })]        
    });
    const scale = new ol.control.ScaleLine({bar:true});
    //https://openlayers.org/en/latest/apidoc/module-ol_control_ScaleLine-ScaleLine.html

    const Peta = new ol.Map
    ({
            view: new ol.View({
                center:ol.proj.fromLonLat([144.9,-36.6]), 
                zoom:8,    //default
                minZoom:2,
                maxZoom:16
            }),
            target: 'peta', //this is DOM id
            controls: ol.control.defaults().extend([fullscreen, curpos, inset,scale]) //to show fullscreen button on the top-right or mouse position. All control instaces should be located in here
    })

//=====================================================================================================================================================================
// BASE MAP
// ====================================================================================================================================================================

const OSM = new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible:false,
    title:"osm",
    zIndex:3        
})


//change basemap:
//bingmaps
//https://www.bingmapsportal.com/Application
const BingMaps = new ol.layer.Tile({
    source: new ol.source.BingMaps({
        key:"Ai5uhJ7V8w8cnyoDBY5tt_A5b-2343USu4G4vwhs_JTZGp3yQEDoJqrLBk1bcO-f",
        imagerySet: "CanvasDark" //Road, CanvasDark, CanvasGray, Aerial, AerialWithLabels
    }),
    visible:false,
    zIndex:3,
    title:"bingmaps"
})
//    Peta.addLayer(BingMaps)

//stamen
//maps.stamen,com
const Stamen = new ol.layer.Tile({
    source: new ol.source.Stamen({
        layer: "toner" //toner, terrain, watercolor, 
        //http://maps.stamen.com/#watercolor/12/37.7706/-122.3782
    }),
    visible:false,
    zIndex:3,
    title:"stamen"       
})
//Peta.addLayer(Stamen)

const TileDebug = new ol.layer.Tile({
    source : new ol.source.TileDebug(),
    visible:false,
    //zIndex:10 //to arrange the layer. Higher means top layer
    zIndex:3,
    title:"tiledebug"
})
//    Peta.addLayer(TileDebug)

const gmaps = new ol.layer.Tile({
    //https://spatialmate.com/xyz-tiles-basemap/
    source: new ol.source.XYZ({
        url:"https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        attributions: "Google Maps",
        attributionsCollapsible:false
    }),
    visible:true,
    zIndex:3,
    title:"gmaps"
})
//Peta.addLayer(gmaps)

const cartodb = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url:"https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        attributions: "From CartoDB",
        attributionsCollapsible:false
        //https://spatialmate.com/xyz-tiles-basemap/
    }),
    visible:false,
    zIndex:3,
    title:"cartodb"        
})
//    Peta.addLayer(cartodb)

const esri = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",            
        attributions: "ESRI",
        attributionsCollapsible:false
        //https://spatialmate.com/xyz-tiles-basemap/
    }),
    visible:false,
    zIndex:3,
    title:"esri"        
})
//   Peta.addLayer(esri)
//GROUP
const Basemap = new ol.layer.Group({
    layers:[OSM,BingMaps,Stamen,TileDebug,gmaps,cartodb,esri]
})
Peta.addLayer(Basemap)

//logic selection
const selBaseMaps = document.querySelectorAll("#layer > input[name=rbasemap]")
for( let eBase of selBaseMaps){
    eBase.addEventListener("change",function(){
        let baseValue = this.value;
        Basemap.getLayers().forEach(function(element,index,array){
            let baseTitle = element.get("title");
//                alert(baseTitle+" | "+index+" val="+baseValue);
            element.setVisible(baseTitle===baseValue);
        })
    })
}

//========================================================================================================
// VECTOR LAYER
//========================================================================================================
   
    const gisline = function(feature){
        //this function will extract colour info from the spatial objects
        let col = feature.get('color').split(",")
//kalau titik pakai image pak setelah style, kalau garis pakai stroke, kalau polygon pakai fill

        feature.setStyle([
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color:[col[0],col[1],col[2],1] ,
                    width: 2
                })              
            })
        ])                   
    }

       
    const road = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url: './layer/t21324_1017_web.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:false,
        title:"road",
        zIndex:11
        ,style:gisline

    })

    const gisclass = function(feature){
        //this function will extract colour info from the spatial objects
        let col = feature.get('color').split(",")
        feature.setStyle([
            new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color:[col[0],col[1],col[2],1] 
                        //colour:[R,G,B,Transparancy level --> 0=transparent | 1 = solid]
                    }),
                    stroke: new ol.style.Stroke({
                        color:[0,0,0,1] ,
                        width: 2
                    }),                    
                    radius:6
                })
            })
        ])            
    }

    const hospital = new ol.layer.VectorImage({
        source: new ol.source.Vector({
            url: './layer/t21324_1017_facility.geojson',
            format: new ol.format.GeoJSON()
        }),
        visible:false,
        zindex:200,
        style:gisclass,
        title:"hospital" //it must match with the value from the checkbox in index.html
    })


//        Peta.addLayer(school) //point
//        Peta.addLayer(bld) //polygon
//        Peta.addLayer(road) //line

    const GroupVector = new ol.layer.Group({
        layers: [hospital,road],
        zIndex:100
    })

    Peta.addLayer(GroupVector) //alternate to handle multiple layers

    //layer changed logic
    const elVectorLayers = document.querySelectorAll('#layer > input[name=vektor]')
    for (let eVL of elVectorLayers)
    {
        eVL.addEventListener('change',function(){
            let VLVal = this.value;
            let VLconnected;

            GroupVector.getLayers().forEach(function(element, index, array){
                if(VLVal === element.get('title'))
                {
                    VLconnected = element;
                }
            })
            this.checked ? VLconnected.setVisible(true) : VLconnected.setVisible(false)

        })
    }




    //Layer Raster
    //WMS
    //https://nowcoast.noaa.gov/help/#!section=wms-layer-ids
    //https://nowcoast.noaa.gov/arcgis/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/WMSServer?request=GetCapabilities&service=WMS&version=1.3.0
    const wms = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url:"https://nowcoast.noaa.gov/arcgis/services/nowcoast/analysis_meteohydro_sfc_qpe_time/MapServer/WMSServer",
            params:{
                LAYER:1, //refer to https://nowcoast.noaa.gov/help/#!section=wms-layer-ids what you want to show
                FORMAT: 'image/png'
                /*<Format>image/bmp</Format>
<Format>image/jpeg</Format>
<Format>image/tiff</Format>
<Format>image/png</Format>
<Format>image/png8</Format>
<Format>image/png24</Format>
<Format>image/png32</Format>
<Format>image/gif</Format>
<Format>image/svg+xml</Format>*/
            }
        }),
        visible:false,
//        zIndex:40 //ensure it has value higher than basemap
    })

    Peta.addLayer(wms)

    const arcgis = new ol.layer.Tile({
        source: new ol.source.TileArcGISRest({
            //http://sampleserver1.arcgisonline.com/ArcGIS/rest/services
            url:"http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer",
            attributions: "some description"
        })
    })

    //Peta.addLayer(arcgis)

    //geoserver
    const geoserver = new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: "http://localhost:8080/geoserver/my_workspace/wms",
            params:{
                LAYERS: "my_workspace:Admin_kecamatan",
                FORMAT: 'image/png'
            }
        }),
        //zIndex:50
    })

    //Peta.addLayer(geoserver)

//========================================================================================================================
//Boundary Layer
//========================================================================================================================

       
const boundary_vic = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: './layer/boundary_vic.geojson',
        format: new ol.format.GeoJSON()
    }),
    visible:false,
    title:"vic",
    zIndex:50
})

const boundary_metro = new ol.layer.VectorImage({
    source: new ol.source.Vector({
        url: './layer/boundary_metropolitan.geojson',
        format: new ol.format.GeoJSON()
    }),
    visible:false,
    title:"metro",
    zIndex:51
})

const baseBoundary = new ol.layer.Group({
    layers:[boundary_vic, boundary_metro]
})
Peta.addLayer(baseBoundary)
    
//logic selection
const selBoundary = document.querySelectorAll("#layer > input[name=boundary]")
for( let eBound of selBoundary){
    eBound.addEventListener("change",function(){
        let baseValue = this.value;
        baseBoundary.getLayers().forEach(function(element,index,array){
            let baseTitle = element.get("title");
//                alert(baseTitle+" | "+index+" val="+baseValue);
            element.setVisible(baseTitle===baseValue);
        })
    })
}



}