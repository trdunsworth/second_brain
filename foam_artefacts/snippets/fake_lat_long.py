from faker import Faker

def generate_bounded_fake_location_data(num_records, locale, lat_min, lat_max, lon_min, lon_max, precision=6):
    """
    Generates a list of dictionaries with a fake address and
    latitude/longitude pairs that are guaranteed to be within specified
    geographic boundaries. The address and coordinates are NOT
    geographically validated to each other in the real world.

    Args:
        num_records (int): The number of location records to generate.
        locale (str): The Faker locale to use (e.g., 'en_US', 'fr_FR').
        lat_min (float): The minimum latitude for the bounding box.
        lat_max (float): The maximum latitude for the bounding box.
        lon_min (float): The minimum longitude for the bounding box.
        lon_max (float): The maximum longitude for the bounding box.
        precision (int): The number of decimal points of precision for the coordinates.

    Returns:
        list: A list of dictionaries with 'address', 'latitude', and 'longitude' keys.
    """
    fake = Faker(locale)
    synthetic_data = []

    for _ in range(num_records):
        # Generate a fake address based on the chosen locale.
        # This address is plausible but not necessarily a real address.
        address = fake.address()

        # Generate latitude and longitude within the specified boundaries.
        # These coordinates are independent of the generated address's
        # real-world geographic existence. They are simply random points
        # within the defined box.
        latitude = float(fake.latitude(min=lat_min, max=lat_max, precision=precision))
        longitude = float(fake.longitude(min=lon_min, max=lon_max, precision=precision))

        synthetic_data.append({
            "address": address,
            "latitude": latitude,
            "longitude": longitude
        })
    return synthetic_data

# Example Usage:
if __name__ == "__main__":
    # Approximate bounding box coordinates for Tappahannock, Virginia, US.
    # You would typically find these using an online tool (e.g., "bounding box generator map")
    # or a map service for your desired geographic area.
    tappahannock_lat_min = 37.91
    tappahannock_lat_max = 37.94
    tappahannock_lon_min = -76.87
    tappahannock_lon_max = -76.84

    num_records_to_generate = 5
    synthetic_records = generate_bounded_fake_location_data(
        num_records_to_generate,
        locale='en_US', # Use a US locale for plausible US addresses
        lat_min=tappahannock_lat_min,
        lat_max=tappahannock_lat_max,
        lon_min=tappahannock_lon_min,
        lon_max=tappahannock_lon_max,
        precision=6 # Standard precision for coordinates
    )

    print(f"--- Generating {num_records_to_generate} synthetic records for Tappahannock area ---")
    for record in synthetic_records:
        print(f"Address: {record['address']}")
        print(f"  Latitude: {record['latitude']}, Longitude: {record['longitude']}")
        print("-" * 30)

    print("\n--- Example with a different number of records and precision ---")
    num_records_large = 10
    synthetic_records_large = generate_bounded_fake_location_data(
        num_records_large,
        locale='en_US',
        lat_min=tappahannock_lat_min,
        lat_max=tappahannock_lat_max,
        lon_min=tappahannock_lon_min,
        lon_max=tappahannock_lon_max,
        precision=5 # Slightly less precision
    )

    for record in synthetic_records_large:
        print(f"Address: {record['address']}")
        print(f"  Latitude: {record['latitude']}, Longitude: {record['longitude']}")
        print("-" * 30)
