import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN

def get_location_clusters(trips, buffer_miles: int = 1, min_samples: int = 2) -> pd.DataFrame:
    trips = trips.copy()
    for col, lat_col, lon_col in [
        ('start_cluster', 'start_lat', 'start_lon'),
        ('end_cluster', 'end_lat', 'end_lon')
    ]:
        coords = trips[[lat_col, lon_col]].values
        coords_rad = np.radians(coords)
        
        # eps in radians: buffer_miles / earth_radius
        eps = buffer_miles / 3958.8
        
        labels = DBSCAN(eps=eps, min_samples=min_samples, algorithm='ball_tree', metric='haversine').fit_predict(coords_rad)
        trips[col] = labels
    
    return trips

def get_recurring_trips(trips, min_occurrences=2):
    trips = get_location_clusters(trips)

    # drop trips where either endpoint was an outlier
    trips = trips[
        (trips['start_cluster'] != -1) &
        (trips['end_cluster'] != -1)
    ]

    # count occurrences of each OD cluster pair
    od_counts = (
        trips
        .groupby(['start_cluster', 'end_cluster'])
        .size()
        .reset_index(name='occurrences')
    )

    recurring_od = od_counts[od_counts['occurrences'] >= min_occurrences][['start_cluster', 'end_cluster', 'occurrences']]

    return trips.merge(recurring_od, on=['start_cluster', 'end_cluster'], how='inner')