library(tidyverse)
library(sf)
library(cwi)
library(tidycensus)
#HOLC neighborhood classifications (redlined neighborhoods)
file.remove("data/holc.geojson")
holc <- read_sf("data/holc/holc_ad_data.shp") %>% 
  filter(city == "New Haven") %>% 
  select(holc_id, holc_grade) %>% 
  mutate(x = st_coordinates(st_centroid(geometry))[,"X"])
write_sf(holc, "data/holc.geojson") #already in EPSG:4326 -> nice

#current New Haven neighborhood outlines
file.remove("data/nhv_neighborhoods.geojson")
new_haven_sf %>% 
  write_sf("data/nhv_neighborhoods.geojson") #thanks camille lol

#% of population that are Black for each New Haven block
#maybe this should probably be uploaded as a mapbox tileset?
nhv <- new_haven_sf %>% st_transform(2234) %>% st_union()
file.remove("data/prop_black.geojson")
dta <-get_decennial("block", variables = c("P008001", "P008004"),
              state = "CT", county = "New Haven", geometry = T, 
              output = "wide")  %>% 
  st_transform(2234) %>% 
  mutate(prop_black = P008004/P008001,
         centroids = st_centroid(geometry),
         intersects = as.vector(st_contains(nhv, centroids, sparse = F))) %>% 
  filter(intersects, !is.na(prop_black)) %>% 
  mutate(holc = st_within(centroids, st_transform(holc, st_crs(.))) %>% 
           map(~holc$holc_id[.[1]]) %>% #necessary to turn blocks iwth no HOLC id to NA and thus get a vector of the right length
           unlist()) %>% 
  select(prop_black, holc) %>% 
  #spatial join to find what HOLC district this block is in. weird syntax :/
  st_as_sf() %>% 
  st_set_crs(2234) %>% 
  st_transform(4326) %>% 
  rmapshaper::ms_simplify() 
write_sf(dta, "data/prop_black.geojson", overwrite = T)

file.remove("data/intro_nhv.json")
nhv_green <- st_transform(st_set_crs(st_sfc(st_point(c( -72.926276, 41.307808))), 4326), 2234)
intro_nhv <- tigris::blocks(state = "CT", county = "New Haven") %>% 
  st_transform(2234) %>% 
  mutate(centroids = st_centroid(geometry), 
    intersects = as.vector(st_contains(nhv, centroids, sparse = F))) %>% 
  filter(intersects) %>% 
  mutate(dist = ntile(st_distance(centroids, nhv_green), 100) * .01) 
dist_lst <- st_distance(intro_nhv) %>% 
  split(1:1494) %>% #split matrix to a list
  map(~order(.)[1:12]) # get indexes of 11 closest points
#man that was annoying to figure out lmao


intro_nhv %>% 
  select(dist) %>% 
  mutate(neighbors = dist_lst) %>% #i believe IDs aren't needed bc d3 functions are in the form of function(d,i)
  st_transform(4326)  %>% 
  jsonlite::write_json("data/intro_nhv.json")
  #write_sf("data/intro_nhv.geojson") #write_sf doesn't support list-columns
  