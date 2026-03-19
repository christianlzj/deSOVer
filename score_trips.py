import pandas as pd
import ast
from utils.matching_trips import score_trips_for_user

MAX_DISTANCE = 2 # miles
MAX_TIME_DIFF = 30 # minutes

DATA_PATH = 'data/simulated'
TRIPS_PATH = f'{DATA_PATH}/trips.csv'
USERS_PATH = f'{DATA_PATH}/users.csv'
FRIENDS_PATH = f'{DATA_PATH}/friendships.csv'

def load_data():
    trips = pd.read_csv(TRIPS_PATH)
    users = pd.read_csv(USERS_PATH)
    friendships = pd.read_csv(FRIENDS_PATH)

    print(f'Loaded {len(trips):,} trips across {trips["user_id"].nunique()} users')
    print(f'Loaded {len(users)} user profiles')
    print(f'Loaded {len(friendships)} friendship edges')

    return trips, users, friendships

def preprocess_trips(trips):
    #type conversion
    trips = trips.copy()
    trips['start_time'] = pd.to_datetime(trips['start_time'], format='mixed')
    trips['end_time'] = pd.to_datetime(trips['end_time'], format='mixed')
    if isinstance(trips['route_points'].iloc[0], str):
        trips['route_points'] = trips['route_points'].apply(ast.literal_eval)
    
    # feature engineering for recurring trip detection
    trips['time_bucket'] = trips['start_time'].dt.floor('30min').dt.time
    trips['day_of_week'] = trips['start_time'].dt.dayofweek
    return trips

def score_all_trips(trips, friendships):
    scores_dict = {}
    for user_id in trips['user_id'].unique():
        user_id = int(user_id)
        print(f"Scoring trips for user {user_id}...")
        scores_dict[user_id] = score_trips_for_user(user_id, trips, friendships, max_distance=MAX_DISTANCE, max_time_diff=MAX_TIME_DIFF)

    all_matches = [s for scores in scores_dict.values() for s in scores if s['score'] > 0]
    scores_df = pd.DataFrame(all_matches)
    return scores_df

if __name__ == "__main__":
    trips, users, friendships = load_data()
    trips = preprocess_trips(trips)
    scores = score_all_trips(trips, friendships)
    print(f"Found {len(scores)} matches between recurring trips of friends")
    print(scores.sort_values('score', ascending=False).head())