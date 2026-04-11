import psycopg2
from fastapi import FastAPI
from datetime import datetime, timedelta, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import json
from decimal import Decimal
from fastapi.middleware.cors import CORSMiddleware


# ---------- Database Configuration ----------
# DB_HOST = "db.fdcwkvaivhrokkotmzwf.supabase.co" # IPv6 host
DB_HOST = "aws-1-us-east-2.pooler.supabase.com"
DB_NAME = "postgres"
# DB_USER = "postgres" # IPv6 user
DB_USER = "postgres.fdcwkvaivhrokkotmzwf"
DB_PASSWORD = "CS8803desover"
DB_PORT = 5432

def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )

# ---------- Helper: convert Decimal to float safely ----------
def to_float(val):
    if val is None:
        return 0.0
    if isinstance(val, Decimal):
        return float(val)
    return float(val)

# ---------- Pydantic Models ----------
class WeeklySummary(BaseModel):
    week_start: date
    week_end: date
    total_trips: int
    mode_share: Dict[str, int]
    total_co2_lbs: float
    potential_co2_reduction_lbs: float

class Match(BaseModel):
    friend_name: str
    friend_id: int
    days: List[str]
    score: float

class Recommendation(BaseModel):
    type: str
    id: int
    route: Dict[str, Dict[str, float]]
    suggested_departure: str
    days: List[str]
    co2_saved_lbs: float
    fuel_saved_dollars: Optional[float] = None
    matches: Optional[List[Match]] = None
    transit_details: Optional[Dict[str, Any]] = None

class Sprout(BaseModel):
    score: int
    message: str

class User(BaseModel):
    user_id: int
    user_name: str

class CreateUserRequest(BaseModel):
    user_name: str
    home_lat: float
    home_lon: float
    work_lat: float
    work_lon: float

class Message(BaseModel):
    message_id: int
    sender_id: int
    sender_name: str
    recipient_id: int
    content: str
    created_at: str
    read: bool

class SendMessageRequest(BaseModel):
    recipient_id: int
    content: str

class Conversation(BaseModel):
    friend_id: int
    friend_name: str
    last_message: str
    last_message_time: str
    unread_count: int
    is_sender: bool

# ---------- Helper Functions ----------
def fetch_user_weekly_trips(user_id: int, week_start: date, week_end: date):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT trip_mode, distance_miles
                FROM trips
                WHERE user_id = %s
                  AND start_time >= %s
                  AND start_time < %s
            """, (user_id, week_start, week_end + timedelta(days=1)))
            return cur.fetchall()
    finally:
        conn.close()

def fetch_user_recommendations(user_id: int, limit: int = 10):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT r.recommendation_id, r.mode, r.friend_user_id, r.friend_routine_id,
                       r.routine_id, r.match_score, r.co2_saved_kg, r.details,
                       u.user_name as friend_name
                FROM recommendations r
                LEFT JOIN users u ON r.friend_user_id = u.user_id
                WHERE r.user_id = %s
                ORDER BY r.match_score DESC
                LIMIT %s
            """, (user_id, limit))
            rows = cur.fetchall()
            columns = ['recommendation_id', 'mode', 'friend_user_id', 'friend_routine_id',
                       'routine_id', 'match_score', 'co2_saved_kg', 'details', 'friend_name']
            # Convert Decimal to float for co2_saved_kg and match_score
            result = []
            for row in rows:
                d = dict(zip(columns, row))
                if d['co2_saved_kg'] is not None:
                    d['co2_saved_kg'] = float(d['co2_saved_kg'])
                if d['match_score'] is not None:
                    d['match_score'] = float(d['match_score'])
                result.append(d)
            return result
    finally:
        conn.close()

