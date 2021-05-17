library(tidyverse)
library(sf)
property_info <- read_csv("data/property_info.csv")

nhv <- read_sf("data/raw_shps/NH_Parcels_09232019.shp") 

nhv <- nhv %>% 
  filter(!duplicated(AV_PID)) %>% 
  select(AV_PID) %>% 
  left_join(property_info, by = c("AV_PID" = "pid")) %>% 
  mutate(owner = str_to_title(owner) %>% 
           str_replace_all("Of", "of"),
         owner = case_when(str_detect(owner, "City Of New Haven") ~ "City Of New Haven",
                           str_detect(owner, "Yale") ~ "Yale University",
                           T ~ owner),
         address = str_to_title(address),
         total_value = improvement_value + land_value,
         total_value_form = total_value, 
         zone = ifelse(!is.na(zone_description) & !is.na(zoneclean), 
                       paste0("<br>Zone: ", zone_description , " (", zoneclean, ")"), 
         "<br>Zoning information not available."),
         year_built = ifelse(!is.na(year_built), 
                             paste0("</strong><br>Built in ", year_built), 
                             "</strong><br>Year built not available."),
        gross_area = ifelse(!is.na(gross_area), 
                            paste0("</p><p>Building area: ", gross_area, " sq ft"),
                            "</p><p>Gross area not available."),
         across(c(total_value_form, improvement_value, land_value), ~paste0("$", str_trim(format(.,big.mark = ",", scientific = F)))),
         label = paste0("<h3><strong>", address, "</strong></h3><p> Owned by <strong>" ,
                        owner, year_built, 
                        zone, 
                        "<br>Land value: ", land_value, 
                        "<br>Total value: ", total_value_form, 
                        gross_area,
                        "<br>Property area: ", landsize, "acres</p>"
                        ),
         label = ifelse(is.na(address), "Property information not available.", label)) %>% 
  st_set_crs(3857) %>% 
  st_transform(4326) %>% 
  #rmapshaper::ms_simplify(keep_shapes=T) %>% #ms_simplify() is to blame for the runtime on this sentence (update: decided since im sending this to mapbox it doesnt matter)
  select(label, total_value) 

file.remove("data/property_values.geojson")

st_write(nhv, "data/property_values.geojson", append = F)
# 
# var label = "<h3><strong>" + item.address + "</strong></h3><p> Owned by <strong>" + item.owner +
#   "</strong><br>Built in " + item.year_built +
#   "<br>Zone: " + item.zone_description + " (" + item.zoneclean +
#   ")<p>Improvement value: $" + item.improvement_value +
#   "<br>Land value: $" + item.land_value +
#   "<br>Total value: $" + item.total_value_form +
#   "<p> Building area: " + item.gross_area +
#   " sq ft <br> Property area: " + item.landsize +
#   " acres</p>";

# block-level geometry set
nhv_outline <- st_union(cwi::new_haven_sf)
nhv_blocks <- tigris::blocks(state = "CT", county = "New Haven") %>% 
  st_transform(4326) %>% 
  mutate(centroids = st_centroid(geometry),
    intersects = as.vector(st_contains(nhv_outline, centroids, sparse = F))) %>% 
  filter(intersects) %>% select(GEOID10)

nhv_block <- nhv %>% 
  mutate(geometry = st_centroid(geometry)) %>% 
  st_join(nhv_blocks, join = st_within) %>% 
  st_drop_geometry() %>% 
  group_by(GEOID10) %>% 
  summarize(total_value = mean(total_value, na.rm=T)) %>% 
  mutate(print_value = paste0("$", str_trim(format(total_value,big.mark = ",", scientific = F)))) %>% 
  left_join(nhv_blocks, by = "GEOID10")

file.remove("data/property_values_block.geojson")
st_write(nhv_block, "data/property_values_block.geojson", append = F)


