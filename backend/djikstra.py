import pandas as pd
import itertools
import math

# Load coordinates from the provided dataset
def load_coordinates_from_csv(file_path):
    try:
        data = pd.read_csv(file_path)
        # Ensure required columns are present
        required_columns = {'Name', 'Latitude', 'Longitude'}
        if not required_columns.issubset(data.columns):
            raise KeyError(f"Missing required columns: {required_columns - set(data.columns)}")

        # Convert data to a dictionary of coordinates
        nodes = {row['Name']: (row['Latitude'], row['Longitude']) for _, row in data.iterrows()}
        return nodes
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        exit(1)
    except KeyError as e:
        print(f"KeyError: {e}")
        exit(1)

# Calculate the great-circle distance between two points using the Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of the Earth in kilometers
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Build the distance matrix using the Haversine formula
def build_distance_matrix(locations):
    n = len(locations)
    distance_matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                distance_matrix[i][j] = haversine(*locations[i], *locations[j])
            else:
                distance_matrix[i][j] = math.inf  # No self-loop
    return distance_matrix

# Solve TSP using brute force
def solve_tsp(distance_matrix):
    num_nodes = len(distance_matrix)
    min_distance = math.inf
    best_path = []
    for perm in itertools.permutations(range(1, num_nodes)):
        path = [0] + list(perm) + [0]
        distance = sum(distance_matrix[path[i]][path[i + 1]] for i in range(len(path) - 1))
        if distance < min_distance:
            min_distance = distance
            best_path = path
    return best_path, min_distance

# Main Execution
file_path =  'santa.csv'


nodes = load_coordinates_from_csv(file_path)

# Prepare the distance matrix
locations = list(nodes.values())
distance_matrix = build_distance_matrix(locations)

# Find the shortest path
shortest_path_indices, min_distance = solve_tsp(distance_matrix)

# Map indices back to node names
shortest_path = [list(nodes.keys())[i] for i in shortest_path_indices]

# Output the result
print(f"Shortest path: {' -> '.join(shortest_path)}")
print(f"Minimum distance: {min_distance:.2f} km")
