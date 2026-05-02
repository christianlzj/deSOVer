import json
import csv
import math
import os
import re
from datetime import datetime, timezone

# ── Config ────────────────────────────────────────────────────────────────────
USER_ID     = "D"
INPUT_FILE  = f"data/google/timeline_{USER_ID}.json"
OUTPUT_FILE = "data/google/timeline_trips.csv"
FILTER_PURPOSE = "driving"   # set to None to include all activity types
FIRST_TRIP = 12000
# ─────────────────────────────────────────────────────────────────────────────

METERS_TO_MILES = 0.000621371

PURPOSE_MAP = {
    "IN_PASSENGER_VEHICLE": "driving",
    "WALKING":              "walking",
    "CYCLING":              "cycling",
    "IN_BUS":               "transit",
    "IN_TRAIN":             "transit",
    "IN_SUBWAY":            "transit",
    "RUNNING":              "running",
}

FIELDNAMES = [
    "trip_id", "user_id", "start_time", "end_time",
    "start_lat", "start_lon", "end_lat", "end_lon",
    "distance_miles", "purpose", "route_points",
]

def parse_timestamp(s: str) -> str:
    """Convert '2026-01-15T10:15:20.000-05:00' -> '2026-01-15T10:15:20'"""
    dt = datetime.fromisoformat(s)
    dt_utc = dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt_utc.isoformat()

def parse_latlng(s: str) -> tuple[float, float]:
    """Parse '33.9734784°, -84.4702361°' -> (lat, lon)."""
    s = re.sub(r"[^\d.,''\-\s]", "", s)
    lat, lon = s.split(",")
    return float(lat.strip()), float(lon.strip())


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Straight-line distance in miles between two lat/lon points."""
    R = 3958.8
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def find_route_points(
    path_segs: list, start_time_str: str, end_time_str: str
) -> list[tuple[float, float]]:
    """Return GPS breadcrumbs from timelinePath segments that overlap this trip window."""
    start = datetime.fromisoformat(start_time_str)
    end   = datetime.fromisoformat(end_time_str)
    points = []
    for ps in path_segs:
        ps_start = datetime.fromisoformat(ps["startTime"])
        ps_end   = datetime.fromisoformat(ps["endTime"])
        if ps_end < start or ps_start > end:
            continue
        for pt in ps.get("timelinePath", []):
            t = datetime.fromisoformat(pt["time"])
            if start <= t <= end:
                points.append(parse_latlng(pt["point"]))
    return points


def parse_timeline(input_file: str, output_file: str) -> None:
    with open(input_file) as f:
        data = json.load(f)

    segments  = data["semanticSegments"]
    path_segs = [s for s in segments if "timelinePath" in s]

    rows     = []
    trip_id  = FIRST_TRIP

    for seg in segments:
        if "activity" not in seg:
            continue

        act            = seg["activity"]
        activity_type  = act.get("topCandidate", {}).get("type", "UNKNOWN")
        purpose        = PURPOSE_MAP.get(activity_type, activity_type.lower())

        if FILTER_PURPOSE and purpose != FILTER_PURPOSE:
            continue

        start_time = seg["startTime"]
        end_time   = seg["endTime"]

        try:
            start_lat, start_lon = parse_latlng(act["start"]["latLng"])
            end_lat,   end_lon   = parse_latlng(act["end"]["latLng"])
        except (KeyError, ValueError):
            print(f"  Skipping trip {trip_id}: missing start/end coords")
            continue

        dist_meters = act.get("distanceMeters", 0)
        dist_miles  = (
            dist_meters * METERS_TO_MILES
            if dist_meters
            else haversine(start_lat, start_lon, end_lat, end_lon)
        )

        route_pts = find_route_points(path_segs, start_time, end_time)
        if len(route_pts) < 2:
            route_pts = [(start_lat, start_lon), (end_lat, end_lon)]
        route_str = str([(lat, lon) for lat, lon in route_pts])

        rows.append({
            "trip_id":       trip_id,
            "user_id":       USER_ID,
            "start_time":    parse_timestamp(start_time),
            "end_time":      parse_timestamp(end_time),
            "start_lat":     round(start_lat, 7),
            "start_lon":     round(start_lon, 7),
            "end_lat":       round(end_lat, 7),
            "end_lon":       round(end_lon, 7),
            "distance_miles": round(dist_miles, 4),
            "purpose":       purpose,
            "route_points":  route_str,
        })
        trip_id += 1

    file_exists = os.path.isfile(output_file)
    with open(output_file, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        if not file_exists:
            writer.writeheader()
        writer.writerows(rows)

    print(f"Done — {len(rows)} trips written to '{output_file}'")


if __name__ == "__main__":
    parse_timeline(INPUT_FILE, OUTPUT_FILE)