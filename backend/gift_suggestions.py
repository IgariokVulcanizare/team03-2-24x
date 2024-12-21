# gift_suggestions.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import openai
from experiments import main as experiments_main
from dotenv import load_dotenv
import os
import logging
import uvicorn

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

app = FastAPI(
    title="Gift Suggestions API",
    description="Processes children's ratings and provides corrective gift suggestions for those below average.",
    version="1.0.0"
)

# Load the dataset
DATASET_PATH = "santa.csv"
try:
    df = pd.read_csv(DATASET_PATH)
    if "Child_ID" not in df.columns:
        logging.error("Child_ID column not found in the dataset.")
        raise Exception("Child_ID column not found in the dataset.")
    df.set_index("Child_ID", inplace=True)  # Set Child_ID as the index for faster lookups
except FileNotFoundError:
    logging.error(f"Dataset not found at {DATASET_PATH}. Please ensure the file exists.")
    raise Exception(f"Dataset not found at {DATASET_PATH}. Please ensure the file exists.")
except Exception as e:
    logging.error(str(e))
    raise

# Set up OpenAI API key securely
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    logging.error("OpenAI API key not found. Please set it in the .env file.")
    raise Exception("OpenAI API key not found. Please set it in the .env file.")

# Define a Pydantic model for the child
class Child(BaseModel):
    id: int
    name: str
    rating: float
    average_rating: float
    bad_deed: str
    gift_suggestions: list

def fetch_gift_suggestions(child_id: int, bad_deed: str):
    """
    Use OpenAI's GPT API to generate gift suggestions dynamically based on the bad deed.
    
    Args:
        child_id (int): The ID of the child.
        bad_deed (str): The bad deed of the child.
        
    Returns:
        list: A list of gift suggestions.
    """
    try:
        # Generate a prompt for GPT
        prompt = f"Generate corrective gift suggestions for the following bad deed by child ID {child_id}: {bad_deed}."

        # Call the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Corrected model name
            messages=[
                {"role": "system", "content": "You are a helpful assistant for generating gift ideas."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )

        # Parse and return the response
        suggestions = response.choices[0].message.content.strip()
        # Split suggestions by line breaks and remove any leading bullet points or spaces
        return [s.strip("- ").strip() for s in suggestions.split("\n") if s.strip()]
    
    except openai.error.OpenAIError as e:
        logging.error(f"OpenAI API error: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching suggestions: {e}")

@app.get("/process-children", response_model=list[Child], summary="Process children ratings and provide gift suggestions for those below average.")
def process_children():
    """
    Processes all children in the dataset, compares their ratings, and generates gift suggestions for those
    below the average rating and with a bad deed.
    
    Returns:
        list[Child]: A list of children with their details and gift suggestions.
    """
    # Get the final results from experiments.py
    try:
        combined_scores, average_rating = experiments_main()
    except Exception as e:
        logging.error(f"Error fetching ratings: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching ratings: {e}")

    results = []

    for child in combined_scores:
        child_id = child[0]  # Extract child ID
        rating = child[1]    # Extract rating

        if rating >= average_rating:
            continue  # Skip if the rating is above or equal to the average

        try:
            child_row = df.loc[child_id]
        except KeyError:
            logging.warning(f"Child ID {child_id} not found in the dataset. Skipping.")
            continue

        name = child_row.get("Name", "Unknown")
        bad_deed = child_row.get("Bad_Deed", "").strip()

        if not bad_deed:
            logging.info(f"Child ID {child_id} has no bad deed specified. Skipping.")
            continue  # Skip if there is no bad deed specified

        # Fetch suggestions dynamically based on the bad deed
        try:
            suggestions = fetch_gift_suggestions(child_id, bad_deed)
        except HTTPException as e:
            logging.error(f"Error generating suggestions for Child ID {child_id}: {e.detail}")
            continue

        # Create a Child instance
        child_result = Child(
            id=child_id,
            name=name,
            rating=rating,
            average_rating=average_rating,
            bad_deed=bad_deed,
            gift_suggestions=suggestions
        )
        results.append(child_result)

        # Log results
        logging.info(f"Processed Child ID {child_id}: {name}")
        logging.info(f"Rating: {rating} | Average Rating: {average_rating}")
        logging.info(f"Bad Deed: {bad_deed}")
        logging.info(f"Gift Suggestions: {', '.join(suggestions)}")
        logging.info("-" * 50)

    return results

if __name__ == "__main__":
    # Run the FastAPI app using Uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
