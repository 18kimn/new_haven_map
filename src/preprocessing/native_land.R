library(tidyverse)
library(jsonlite)
library(sf)

native_land <- fromJSON("https://native-land.ca/api/index.php?maps=territories") %>% 
  mutate(coords = geometry$coordinates %>% 
           map(function(x){
             ncols <- last(dim(x))
      #We want st_polygon() recognize each row as containing a single polygon
      #That means we need each row to be a single-item list, where the item is a matrix with coordinates in x-y-z order
      #Currently each item in the column is an array, so we need to convert it to a matrix depending on how many attributes there are. Some don't have a z-attribute, so we convert it flexibly with the "ncol = " argument
      #We drop the z attribute with st_zm() so that they can be bound together as a single column
             
             matrix(x, ncol = ncols) %>% 
               list() %>% 
               st_polygon() %>% 
               st_zm(drop = T)
             
             }) %>% 
           st_sfc(),#this binds everything together as an sf column
         name = properties$Name) %>% 
  select(coords, name) %>% 
  st_as_sf() %>% 
  st_set_crs(4326) #couldn't find the exact projection anywhere on the Native Land docs so EPSG:4326 is my guess


width <- 246141.3 
height <- 246172.1 
xlims <- c(-8218907, -8218907 + width)
ylims <- c(4971335, 4971335 + height)

ct <- c(xmin = -75.439, ymin =40.89984, xmax = -71.190, ymax = 42.334157)
d3_pal <- c("#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf")
native_land <- native_land %>% 
  st_crop(y = ct) %>% 
  mutate(fill = rep(d3_pal, ceiling(nrow(.)/length(d3_pal)))[1:nrow(.)]) 
nation_labels <- native_land %>% 
  mutate(lab_locations = map_dfr(polylabelr::poi(coords), as_tibble), 
         text_x = lab_locations[["x"]],
         text_y = lab_locations[["y"]])  %>% 
  select(-lab_locations)

file.remove("data/native_land.geojson")
st_write(nation_labels, "data/native_land.geojson")


cwi::town_sf %>% 
  st_write("data/ct_town.geojson")

library(maptools)
data(wrld_simpl)

wrld_simpl %>% st_as_sf() %>% select() %>% 
  rmapshaper::ms_simplify(keep = 0.2) %>% 
  st_combine() %>% #st_combine helps not for storage purposes but for the svg; manipulating a single big path is better than manipulating lots of small paths
  st_write("data/world_map.geojson")

tigris::states() %>% 
  st_as_sf() %>% select() %>% 
  rmapshaper::ms_simplify(keep = 0.05) %>% 
  st_combine() %>% 
  st_write("data/us_states.geojson")