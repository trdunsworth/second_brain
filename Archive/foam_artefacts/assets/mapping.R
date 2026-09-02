# Load necessary libraries
library(tidyverse)     # For data manipulation
library(leaflet)       # For interactive maps
library(htmlwidgets)   # For saving the map as HTML

# Sample data - replace with your actual data from database
# Now including both coordinates and addresses
calls_data <- data.frame(
  call_id = 1:10,
  latitude_int = c(38803372, 38802145, 38814567, 38802789, 38806543, 
                  38808912, 38805432, 38810765, 38809123, 38812456),
  longitude_int = c(77042786, 77058123, 77053456, 77084321, 77062789,
                   77043654, 77061234, 77071234, 77129876, 77042345),
  address = c(
    "100 King St, Alexandria, VA",
    "1800 Diagonal Rd, Alexandria, VA",
    "400 Madison St, Alexandria, VA",
    "2400 Eisenhower Ave, Alexandria, VA",
    "520 John Carlyle St, Alexandria, VA",
    "301 King St, Alexandria, VA",
    "1731 Duke St, Alexandria, VA",
    "2000 Jamieson Ave, Alexandria, VA",
    "6301 Stevenson Ave, Alexandria, VA",
    "1101 N Royal St, Alexandria, VA"
  ),
  call_type = c("Emergency", "Non-emergency", "Emergency", "Non-emergency", 
                "Emergency", "Non-emergency", "Emergency", "Non-emergency",
                "Emergency", "Non-emergency")
)

# Convert integer coordinates to decimal degrees
# For latitude: Divide by 1,000,000 and keep positive (Northern hemisphere)
# For longitude: Divide by 1,000,000 and make negative (Western hemisphere for Alexandria)
calls_with_coords <- calls_data %>%
  mutate(
    latitude = latitude_int / 1000000,
    longitude = -1 * (longitude_int / 1000000)  # Negative for western hemisphere
  )

# Create a color palette based on call type
call_types <- unique(calls_with_coords$call_type)
pal <- colorFactor(
  palette = c("red", "blue"),  # Emergency = red, Non-emergency = blue
  domain = call_types
)

# Create the map
alexandria_map <- leaflet(calls_with_coords) %>%
  # Add base map tiles
  addProviderTiles(providers$CartoDB.Positron) %>%
  # Set the view to center on Alexandria, VA
  setView(lng = -77.0469, lat = 38.8048, zoom = 13) %>%
  # Add markers for each call
  addCircleMarkers(
    ~longitude, ~latitude,
    color = ~pal(call_type),
    radius = 6,
    stroke = FALSE,
    fillOpacity = 0.7,
    popup = ~paste("<b>Call ID:</b>", call_id, "<br>",
                   "<b>Type:</b>", call_type, "<br>",
                   "<b>Address:</b>", address)
  ) %>%
  # Add a legend
  addLegend(
    position = "bottomright",
    pal = pal,
    values = ~call_type,
    title = "Call Type",
    opacity = 1
  ) %>%
  # Add a title
  addControl(
    html = "<h3>Emergency and Non-emergency Calls<br>Alexandria, VA</h3>",
    position = "topright"
  )

# Display the map
alexandria_map

# Save the map for inclusion in reports
saveWidget(alexandria_map, "alexandria_calls_map.html", selfcontained = TRUE)

# Optional: If you want to analyze call density by neighborhood or district
# This creates a clustered view that can help identify hotspots
cluster_map <- leaflet(calls_with_coords) %>%
  # Add base map tiles
  addProviderTiles(providers$CartoDB.Positron) %>%
  # Set the view to center on Alexandria, VA
  setView(lng = -77.0469, lat = 38.8048, zoom = 13) %>%
  # Add clustered markers
  addMarkers(
    ~longitude, ~latitude,
    popup = ~paste("<b>Call ID:</b>", call_id, "<br>",
                   "<b>Type:</b>", call_type, "<br>",
                   "<b>Address:</b>", address),
    clusterOptions = markerClusterOptions(),
    label = ~as.character(call_id)
  ) %>%
  # Add a title
  addControl(
    html = "<h3>Clustered Call Locations<br>Alexandria, VA</h3>",
    position = "topright"
  )

# Uncomment to save the cluster map
# saveWidget(cluster_map, "alexandria_calls_cluster_map.html", selfcontained = TRUE)
