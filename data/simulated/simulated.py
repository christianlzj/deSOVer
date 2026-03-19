import random
import math
import pandas as pd
from datetime import datetime, timedelta

# -------------------- Configuration --------------------
NUM_USERS = 35                 # Number of synthetic users
NUM_DAYS = 28                   # Simulation period (days)
START_DATE = datetime(2025, 1, 1)  # Arbitrary start date

# Atlanta bounding box (approx)
ATL_BBOX = {
    'min_lat': 33.6, 'max_lat': 34.0,
    'min_lon': -84.6, 'max_lon': -84.2
}

# Neighborhood centers for realistic clustering
HOME_CENTERS = [
    (33.785, -84.383, 'Midtown'),
    (33.839, -84.379, 'Buckhead'),
    (33.775, -84.296, 'Decatur'),
    (33.884, -84.468, 'Smyrna'),
    (33.750, -84.390, 'Castleberry Hill'),
    (33.660, -84.450, 'East Point'),
    (33.715, -84.390, 'Grant Park'),
    (33.890, -84.300, 'Dunwoody'),
]

WORK_CENTERS = [
    (33.754, -84.390, 'Downtown'),
    (33.785, -84.383, 'Midtown'),
    (33.921, -84.366, 'Perimeter'),
    (33.849, -84.375, 'Lenox'),
    (33.760, -84.390, 'Georgia Tech'),
    (33.775, -84.400, 'West Midtown'),
]

# Speed and distance assumptions
AVG_SPEED_MPH = 30          # Average speed in city
ROAD_FACTOR = 1.3           # Great‑circle to road distance factor

