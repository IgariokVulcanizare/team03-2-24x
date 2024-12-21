import csv
import math
from nltk.tokenize import word_tokenize
import pandas as pd

# Load AFINN sentiment scores
def load_afinn(file_path):
    afinn = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            word, score = line.strip().split('\t')
            afinn[word] = int(score)
    return afinn

def compute_action_score(text, afinn):
    tokens = word_tokenize(str(text).lower())
    return sum(afinn.get(token, 0) for token in tokens)

# Load coordinates and other data from CSV
def load_data(file_path):
    data = pd.read_csv(file_path)
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
    good_kids = data[data['Final_Score'] >= average_score]
    bad_kids = data[data['Final_Score'] < average_score]

    return good_kids, bad_kids

# Calculate the great-circle distance using the Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of the Earth in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
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
        nearest, min_distance = -1, float('inf')
        for i in range(n):
            if not visited[i] and distance_matrix[last][i] < min_distance:
                nearest = i
                min_distance = distance_matrix[last][i]
        path.append(nearest)
        visited[nearest] = True
        total_distance += min_distance

    # Return to starting point
    total_distance += distance_matrix[path[-1]][path[0]]
    path.append(start_index)

    return path, total_distance

# Main execution
def main():
    afinn_path = 'AFINN-111.txt'
    data_path = 'santa.csv'

    # Load AFINN scores and data
    afinn = load_afinn(afinn_path)
    data = load_data(data_path)

    # Compute scores and separate into groups
    good_kids, bad_kids = calculate_scores(data, afinn)

    # Process good kids
    good_locations = list(zip(good_kids['Latitude'], good_kids['Longitude']))
    if good_locations:
        good_distance_matrix = build_distance_matrix(good_locations)
        easternmost_good = max(range(len(good_locations)), key=lambda i: good_locations[i][1])
        good_path_indices, good_total_distance = solve_tsp_greedy(good_distance_matrix, easternmost_good)
        good_path = [good_kids.iloc[i]['Name'] for i in good_path_indices]

        print("Good kids' path:")
        print(" -> ".join(good_path))
        print(f"Total distance: {good_total_distance:.2f} km")

    # Process bad kids
    bad_locations = list(zip(bad_kids['Latitude'], bad_kids['Longitude']))
    if bad_locations:
        bad_distance_matrix = build_distance_matrix(bad_locations)
        easternmost_bad = max(range(len(bad_locations)), key=lambda i: bad_locations[i][1])
        bad_path_indices, bad_total_distance = solve_tsp_greedy(bad_distance_matrix, easternmost_bad)
        bad_path = [bad_kids.iloc[i]['Name'] for i in bad_path_indices]

        print("\nBad kids' path:")
        print(" -> ".join(bad_path))
        print(f"Total distance: {bad_total_distance:.2f} km")

if __name__ == "__main__":
    main()
