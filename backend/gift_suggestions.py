from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import openai
from Experiments import final_result  # Importing the rating calculation results

app = FastAPI()

# Load the dataset
DATASET_PATH = "santa.csv"
df = pd.read_csv(DATASET_PATH)

# Clean the dataset and handle missing values
def clean_dataset(df):
    # Fill missing values for numeric columns with a default value or the column's mean
    if "School_Grades" in df.columns:
        df["School_Grades"] = pd.to_numeric(df["School_Grades"], errors="coerce")
        df["School_Grades"] = df["School_Grades"].fillna(df["School_Grades"].mean())

    if "Listened_To_Parents" in df.columns:
        df["Listened_To_Parents"] = pd.to_numeric(df["Listened_To_Parents"], errors="coerce")
        df["Listened_To_Parents"] = df["Listened_To_Parents"].fillna(0.5)  # Default to neutral likelihood

    # Ensure text columns are strings and replace NaNs with an empty string
    text_columns = ["Good_Deed", "Bad_Deed"]
    for col in text_columns:
        if col in df.columns:
            df[col] = df[col].astype(str).fillna("")

    return df

# Clean the dataset
df = clean_dataset(df)

# Set up OpenAI API key
openai.api_key = "YOUR_OPENAI_API_KEY"  # Replace with your OpenAI API key

# Define a Pydantic model for input validation
class Child(BaseModel):
    id: int
    name: str
    rating: float
    bad_deed: str

# Function to generate gift suggestions using OpenAI's GPT API
def fetch_gift_suggestions(child_id: int, bad_deed: str):
    """
    Use OpenAI's GPT API to generate gift suggestions dynamically based on the bad deed.
    """
    try:
        # Ensure bad_deed is a string
        if not isinstance(bad_deed, str) or bad_deed.strip() == "":
            return ["No bad deed specified. Default suggestion: Be kind!"]

        # Generate a prompt for GPT
        prompt = f"Generate a gift suggestion to correct the following deed for child ID {child_id}: {bad_deed}."

        # Call the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # or "gpt-4" if available
            messages=[
                {"role": "system", "content": "You are a helpful assistant for generating gift ideas."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )

        # Parse and return the response
        suggestions = response.choices[0].message.content.strip()
        return suggestions.split("\n")  # Return suggestions as a list

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching suggestions: {e}")

@app.get("/process-children")
def process_children():
    """
    Processes all children in the dataset, compares their ratings, and generates gift suggestions for those
    below the average rating and with a bad deed.
    """
    # Extract ratings and average from Experiments.py
    combined_scores, average_rating = final_result  # Extract combined scores and the average rating

    results = []

    for child in combined_scores:
        child_id = child[0]  # Extract child ID
        rating = child[1]  # Extract rating

        if rating >= average_rating:
            continue  # Skip if the rating is above or equal to the average

        # Get the child's information from the dataset
        child_row = df.loc[df["Child_ID"] == child_id]
        if child_row.empty:
            continue  # Skip if the child ID is not found in the dataset

        name = child_row["Name"].values[0]
        bad_deed = child_row["Bad_Deed"].values[0]

        if pd.isna(bad_deed) or not bad_deed.strip():
            print(f"Child ID {child_id} has no bad deed specified. Skipping.")
            continue  # Skip if there is no bad deed specified

        # Fetch suggestions dynamically based on the bad deed
        suggestions = fetch_gift_suggestions(child_id, bad_deed)

        # Store result in a dictionary
        child_result = {
            "id": child_id,
            "name": name,
            "rating": rating,
            "average_rating": average_rating,
            "bad_deed": bad_deed,
            "gift_suggestions": suggestions
        }
        results.append(child_result)

        # Print results to the terminal
        print("Processing Child:")
        print(f"ID: {child_result['id']}, Name: {child_result['name']}, Rating: {child_result['rating']}, Average Rating: {child_result['average_rating']}")
        print(f"Bad Deed: {child_result['bad_deed']}")
        print("Gift Suggestions:")
        for suggestion in child_result['gift_suggestions']:
            print(f"  - {suggestion}")
        print("-" * 50)

    return results

if __name__ == "__main__":
    # Directly process children and print results to the terminal
    process_children()
