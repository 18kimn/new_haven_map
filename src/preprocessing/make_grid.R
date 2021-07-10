source("code/setup.R")
library(rcartocolor)
library(rmapshaper)
nhv <- read_sf("data/raw_shps/NH_Parcels_09232019.shp") 
nhv <- nhv %>% 
  mutate(area = st_area(geometry), 
         owner = str_to_title(Owner_Name), 
         bbox = map(geometry, st_bbox),
         width = unlist(map(bbox, function(x) diff(x[c(1,3)]))),
         height = unlist(map(bbox, function(x) diff(x[c(2,4)]))))

#Assign into rows via adding up widths -- there should be 20 rows, so approximately 69000 width in each row

#X-positions
nhv <- nhv %>% 
  arrange(desc(width)) 
nhv <- nhv[-c(1,5),] #For some reason the first row is the entire city, so we can just drop that one 

nhv <- nhv %>% 
  mutate(cumu_width = cumsum(width),
         row = ceiling(cumu_width/17500)) %>% 
  group_by(row) %>% 
  mutate(within_grp_id = 1:n(),
         x_pos = cumsum(width)-(width/2)) #might require a tiny bit of spacing to make buildings farther apart
#If it's the first one in the row, the x-position is 1
#If it isn't, it's cumulative sum of the x-positions before it

y_pos <- nhv %>% 
  st_drop_geometry() %>% 
  group_by(row) %>% 
  summarize(heights = max(height)) %>% 
  mutate(y_pos = ifelse(row == 1,0,heights),
         y_pos = -8110829-cumsum(y_pos)) %>% 
  select(-heights)

nhv <- nhv %>% 
  left_join(y_pos, by = "row")
  
# y-positions are constant throughout rows
# If it's the first row, the y-position is 1
# If it's not, it's the y-position of the row before it, minus .6 of the height of the tallest building in that row 

#Okay, now it's time to translate the geometries 
# 1. Create centroids of current placements
# 2. Find difference of current centroids to where the points need to go. The difference is an sf point 
# 3. Subtract the original polygon from this, use map() to do it iteratively. 
nhv <- nhv %>% ungroup() %>% 
  mutate(og_geometry = geometry,
         centroids = st_centroid(geometry),
         diff = pmap(list(centroids, x_pos,y_pos), 
                     function(centroid, x,y) centroid- c(x,y)),
         diff = st_as_sfc(diff), 
         geometry = st_zm(geometry, drop = T),
         geometry = map2(geometry, diff, 
                         function(geo, current_diff) geo-current_diff),
         geometry = st_as_sfc(geometry))


#when we're translating inside the d3 animation, we want the overall center of the image to more or less remain where it is -- 
# we don't want things to suddeyl fly towards a point off of the grid for some reason when the transition begins
geo_diff <- (st_centroid(st_geometrycollection(nhv$og_geometry)) - 
               st_centroid(st_geometrycollection(nhv$geometry)))
nhv <- nhv %>% 
  mutate(geometry = geometry + as.numeric(geo_diff),
         diff = diff + as.numeric(geo_diff)) #move new geometries towards old geometries 




#Simplifying the ownership a little bit
nhv <- nhv %>% 
  mutate(owner = case_when(str_detect(owner, "City Of New Haven") ~ "City Of New Haven",
                           str_detect(owner, "Yale") ~ "Yale University",
                           T ~ owner),
         owner = str_replace(owner, "Of","of"))
top_owners <- nhv %>% st_drop_geometry() %>% 
  drop_na(owner) %>% 
  group_by(owner) %>% 
  summarize(area = sum(area)) %>% 
  top_n(6, area) %>% 
  pull(owner)

nhv <- nhv %>% 
  mutate(owner = case_when(owner %in% top_owners ~ owner, 
                           T ~ "Other"),
         owner = as_factor(owner),
         owner = fct_relevel(owner, "Other", after = Inf))

# a version for d3 animation 
nhv <- nhv %>% 
  filter(!duplicated(AV_PID)) %>% 
  st_set_crs(3857) 

#The double conversion seems tedious but I don't know of a way to do it effectively (e.g. via mutate(across(c(og_geometry, geometry), ~st_transform(...)))) 
#It needs to be exported in lon/lat but the grid needs to be created using the ft/m projected coords, so some conversion is definitely necessary


#new plan: the html5 canvas is not working as i had hoped :/ so instead I will make a georeferenced 32fps video :D
nhv <- nhv %>% 
  mutate(diff = st_centroid(geometry) - st_centroid(og_geometry),
         og_geometry = st_zm(og_geometry)) %>% 
  select(geometry, og_geometry, diff)

library(furrr)
plan(multiprocess)
future_map(1:80, function(f){#f for frame
  t <- ifelse(f < 40, 4 * (f/80)^3,
              1 - (f/-40+2)^3/2) #cubic-in-out function
  
  nhv %>% 
    mutate(geometry_plot = og_geometry + (diff * t)) %>% #runtime is bad :/ I wonder how it could be improved?
    as_tibble() %>% 
    st_as_sf(sf_column_name = "geometry_plot") %>% 
    ggplot() + 
    geom_sf(color = "#69b3a2", size = 0.5) + 
    theme_void()  +
    scale_x_continuous(limits = c(-8126462, -8108366)) + 
    scale_y_continuous(limits = c(5045109, 5069101)) + 
    ggsave(paste0("plots/grid_frames/", f, ".png"), 
           width = 9.6, height = 5.4)
  return(NULL)
})

library(magick)
paste0("plots/grid_frames/", c(1:80 , 80:1), ".png") %>% 
  map(image_read) %>% 
  image_join() %>% 
  image_write_video("plots/grid.mp4", framerate = 32)

#getting a transparent one for coordinate tracking purposes

nhv %>% as_tibble() %>% st_as_sf(sf_column_name = "og_geometry") %>% 
  ggplot() + 
  geom_sf(color = "#69b3a2", size = 0.5, fill = "transparent") + 
  theme_void()  +
  scale_x_continuous(limits = c(-8126462, -8108366)) + 
  scale_y_continuous(limits = c(5045109, 5069101)) +
  theme(
    panel.background = element_rect(fill = "transparent"), # bg of the panel
    plot.background = element_rect(fill = "transparent", color = NA), # bg of the plot
    panel.grid.major = element_blank(), # get rid of major grid
    panel.grid.minor = element_blank(), # get rid of minor grid
    legend.background = element_rect(fill = "transparent"), # get rid of legend bg
    legend.box.background = element_rect(fill = "transparent") # get rid of legend panel bg
  ) + 
  ggsave(paste0("plots/transparent_nhv.png"), 
         bg = "transparent", 
         width = 9.6, height = 5.4)
 
# ggplot() + 
#   geom_sf(data= nhv, aes(fill = owner), color = NA) + 
#   scale_fill_carto_d(name = "Top owners by land area", palette = "Safe") + 
#   labs(title = "New Haven properties, sorted by size") + 
#   theme(plot.title = element_text(size = 44, hjust = .1, margin = margin(b = -.5, unit = "cm")), 
#         legend.title = element_text(size = 32), 
#         legend.box.spacing = unit(-.8, "cm"), 
#         legend.text = element_text(size = 18)) + 
#   ggsave("plots/buildings.png", height = 9, width = 9, dpi = 600)
