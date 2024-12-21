from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from djikstra import load_afinn, load_data, calculate_scores, build_distance_matrix, solve_tsp_greedy

app = FastAPI()

class PathsResponse(BaseModel):
    good_kids: dict
    bad_kids: dict

@app.get("/paths", response_model=PathsResponse)
def get_paths():
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
    else:
        good_path = []
        good_total_distance = 0

    # Process bad kids
    bad_locations = list(zip(bad_kids['Latitude'], bad_kids['Longitude']))
    if bad_locations:
        bad_distance_matrix = build_distance_matrix(bad_locations)
        easternmost_bad = max(range(len(bad_locations)), key=lambda i: bad_locations[i][1])
        bad_path_indices, bad_total_distance = solve_tsp_greedy(bad_distance_matrix, easternmost_bad)
        bad_path = [bad_kids.iloc[i]['Name'] for i in bad_path_indices]
    else:
        bad_path = []
        bad_total_distance = 0

    response = {
        "good_kids": {
            "path": good_path,
            "total_distance": good_total_distance
        },
        "bad_kids": {
            "path": bad_path,
            "total_distance": bad_total_distance
        }
    }

    return JSONResponse(content=response)
