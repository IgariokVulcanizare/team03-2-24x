import csv
import math
import os
import sys
from nltk.tokenize import word_tokenize
import pandas as pd
import nltk
import random
import json

# Ensure NLTK data is downloaded
nltk_packages = ['punkt']
for package in nltk_packages:
    try:
        nltk.data.find(f'tokenizers/{package}')
    except LookupError:
        nltk.download(package)

# Load AFINN sentiment scores
def load_afinn(file_path):
    if not os.path.exists(file_path):
        print(f"AFINN file not found at path: {file_path}")
        sys.exit(1)
    afinn = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            word, score = line.strip().split('\t')
            afinn[word] = int(score)
    return afinn

# Compute sentiment score for a given text
def compute_action_score(text, afinn):
    tokens = word_tokenize(str(text).lower())
    return sum(afinn.get(token, 0) for token in tokens)

# Load data from CSV
def load_data(file_path):
    if not os.path.exists(file_path):
        print(f"Data file not found at path: {file_path}")
        sys.exit(1)
    data = pd.read_csv(file_path)
    expected_columns = {'Latitude', 'Longitude', 'Good_Deed', 'Bad_Deed', 'School_Grades', 'Listened_To_Parents'}
    if not expected_columns.issubset(set(data.columns)):
        missing = expected_columns - set(data.columns)
        print(f"Missing columns in data: {missing}")
        sys.exit(1)
    return data

# Calculate scores and divide into groups
def calculate_scores(data, afinn):
    # Compute good and bad deed scores
    data['Good_Score'] = data['Good_Deed'].apply(lambda x: compute_action_score(x, afinn))
    data['Bad_Score'] = data['Bad_Deed'].apply(lambda x: compute_action_score(x, afinn))

    # Normalize scores
    min_good_score = abs(data['Good_Score'].min()) + 1
    data['Good_Score'] += min_good_score

    min_bad_score = abs(data['Bad_Score'].min())
    data['Bad_Score'] += min_bad_score

    # Combined Score
    data['Combined_Score'] = data['Good_Score'] - data['Bad_Score']

    # Adjust for school grades and listening
    data['School_Grades'] = data['School_Grades'].fillna(data['School_Grades'].mean())
    data['Listened_To_Parents'] = data['Listened_To_Parents'].fillna(data['Listened_To_Parents'].mean())

    data['Final_Score'] = (
        data['Combined_Score'] +
        data['School_Grades'] / data['School_Grades'].max() +
        data['Listened_To_Parents'] / data['Listened_To_Parents'].max()
    )

    average_score = data['Final_Score'].mean()

    # Split into groups
    good_kids = data[data['Final_Score'] >= average_score].reset_index(drop=True)
    bad_kids = data[data['Final_Score'] < average_score].reset_index(drop=True)

    print(f"Total Kids: {len(data)}")
    print(f"Good Kids: {len(good_kids)}")
    print(f"Bad Kids: {len(bad_kids)}")

    return good_kids, bad_kids

# Calculate the great-circle distance using the Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of the Earth in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Build distance matrix
def build_distance_matrix(locations):
    n = len(locations)
    distance_matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i + 1, n):
            distance = haversine(*locations[i], *locations[j])
            distance_matrix[i][j] = distance
            distance_matrix[j][i] = distance
    return distance_matrix

# Solve TSP using a greedy nearest neighbor approach
def solve_tsp_greedy(distance_matrix, start_index):
    n = len(distance_matrix)
    visited = [False] * n
    path = [start_index]
    visited[start_index] = True
    total_distance = 0
    for _ in range(n - 1):
        last = path[-1]
        nearest = -1
        min_distance = float('inf')
        for i in range(n):
            if not visited[i] and distance_matrix[last][i] < min_distance:
                nearest = i
                min_distance = distance_matrix[last][i]
        if nearest == -1:
            break
        path.append(nearest)
        visited[nearest] = True
        total_distance += min_distance

    # Return to starting point
    if n > 1:
        total_distance += distance_matrix[path[-1]][path[0]]
        path.append(start_index)

    return path, total_distance

# Function to calculate the probability Santa can fit through the horn
def calculate_fit_probability(santa_size, horn_diameter):
    if santa_size <= horn_diameter:
        return 1.0  # 100% probability
    else:
        return math.exp(-(santa_size - horn_diameter) / horn_diameter)

# Function to convert path indices to GeoJSON LineString coordinates
def path_to_geojson(kids, path_indices, group_name):
    path_coords = [[kids.iloc[idx]['Longitude'], kids.iloc[idx]['Latitude']] for idx in path_indices]
    geojson = {
        "type": "Feature",
        "properties": {
            "group": group_name
        },
        "geometry": {
            "type": "LineString",
            "coordinates": path_coords
        }
    }
    return geojson

# Main execution
def main():
    afinn_path = 'AFINN-111.txt'
    data_path = 'updated_santa.csv'

    # Load AFINN scores and data
    afinn = load_afinn(afinn_path)
    data = load_data(data_path)

    # Compute scores and separate into groups
    good_kids, bad_kids = calculate_scores(data, afinn)

    # Function to process kids and solve TSP
    def process_kids(kids, group_name):
        santa_size = 83.82  # Example Santa size in cm
        horn_diameters = [random.uniform(50, 150) for _ in range(len(kids))]  # Example horn sizes in cm

        # Limit to 75 kids
        kids = kids.sample(min(len(kids), 75), random_state=42).reset_index(drop=True)

        locations = list(zip(kids['Latitude'], kids['Longitude']))
        if not locations:
            print(f"No locations found for {group_name} group.")
            return

        distance_matrix = build_distance_matrix(locations)

        # Choose the starting point as the easternmost location (highest longitude)
        easternmost_index = max(range(len(locations)), key=lambda i: locations[i][1])
        path_indices, total_distance = solve_tsp_greedy(distance_matrix, easternmost_index)

        # Build the route string with arrows
        route_parts = []
        for idx in path_indices:
            if 'Child_ID' in kids.columns:
                name = kids.loc[idx, 'Child_ID']
            elif 'Name' in kids.columns:
                name = kids.loc[idx, 'Name']
            else:
                name = f"Kid {idx}"
            lat = kids.loc[idx, 'Latitude']
            lon = kids.loc[idx, 'Longitude']
            horn_diameter = horn_diameters[idx]
            probability = calculate_fit_probability(santa_size, horn_diameter)
            message = "You can enter safely." if probability >= 0.7 else "Rudolph suggests skipping the cookies."
            route_parts.append(f"{name} (Lat: {lat:.6f}, Lon: {lon:.6f}) - Probability: {probability:.2f} => {message}")

        route_str = " \u2192 ".join(route_parts)

        print(f"\n{group_name} Kids Route:")
        print(f"Total Distance: {total_distance:.2f} km")
        print("Visit Order:")
        print(route_str)

        # Convert path to GeoJSON and save
        geojson = path_to_geojson(kids, path_indices, group_name)
        output_json = f"{group_name.lower()}_path.json"
        with open(output_json, "w", encoding="utf-8") as f:
            json.dump(geojson, f, ensure_ascii=False, indent=4)
        print(f"{group_name} path saved to {output_json}")

    # Process Good Kids
    process_kids(good_kids, "Good")

    # Process Bad Kids
    process_kids(bad_kids, "Bad")

if __name__ == "__main__":
    main()
