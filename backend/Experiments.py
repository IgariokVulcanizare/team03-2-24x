# experiments.py

import csv
from nltk.tokenize import word_tokenize
import pandas as pd
import logging
from collections import defaultdict
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk import NaiveBayesClassifier
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def load_afinn(file_path='AFINN-111.txt'):
    """
    Load AFINN sentiment scores from a file.
    
    Args:
        file_path (str): Path to the AFINN-111.txt file.
        
    Returns:
        dict: A dictionary mapping words to their sentiment scores.
    """
    afinn = {}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                word, score = line.strip().split('\t')
                if word.lower() != "lost":  # Exclude "lost" if required
                    afinn[word.lower()] = int(score)
    except FileNotFoundError:
        logging.error(f"AFINN file not found at {file_path}.")
        raise
    return afinn

def compute_action_score(text, afinn):
    """
    Compute the sentiment score for a given text based on the AFINN lexicon.
    
    Args:
        text (str): The text to score.
        afinn (dict): The AFINN sentiment scores.
        
    Returns:
        int: The computed sentiment score.
    """
    tokens = word_tokenize(text.lower())
    score = sum(afinn.get(token, 0) for token in tokens)
    return score

def process_dataset(file_path='santa.csv', afinn=None):
    """
    Process the dataset to extract good deeds, bad deeds, school grades, and listening scores.
    
    Args:
        file_path (str): Path to the santa.csv file.
        afinn (dict): The AFINN sentiment scores.
        
    Returns:
        tuple: Lists of goods, bads, school_grades, and listened scores.
    """
    goods = []
    bads = []
    school_grades = []
    listened = []

    total_school_grades = 0
    total_listened = 0
    count_school = 0
    count_listened = 0

    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        logging.error(f"Dataset not found at {file_path}.")
        raise

    # Ensure required columns exist
    required_columns = {'Child_ID', 'Name', 'Bad_Deed', 'Good_Deed', 'School_Grade', 'Listened'}
    if not required_columns.issubset(df.columns):
        missing = required_columns - set(df.columns)
        logging.error(f"Missing columns in dataset: {missing}")
        raise Exception(f"Missing columns: {missing}")

    for index, row in df.iterrows():
        goods.append(row.get('Good_Deed', ''))
        bads.append(row.get('Bad_Deed', ''))

        # Calculate total and count for school grades
        school_grade = row.get('School_Grade')
        if pd.notna(school_grade):
            total_school_grades += float(school_grade)
            count_school += 1

        # Calculate total and count for listened
        listened_score = row.get('Listened')
        if pd.notna(listened_score):
            total_listened += float(listened_score)
            count_listened += 1

    # Compute averages
    school_average = total_school_grades / count_school if count_school > 0 else 0
    listen_average = total_listened / count_listened if count_listened > 0 else 0

    # Fill missing values
    for index, row in df.iterrows():
        school_grade = row.get('School_Grade')
        if pd.notna(school_grade):
            school_grades.append(float(school_grade))
        else:
            school_grades.append(school_average)

        listened_score = row.get('Listened')
        if pd.notna(listened_score):
            listened.append(float(listened_score))
        else:
            listened.append(listen_average)

    return goods, bads, school_grades, listened

def score_actions(goods, bads, afinn):
    """
    Score the good and bad deeds of each child.
    
    Args:
        goods (list): List of good deeds.
        bads (list): List of bad deeds.
        afinn (dict): The AFINN sentiment scores.
        
    Returns:
        tuple: Lists of scored_goods and scored_bads.
    """
    scored_goods = [[idx, compute_action_score(good, afinn)] for idx, good in enumerate(goods)]
    
    # Adjust good action scores to avoid negatives
    min_good_score = abs(min(score for _, score in scored_goods)) + 1
    for item in scored_goods:
        item[1] += min_good_score
    
    scored_bads = [[idx, compute_action_score(bad, afinn)] for idx, bad in enumerate(bads)]
    
    return scored_goods, scored_bads

def combine_and_normalize(scored_goods, scored_bads, school_grades, listened):
    """
    Combine and normalize the scores from deeds, school grades, and listening.
    
    Args:
        scored_goods (list): List of scored good deeds.
        scored_bads (list): List of scored bad deeds.
        school_grades (list): List of school grades.
        listened (list): List of listening scores.
        
    Returns:
        tuple: Combined and normalized scores, and the average score.
    """
    combined_scores = []
    for idx in range(len(scored_goods)):
        good_score = scored_goods[idx][1]
        bad_score = scored_bads[idx][1]
        total_score = good_score + bad_score
        combined_scores.append([idx, total_score])

    # Normalize combined scores
    min_combined_score = abs(min(score for _, score in combined_scores))
    for item in combined_scores:
        item[1] += min_combined_score

    max_combined_score = max(score for _, score in combined_scores) or 1  # Prevent division by zero
    for idx in range(len(combined_scores)):
        normalized_score = combined_scores[idx][1] / (3 * max_combined_score)
        grade_component = school_grades[idx] / (3 * max(school_grades)) if max(school_grades) else 0
        listen_component = listened[idx] / (3 * max(listened)) if max(listened) else 0
        combined_scores[idx][1] = normalized_score + grade_component + listen_component

    # Add 1-based indexing to student IDs
    for idx in range(len(combined_scores)):
        combined_scores[idx][0] += 1

    # Compute the average score
    average = sum(score for _, score in combined_scores) / len(combined_scores) if combined_scores else 0

    return combined_scores, average

def main():
    """
    Main function to execute the experiments.
    
    Returns:
        tuple: Combined scores and the average score.
    """
    afinn = load_afinn()
    goods, bads, school_grades, listened = process_dataset(afinn=afinn)
    scored_goods, scored_bads = score_actions(goods, bads, afinn)
    combined_scores, average = combine_and_normalize(scored_goods, scored_bads, school_grades, listened)
    final_result = (combined_scores, average)

    # For debugging purposes
    logging.info(f"Average Score: {average}")
    logging.info(f"Combined Scores (first 5): {combined_scores[:5]}...")  # Display first 5 for brevity

    return final_result

# If this script is run directly, execute main
if __name__ == "__main__":
    final_result = main()