def fetch_routine_info(routine_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT origin_lat, origin_lon, destination_lat, destination_lon,
                       days_of_week, time_window_start
                FROM routines
                WHERE routine_id = %s
            """, (routine_id,))
            row = cur.fetchone()
            if not row:
                return None
            return {
                'origin_lat': float(row[0]),
                'origin_lon': float(row[1]),
                'destination_lat': float(row[2]),
                'destination_lon': float(row[3]),
                'days_of_week': row[4],
                'time_window_start': row[5]
            }
    finally:
        conn.close()

def get_days_of_week(day_str: str) -> List[str]:
    if not day_str:
        return []
    day_map = {
        'MON': 'Monday', 'TUE': 'Tuesday', 'WED': 'Wednesday',
        'THU': 'Thursday', 'FRI': 'Friday', 'SAT': 'Saturday', 'SUN': 'Sunday'
    }
    return [day_map.get(d, d) for d in day_str.split(',') if d in day_map]

def get_departure_time_from_routine(time_window_start):
    if not time_window_start:
        return "8:00 AM"
    try:
        # time_window_start is a datetime.time object
        if isinstance(time_window_start, datetime):
            dt = time_window_start
        else:
            # It might be a string like '08:00:00'
            dt = datetime.strptime(str(time_window_start), '%H:%M:%S')
        return dt.strftime('%-I:%M %p').lstrip('0')
    except:
        return str(time_window_start)

# ---------- API Endpoints ----------
app = FastAPI(title="DeSOVer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/users", response_model=User)
def create_user(request: CreateUserRequest):
    """Create a new user with auto-generated ID"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Get next user_id
            cur.execute("SELECT MAX(user_id) FROM users")
            max_id = cur.fetchone()[0]
            new_user_id = (max_id or 0) + 1
            
            # Insert new user
            cur.execute("""
                INSERT INTO users (user_id, user_name, home_lat, home_lon, work_lat, work_lon, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                RETURNING user_id, user_name
            """, (new_user_id, request.user_name, request.home_lat, request.home_lon, request.work_lat, request.work_lon))
            row = cur.fetchone()
            conn.commit()
            return {"user_id": row[0], "user_name": row[1]}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id, user_name FROM users WHERE user_id = %s", (user_id,))
            row = cur.fetchone()
            if row:
                return {"user_id": row[0], "user_name": row[1]}
            else:
                return {"user_id": user_id, "user_name": f"User {user_id}"}
    finally:
        conn.close()

@app.get("/users/{user_id}/weekly-summary", response_model=WeeklySummary)
def weekly_summary(user_id: int, week_start: Optional[date] = None, week_end: Optional[date] = None):
    if week_start is None:
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
    if week_end is None:
        week_end = datetime.now().date()

    trips = fetch_user_weekly_trips(user_id, week_start, week_end)

    total_trips = len(trips)
    mode_counts = {"sov": 0, "carpool": 0, "transit": 0}
    total_co2_lbs = 0.0
    CO2_PER_MILE_LB = 0.891
    for t in trips:
        mode = t[0] or 'sov'
        mode_counts[mode] += 1
        miles = t[1] or 0
        total_co2_lbs += miles * CO2_PER_MILE_LB

    total = total_trips or 1
    mode_share = {
        "sov": round(mode_counts['sov'] / total * 100),
        "carpool": round(mode_counts['carpool'] / total * 100),
        "transit": round(mode_counts['transit'] / total * 100)
    }

    recs = fetch_user_recommendations(user_id, 5)
    potential_reduction = sum((r['co2_saved_kg'] or 0) * 2.205 for r in recs)

    return WeeklySummary(
        week_start=week_start,
        week_end=week_end,
        total_trips=total_trips,
        mode_share=mode_share,
        total_co2_lbs=round(total_co2_lbs, 1),
        potential_co2_reduction_lbs=round(potential_reduction, 1)
    )

@app.get("/users/{user_id}/recommendations")
def get_recommendations(user_id: int, limit: int = 10):
    recs = fetch_user_recommendations(user_id, limit)

    carpool_groups = {}
    transit_items = []

    for r in recs:
        if r['mode'] == 'carpool':
            key = r['routine_id']
            if key not in carpool_groups:
                # Convert details if it's a string, else use directly
                details = r['details']
                if isinstance(details, str):
                    details = json.loads(details) if details else {}
                else:
                    details = details or {}
                carpool_groups[key] = {
                    'recommendation_id': r['recommendation_id'],
                    'co2_saved_kg': r['co2_saved_kg'],
                    'matches': [],
                    'details': details
                }
            carpool_groups[key]['matches'].append({
                'friend_name': r['friend_name'],
                'friend_id': r['friend_user_id'],
                'score': r['match_score']
            })
        else:  # transit
            details = r['details']
            if isinstance(details, str):
                details = json.loads(details) if details else {}
            else:
                details = details or {}
            transit_items.append({
                'recommendation_id': r['recommendation_id'],
                'routine_id': r['routine_id'],
                'co2_saved_kg': r['co2_saved_kg'],
                'details': details
            })

    final_recommendations = []

    # Process carpool groups
    for routine_id, group in carpool_groups.items():
        routine_info = fetch_routine_info(routine_id)
        if not routine_info:
            continue
        days_of_week = get_days_of_week(routine_info['days_of_week'])
        suggested_departure = get_departure_time_from_routine(routine_info['time_window_start'])
        co2_saved_lbs = (group['co2_saved_kg'] or 0) * 2.205
        fuel_saved_dollars = round(co2_saved_lbs * 0.01, 2)

        route = {
            "origin": {"lat": routine_info['origin_lat'], "lon": routine_info['origin_lon']},
            "destination": {"lat": routine_info['destination_lat'], "lon": routine_info['destination_lon']}
        }

        matches = [
            Match(
                friend_name=m['friend_name'],
                friend_id=m['friend_id'],
                days=days_of_week,
                score=m['score']
            ) for m in group['matches']
        ]

        final_recommendations.append({
            'type': 'carpool',
            'id': group['recommendation_id'],
            'route': route,
            'suggested_departure': suggested_departure,
            'days': days_of_week,
            'co2_saved_lbs': round(co2_saved_lbs, 1),
            'fuel_saved_dollars': fuel_saved_dollars,
            'matches': matches
        })

    # Process transit items
    for item in transit_items:
        routine_info = fetch_routine_info(item['routine_id'])
        if not routine_info:
            route = {"origin": {"lat": 0, "lon": 0}, "destination": {"lat": 0, "lon": 0}}
        else:
            route = {
                "origin": {"lat": routine_info['origin_lat'], "lon": routine_info['origin_lon']},
                "destination": {"lat": routine_info['destination_lat'], "lon": routine_info['destination_lon']}
            }
        co2_saved_lbs = (item['co2_saved_kg'] or 0) * 2.205
        details = item['details']

        final_recommendations.append({
            'type': 'transit',
            'id': item['recommendation_id'],
            'route': route,
            'suggested_departure': details.get('departure_time', ''),
            'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],  # could be refined
            'co2_saved_lbs': round(co2_saved_lbs, 1),
            'transit_details': {
                'route_short_name': details.get('route_short_name', ''),
                'route_long_name': details.get('route_long_name', ''),
                'board_stop': details.get('board_stop_name', ''),
                'alight_stop': details.get('alight_stop_name', ''),
                'departure_time': details.get('departure_time', ''),
                'arrival_time': details.get('arrival_time', ''),
                'walk_to_stop_min': details.get('walk_to_stop_min', 0),
                'ride_min': details.get('ride_min', 0),
                'walk_from_stop_min': details.get('walk_from_stop_min', 0),
                'total_min': details.get('total_min', 0)
            }
        })

    return {"recommendations": final_recommendations}

@app.get("/users/{user_id}/sprout", response_model=Sprout)
def get_sprout(user_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT trip_mode, COUNT(*) as cnt
                FROM trips
                WHERE user_id = %s
                GROUP BY trip_mode
            """, (user_id,))
            rows = cur.fetchall()
            totals = {row[0]: row[1] for row in rows}
            sov = totals.get('sov', 0)
            carpool = totals.get('carpool', 0)
            transit = totals.get('transit', 0)
            total = sov + carpool + transit
            if total == 0:
                score = 0
            else:
                score = round((carpool + transit) / total * 100)

            if score >= 80:
                message = "Awesome! You're a sustainable commuting champion!"
            elif score >= 50:
                message = "Great progress! Keep it up!"
            elif score >= 25:
                message = "Sprout is growing! Reduce a few more SOV trips to bloom."
            else:
                message = "Sprout needs water! Try carpooling or transit to help it grow."

            return Sprout(score=score, message=message)
    finally:
        conn.close()

##########################################################
## I just added leaderboard endpoint just for the sake of easier querying
## Feel free to combine or delete it if you think this is not necessary
############################################################
@app.get("/users/{user_id}/leaderboard")
def get_leaderboard(user_id: int):
    """Return the user and their friends ranked by sustainability score."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Get friend IDs
            cur.execute("""
                SELECT 
                    CASE 
                        WHEN user_id_1 = %s THEN user_id_2
                        ELSE user_id_1
                    END AS friend_id
                FROM friendships
                WHERE (user_id_1 = %s OR user_id_2 = %s)
                  AND status = 'accepted'
            """, (user_id, user_id, user_id))
            friend_ids = [row[0] for row in cur.fetchall()]

            # Include the current user in the ranking
            all_ids = [user_id] + friend_ids
            if not all_ids:
                return {"user_id": user_id, "leaderboard": []}

            # Get trip-mode counts for all users at once
            cur.execute("""
                SELECT user_id, trip_mode, COUNT(*) as cnt
                FROM trips
                WHERE user_id = ANY(%s)
                GROUP BY user_id, trip_mode
            """, (all_ids,))
            mode_rows = cur.fetchall()

            # Get user names
            cur.execute("SELECT user_id, user_name FROM users WHERE user_id = ANY(%s)", (all_ids,))
            name_map = {row[0]: row[1] for row in cur.fetchall()}

            # Calculate scores per user
            user_modes = {}
            for uid, mode, cnt in mode_rows:
                if uid not in user_modes:
                    user_modes[uid] = {"sov": 0, "carpool": 0, "transit": 0}
                normalized = mode if mode in ("sov", "carpool", "transit") else "sov"
                user_modes[uid][normalized] += cnt

            results = []
            for uid in all_ids:
                modes = user_modes.get(uid, {"sov": 0, "carpool": 0, "transit": 0})
                total = modes["sov"] + modes["carpool"] + modes["transit"]
                if total == 0:
                    score = 0
                else:
                    score = round((modes["carpool"] + modes["transit"]) / total * 100)
                results.append({
                    "user_id": uid,
                    "user_name": name_map.get(uid, f"User {uid}"),
                    "score": score,
                    "total_trips": total,
                    "carpool_trips": modes["carpool"],
                    "transit_trips": modes["transit"],
                    "sov_trips": modes["sov"],
                })

            # Sort by score descending, then by total_trips descending as tiebreak
            results.sort(key=lambda x: (-x["score"], -x["total_trips"]))

            return {"user_id": user_id, "leaderboard": results}
    finally:
        conn.close()

@app.get("/users/{user_id}/friends")
def get_friends(user_id: int):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Assuming friendships table stores bidirectional relationships with user_id_1 and user_id_2
            cur.execute("""
                SELECT 
                    CASE 
                        WHEN user_id_1 = %s THEN user_id_2
                        ELSE user_id_1
                    END AS friend_id
                FROM friendships
                WHERE (user_id_1 = %s OR user_id_2 = %s)
                  AND status = 'accepted'
            """, (user_id, user_id, user_id))
            rows = cur.fetchall()
            friend_ids = [row[0] for row in rows]
            
            # Optionally fetch friend names
            if friend_ids:
                cur.execute("SELECT user_id, user_name FROM users WHERE user_id = ANY(%s)", (friend_ids,))
                friends = [{"user_id": row[0], "user_name": row[1]} for row in cur.fetchall()]
            else:
                friends = []
            return {"user_id": user_id, "friends": friends}
    finally:
        conn.close()

@app.get("/users/{user_id}/inbox")
def get_inbox(user_id: int):
    """Get list of conversations with unread counts and last message"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Get all conversations (both sent and received messages)
            cur.execute("""
                SELECT DISTINCT 
                    CASE 
                        WHEN sender_id = %s THEN recipient_id
                        ELSE sender_id
                    END AS friend_id,
                    u.user_name as friend_name
                FROM messages
                LEFT JOIN users u ON u.user_id = (
                    CASE 
                        WHEN sender_id = %s THEN recipient_id
                        ELSE sender_id
                    END
                )
                WHERE sender_id = %s OR recipient_id = %s
                ORDER BY friend_id
            """, (user_id, user_id, user_id, user_id))
            
            conversations = []
            for row in cur.fetchall():
                friend_id = row[0]
                friend_name = row[1]
                
                # Get last message
                cur.execute("""
                    SELECT content, created_at, sender_id
                    FROM messages
                    WHERE (sender_id = %s AND recipient_id = %s) 
                       OR (sender_id = %s AND recipient_id = %s)
                    ORDER BY created_at DESC
                    LIMIT 1
                """, (user_id, friend_id, friend_id, user_id))
                last_msg = cur.fetchone()
                
                # Get unread count
                cur.execute("""
                    SELECT COUNT(*) FROM messages
                    WHERE sender_id = %s AND recipient_id = %s AND read = FALSE
                """, (friend_id, user_id))
                unread = cur.fetchone()[0]
                
                conversations.append({
                    "friend_id": friend_id,
                    "friend_name": friend_name,
                    "last_message": last_msg[0] if last_msg else "",
                    "last_message_time": last_msg[1].isoformat() if last_msg else "",
                    "unread_count": unread,
                    "is_sender": last_msg[2] == user_id if last_msg else False
                })
            
            return {"user_id": user_id, "conversations": conversations}
    finally:
        conn.close()

@app.get("/users/{user_id}/messages/{friend_id}")
def get_messages(user_id: int, friend_id: int):
    """Get conversation thread with a friend"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Get all messages between these two users
            cur.execute("""
                SELECT message_id, sender_id, recipient_id, content, created_at, read,
                       u.user_name as sender_name
                FROM messages
                LEFT JOIN users u ON u.user_id = sender_id
                WHERE (sender_id = %s AND recipient_id = %s)
                   OR (sender_id = %s AND recipient_id = %s)
                ORDER BY created_at ASC
            """, (user_id, friend_id, friend_id, user_id))
            
            messages = []
            for row in cur.fetchall():
                messages.append({
                    "message_id": row[0],
                    "sender_id": row[1],
                    "recipient_id": row[2],
                    "content": row[3],
                    "created_at": row[4].isoformat(),
                    "read": row[5],
                    "sender_name": row[6]
                })
            
            # Mark messages from friend as read
            if messages:
                cur.execute("""
                    UPDATE messages
                    SET read = TRUE
                    WHERE sender_id = %s AND recipient_id = %s AND read = FALSE
                """, (friend_id, user_id))
                conn.commit()
            
            return {"user_id": user_id, "friend_id": friend_id, "messages": messages}
    finally:
        conn.close()

@app.post("/users/{user_id}/messages")
def send_message(user_id: int, request: SendMessageRequest):
    """Send a message to a friend"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO messages (sender_id, recipient_id, content, created_at, read)
                VALUES (%s, %s, %s, NOW(), FALSE)
                RETURNING message_id, created_at
            """, (user_id, request.recipient_id, request.content))
            result = cur.fetchone()
            conn.commit()
            
            return {
                "message_id": result[0],
                "sender_id": user_id,
                "recipient_id": request.recipient_id,
                "content": request.content,
                "created_at": result[1].isoformat(),
                "read": False
            }
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)