import pandas as pd
from geopy.distance import distance
from shapely.geometry import LineString, Point
from pyproj import Transformer

from .recurring_trips import get_recurring_trips
from .friendships import parse_friendships

def geodesic(a, b):
    dist_miles = distance(a, b).miles
    return dist_miles

def get_utm_transformer(lat, lon):
    # get the appropriate UTM zone transformer for a given location
    utm_zone = int((lon + 180) / 6) + 1
    hemisphere = "north" if lat >= 0 else "south"
    epsg = 32600 + utm_zone if hemisphere == "north" else 32700 + utm_zone
    return Transformer.from_crs("EPSG:4326", f"EPSG:{epsg}", always_xy=True)

def project_and_create_polyline(route_points, transformer):
    route_proj = [transformer.transform(lon, lat) for lat, lon in route_points]
    return LineString(route_proj)

def get_pickup_begin_score(my_trip, other_trip, max_distance):
    # how close other trip's start is to my trip's start
    my_start = (my_trip['start_lat'], my_trip['start_lon'])
    other_start = (other_trip['start_lat'], other_trip['start_lon'])
    distance = geodesic(my_start, other_start)
    pickup_score = 1 - min(distance / max_distance, 1)
    return pickup_score

def get_pickup_enroute_score(my_route, other_trip, transformer, max_distance):
    # how close other trip's start is to any of my trip's route points
    METERS_TO_MILES = 0.000621371
    other_start = Point(transformer.transform(other_trip['start_lon'], other_trip['start_lat']))
    distance = other_start.distance(my_route) * METERS_TO_MILES
    pickup_score = 1 - min(distance / max_distance, 1)
    return pickup_score

def get_dropoff_end_score(my_trip, other_trip, max_distance):
    # how close other trip's end is to my trip's end
    my_end = (my_trip['end_lat'], my_trip['end_lon'])
    other_end = (other_trip['end_lat'], other_trip['end_lon'])
    distance = geodesic(my_end, other_end)
    dropoff_score = 1 - min(distance / max_distance, 1)
    return dropoff_score

def get_dropoff_enroute_score(my_route, other_trip, transformer, max_distance):
    # how close other trip's end is to any of my trip's route points
    METERS_TO_MILES = 0.000621371
    other_end = Point(transformer.transform(other_trip['end_lon'], other_trip['end_lat']))
    distance = other_end.distance(my_route) * METERS_TO_MILES
    dropoff_score = 1 - min(distance / max_distance, 1)
    return dropoff_score

def get_start_time_score(my_trip, other_trip, max_time_diff):
    time_diff = abs(my_trip['start_time'] - other_trip['start_time']).total_seconds() / 60
    time_score = 1 - min(time_diff / max_time_diff, 1)
    return time_score

def get_end_time_score(my_trip, other_trip, max_time_diff):
    time_diff = abs(my_trip['end_time'] - other_trip['end_time']).total_seconds() / 60
    time_score = 1 - min(time_diff / max_time_diff, 1)
    return time_score


def score_trips_for_user(user_id, trips, friendships, max_distance, max_time_diff, test=False, verbose=False):
    my_trips = trips[trips['user_id'] == user_id]
    my_recurring_trips = get_recurring_trips(my_trips)

    if my_recurring_trips.empty:
        print("No recurring trips found for user", user_id)
        return []

    my_friends = parse_friendships(friendships).get(user_id, set())
    friend_trips = [get_recurring_trips(trips[trips['user_id'] == friend]) for friend in my_friends]
    friend_trips = [df for df in friend_trips if not df.empty]
    other_recurring_trips = pd.concat(friend_trips) if friend_trips else pd.DataFrame()

    if other_recurring_trips.empty:
        print("No recurring trips found for friends of user", user_id)
        return []

    scores = []
    for _, my_trip in my_recurring_trips.iterrows():
        if verbose:
            print("Scoring trip:", my_trip['trip_id'])
            
        transformer = get_utm_transformer(my_trip['start_lat'], my_trip['start_lon'])
        my_route = project_and_create_polyline(my_trip['route_points'], transformer)

        for i, other_trip in other_recurring_trips.iterrows():
            pickup_begin_score = get_pickup_begin_score(my_trip, other_trip, max_distance)
            dropoff_end_score = get_dropoff_end_score(my_trip, other_trip, max_distance)
            
            pickup_enroute_score = get_pickup_enroute_score(my_route, other_trip, transformer, max_distance)
            if pickup_begin_score == 0 and pickup_enroute_score == 0:
                # no good pickup options, so skip this trip
                continue
            dropoff_enroute_score = get_dropoff_enroute_score(my_route, other_trip, transformer, max_distance)
            if dropoff_end_score == 0 and dropoff_enroute_score == 0:
                # no good dropoff options, so skip this trip
                continue

            start_time_score = get_start_time_score(my_trip, other_trip, max_time_diff)
            end_time_score = get_end_time_score(my_trip, other_trip, max_time_diff)

            # can pickup and dropoff at end, or pickup enroute and dropoff at end, or pickup at beginning and dropoff enroute, or pickup and dropoff enroute
            # time alignment should match with pickup/dropoff alignment - if pickup is enroute, then start time should be less important, if dropoff is enroute, then end time should be less important
            route_score = max(pickup_begin_score + dropoff_end_score + 0.5*start_time_score + 0.5*end_time_score,
                              pickup_enroute_score + dropoff_end_score + 0.25*start_time_score + 0.75*end_time_score,
                              pickup_begin_score + dropoff_enroute_score + 0.75*start_time_score + 0.25*end_time_score,
                              pickup_enroute_score + dropoff_enroute_score + 0.5*start_time_score + 0.5*end_time_score)

            
            total_score = route_score / 3
            scores.append({
                'user_id': user_id,
                'other_user': other_trip['user_id'],
                'my_trip': my_trip['trip_id'],
                'other_trip': other_trip['trip_id'],
                'score': round(total_score, 6)
            })

        if test:
            break
    
    scores.sort(key=lambda x: x['score'], reverse=True)
    return scores