# -------------------- Utility Functions --------------------
def haversine(coord1, coord2):
    """Great‑circle distance between two (lat, lon) points in km."""
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(dlon/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def random_point_near(center, radius_km=2.0):
    """Generate random (lat, lon) within radius_km of center."""
    # Approx 1 deg latitude = 111 km
    rad_deg = radius_km / 111.0
    lat = center[0] + random.uniform(-rad_deg, rad_deg)
    lon = center[1] + random.uniform(-rad_deg, rad_deg)
    return (lat, lon)

def random_atlanta_point():
    """Uniform random point within Atlanta bounding box."""
    lat = random.uniform(ATL_BBOX['min_lat'], ATL_BBOX['max_lat'])
    lon = random.uniform(ATL_BBOX['min_lon'], ATL_BBOX['max_lon'])
    return (lat, lon)

def generate_route_points(start, end, num_points=10):
    """Generate GPS‑like points along a straight line with noise."""
    lat1, lon1 = start
    lat2, lon2 = end
    points = []
    for i in range(num_points):
        frac = i / (num_points - 1)
        lat = lat1 + frac * (lat2 - lat1)
        lon = lon1 + frac * (lon2 - lon1)
        # Add small random noise (approx 50‑100 meters)
        lat += random.uniform(-0.001, 0.001)
        lon += random.uniform(-0.001, 0.001)
        points.append((lat, lon))
    return points

# -------------------- Generate Users --------------------
print("Generating users...")
users = []
for uid in range(NUM_USERS):
    # Choose home and work from weighted centers (simplified: random)
    home_center = random.choice(HOME_CENTERS)[:2]
    work_center = random.choice(WORK_CENTERS)[:2]
    home = random_point_near(home_center, radius_km=2.5)
    work = random_point_near(work_center, radius_km=2.5)
    users.append({
        'user_id': uid,
        'name': f'User_{uid}',
        'home_lat': home[0],
        'home_lon': home[1],
        'work_lat': work[0],
        'work_lon': work[1]
    })
df_users = pd.DataFrame(users)

# -------------------- Generate Friendships --------------------
print("Generating friendships...")
friendships = []
# Probability of friendship based on home distance (closer = more likely)
def friendship_prob(uid1, uid2):
    home1 = (users[uid1]['home_lat'], users[uid1]['home_lon'])
    home2 = (users[uid2]['home_lat'], users[uid2]['home_lon'])
    dist_km = haversine(home1, home2)
    # Decay: 0.3 if very close, 0.02 if far
    prob = max(0.02, 0.3 * math.exp(-dist_km / 10))
    return prob

for i in range(NUM_USERS):
    for j in range(i+1, NUM_USERS):
        if random.random() < friendship_prob(i, j):
            friendships.append({'user_id_1': i, 'user_id_2': j})
df_friends = pd.DataFrame(friendships)

# -------------------- Generate Trips --------------------
print("Generating trips...")
trips = []
trip_id = 0

# Helper: compute travel time from distance (km)
def travel_time_minutes(dist_km):
    miles = dist_km * 0.621371
    return miles / AVG_SPEED_MPH * 60

# Store current location for each user (to maintain continuity)
current_location = {user['user_id']: (user['home_lat'], user['home_lon']) for user in users}

# For each day
for day in range(NUM_DAYS):
    current_date = START_DATE + timedelta(days=day)
    weekday = current_date.weekday()  # Mon=0 .. Sun=6
    is_weekday = weekday < 5

    for user in users:
        uid = user['user_id']
        home = (user['home_lat'], user['home_lon'])
        work = (user['work_lat'], user['work_lon'])

        # Ensure we start the day at home (if last night's location is not home, we'd need a trip, but simulation will handle continuity)
        # To simplify, we assume each day starts at home. In reality, people might stay at friends, but for prototype it's fine.
        # We'll enforce that at the beginning of each day, the user is at home.
        # However, to maintain continuity, we should set current_location[uid] to home at day start if needed.
        # Actually, let's keep continuity from previous day's last trip, but we need to know if they end at home.
        # For simplicity, we'll reset to home at start of each day and not model overnight stays elsewhere.
        # This is acceptable for a prototype.
        current_location[uid] = home

        if is_weekday:
            # --- Morning commute (home -> work) ---
            # Random departure between 7:00 and 9:00
            leave_min = random.randint(420, 540)
            start_time = current_date.replace(hour=0, minute=0) + timedelta(minutes=leave_min)
            dist_km = haversine(current_location[uid], work) * ROAD_FACTOR
            duration_min = travel_time_minutes(dist_km) + random.uniform(-5, 15)
            end_time = start_time + timedelta(minutes=duration_min)
            trips.append({
                'trip_id': trip_id,
                'user_id': uid,
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'start_lat': current_location[uid][0],
                'start_lon': current_location[uid][1],
                'end_lat': work[0],
                'end_lon': work[1],
                'distance_miles': dist_km * 0.621371,
                'purpose': 'commute',
                'route_points': str(generate_route_points(current_location[uid], work))
            })
            trip_id += 1
            current_location[uid] = work

            # --- Optional errand on the way home (e.g., grocery) ---
            errand_prob = 0.3   # 30% of days have an errand
            if random.random() < errand_prob:
                # Errand location: somewhere between work and home (random)
                # For simplicity, pick a random point in Atlanta
                errand_dest = random_atlanta_point()
                dist_km = haversine(current_location[uid], errand_dest) * ROAD_FACTOR
                # Errand trip start: random time after work (4:30‑6:30)
                leave_work_min = random.randint(990, 1110)  # 4:30‑6:30 pm
                start_time = current_date.replace(hour=0, minute=0) + timedelta(minutes=leave_work_min)
                duration_min = travel_time_minutes(dist_km) + random.uniform(-5, 15)
                end_time = start_time + timedelta(minutes=duration_min)
                trips.append({
                    'trip_id': trip_id,
                    'user_id': uid,
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'start_lat': current_location[uid][0],
                    'start_lon': current_location[uid][1],
                    'end_lat': errand_dest[0],
                    'end_lon': errand_dest[1],
                    'distance_miles': dist_km * 0.621371,
                    'purpose': 'errand',
                    'route_points': str(generate_route_points(current_location[uid], errand_dest))
                })
                trip_id += 1
                current_location[uid] = errand_dest

                # Then from errand to home
                dist_km = haversine(current_location[uid], home) * ROAD_FACTOR
                # Start after previous errand end
                start_time = end_time  # use last trip's end_time
                duration_min = travel_time_minutes(dist_km) + random.uniform(-5, 15)
                end_time = start_time + timedelta(minutes=duration_min)
                trips.append({
                    'trip_id': trip_id,
                    'user_id': uid,
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'start_lat': current_location[uid][0],
                    'start_lon': current_location[uid][1],
                    'end_lat': home[0],
                    'end_lon': home[1],
                    'distance_miles': dist_km * 0.621371,
                    'purpose': 'commute',
                    'route_points': str(generate_route_points(current_location[uid], home))
                })
                trip_id += 1
                current_location[uid] = home

            else:
                # Direct commute home
                leave_work_min = random.randint(990, 1110)
                start_time = current_date.replace(hour=0, minute=0) + timedelta(minutes=leave_work_min)
                dist_km = haversine(current_location[uid], home) * ROAD_FACTOR
                duration_min = travel_time_minutes(dist_km) + random.uniform(-5, 15)
                end_time = start_time + timedelta(minutes=duration_min)
                trips.append({
                    'trip_id': trip_id,
                    'user_id': uid,
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'start_lat': current_location[uid][0],
                    'start_lon': current_location[uid][1],
                    'end_lat': home[0],
                    'end_lon': home[1],
                    'distance_miles': dist_km * 0.621371,
                    'purpose': 'commute',
                    'route_points': str(generate_route_points(current_location[uid], home))
                })
                trip_id += 1
                current_location[uid] = home

        else:   # Weekend
            # 1‑3 random trips during the day (e.g., shopping, leisure)
            num_trips = random.randint(1, 3)
            for t in range(num_trips):
                # Destination: random within Atlanta (could be a friend's home, store, etc.)
                dest = random_atlanta_point()
                # Ensure trip distance > 1 km to avoid pointless tiny trips
                dist_km = haversine(current_location[uid], dest) * ROAD_FACTOR
                if dist_km < 1.5:
                    continue
                # Random start time between 9am and 8pm
                start_min = random.randint(540, 1200)
                start_time = current_date.replace(hour=0, minute=0) + timedelta(minutes=start_min)
                duration_min = travel_time_minutes(dist_km) + random.uniform(-5, 15)
                end_time = start_time + timedelta(minutes=duration_min)
                trips.append({
                    'trip_id': trip_id,
                    'user_id': uid,
                    'start_time': start_time.isoformat(),
                    'end_time': end_time.isoformat(),
                    'start_lat': current_location[uid][0],
                    'start_lon': current_location[uid][1],
                    'end_lat': dest[0],
                    'end_lon': dest[1],
                    'distance_miles': dist_km * 0.621371,
                    'purpose': 'leisure',
                    'route_points': str(generate_route_points(current_location[uid], dest))
                })
                trip_id += 1
                current_location[uid] = dest

print(f"Generated {len(trips)} trips.")

# Convert trips to DataFrame
df_trips = pd.DataFrame(trips)

# -------------------- Create Overlaps for Testing --------------------
print("Adjusting data to create guaranteed overlaps...")
# Pick a cluster of 5 users to have similar home/work locations and be friends
cluster_home_center = (33.785, -84.383)  # Midtown
cluster_work_center = (33.754, -84.390)  # Downtown
cluster_size = 5
cluster_users = random.sample(range(NUM_USERS), cluster_size)

# Adjust their home and work
for i, uid in enumerate(cluster_users):
    # Slight variation within 500m
    home = random_point_near(cluster_home_center, radius_km=0.5)
    work = random_point_near(cluster_work_center, radius_km=0.5)
    df_users.loc[df_users.user_id == uid, ['home_lat', 'home_lon']] = home[0], home[1]
    df_users.loc[df_users.user_id == uid, ['work_lat', 'work_lon']] = work[0], work[1]

# Ensure they are all friends with each other
for i in range(cluster_size):
    for j in range(i+1, cluster_size):
        u1 = cluster_users[i]
        u2 = cluster_users[j]
        # Check if friendship exists, if not add
        if not ((df_friends.user_id_1 == u1) & (df_friends.user_id_2 == u2)).any() and not ((df_friends.user_id_1 == u2) & (df_friends.user_id_2 == u1)).any():
            df_friends = pd.concat([df_friends, pd.DataFrame([{'user_id_1': u1, 'user_id_2': u2}])], ignore_index=True)

# Also adjust their trips? Too complicated; we'll rely on the fact that their home/work are now close.
# The matching algorithm should find overlaps.

# -------------------- Export --------------------
df_users.to_csv('users.csv', index=False)
df_friends.to_csv('friendships.csv', index=False)
df_trips.to_csv('trips.csv', index=False)

print("Done. Files saved: users.csv, friendships.csv, trips.csv")