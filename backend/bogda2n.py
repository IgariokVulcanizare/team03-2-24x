import pandas as pd
from nltk.tokenize import word_tokenize
import random

# Load AFINN sentiment scores
afinn = {}
with open('AFINN-111.txt', 'r', encoding='utf-8') as f:
    for line in f:
        word, score = line.strip().split('\t')
        afinn[word] = int(score)

# Function to compute sentiment score
def compute_action_score(text):
    if not isinstance(text, str):
        return 0  # Neutral score for invalid input
    tokens = word_tokenize(text.lower())
    score = sum(afinn.get(token, 0) for token in tokens)
    return score

# File path for the CSV
file_path = "santa.csv"

# Load the dataset
df = pd.read_csv(file_path)

# Limit the dataset to the first 200 kids
df = df.head(200)

# Ensure numeric columns are properly formatted
df["Listened_To_Parents"] = pd.to_numeric(df["Listened_To_Parents"], errors="coerce")
df["School_Grades"] = pd.to_numeric(df["School_Grades"], errors="coerce")

# Fill missing or invalid values with defaults
school_average = df["School_Grades"].mean(skipna=True)
listen_average = df["Listened_To_Parents"].mean(skipna=True)
df["School_Grades"] = df["School_Grades"].fillna(school_average)
df["Listened_To_Parents"] = df["Listened_To_Parents"].fillna(listen_average)
df["Good_Deed"] = df["Good_Deed"].fillna("")
df["Bad_Deed"] = df["Bad_Deed"].fillna("")

# Score the good and bad deeds
df["Good_Score"] = df["Good_Deed"].apply(lambda deed: compute_action_score(deed))
df["Bad_Score"] = df["Bad_Deed"].apply(lambda deed: compute_action_score(deed))

# Adjust good action scores
min_good_score = abs(df["Good_Score"].min()) + 1
df["Good_Score"] += min_good_score

# Calculate total scores
df["Total_Score"] = df["Good_Score"] + df["Bad_Score"]
min_combined_score = abs(df["Total_Score"].min())
df["Total_Score"] += min_combined_score

# Normalize scores and combine with school grades and listened scores
max_combined_score = df["Total_Score"].max()
df["Normalized_Score"] = df["Total_Score"] / (3 * max_combined_score)
df["Grade_Component"] = df["School_Grades"] / (3 * df["School_Grades"].max())
df["Listen_Component"] = df["Listened_To_Parents"] / (3 * df["Listened_To_Parents"].max())
df["Final_Score"] = df["Normalized_Score"] + df["Grade_Component"] + df["Listen_Component"]

# Calculate the average rating
average_rating = df["Final_Score"].mean()

# Expanded gift dictionary
gifts_by_loveometer = {
    (0.9, 1.0): ["Advanced Drawing Kit", "Classic Board Game Collection", "DIY Science Project Kit", "Acoustic Guitar for Beginners", "Lego Creator Set", "High-Quality Sketchpad with Pencils", "Portable Chess Set", "Simple Robotics Kit", "Nature Explorer Backpack"],
    (0.8, 0.9): ["Basic Telescope with Star Map", "Eco-Friendly Craft Supplies", "Interactive Globe", "RC Car with LED Lights", "Outdoor Adventure Kit", "Beginner's Watercolor Set", "Animal Habitat Flashcards", "Magnetic Building Blocks", "Fun Geography Puzzle"],
    (0.7, 0.8): ["Pocket Microscope", "Beginner's Calligraphy Set", "Wildlife Observation Cards", "DIY Birdhouse Kit", "Painting Set with Acrylics", "Easy-to-Assemble Puzzle", "Solar-Powered Toy Car Kit", "Kid-Friendly Gardening Set", "Simple Experiment Tools"],
    (0.6, 0.7): ["Children's Encyclopedia", "Nature-Themed Coloring Book", "World Map Puzzle", "Storybook of Great Inventors", "Origami Starter Pack", "Wooden Train Set", "Mini Art Canvas Kit", "Animal Sticker Collection", "DIY Bracelet Kit"],
    (0.5, 0.6): ["Science Experiment Kit", "Basic Craft Kit", "Simple Puzzle Book", "Solar System Stickers", "Eco-Friendly Notebook", "Educational Flashcards", "DIY Art Frame Kit", "Build-A-Robot Activity Sheet", "Math Game for Kids"],
    (0.4, 0.5): ["Coloring and Activity Pack", "Learning Flashcards", "Geometric Shapes Set", "Simple Crafting Tools", "Animal Fact Book", "DIY Bookmark Kit", "Matching Puzzle Game", "Kid-Sized Ruler and Protractor", "Word Search Book"],
    (0.3, 0.4): ["Mindfulness Activity Book", "Simple Drawing Pad", "Stickers for Good Behavior", "DIY Friendship Bracelets", "Color-Me Poster", "Animal Masks to Decorate", "Card Matching Game", "Kindness Journal", "DIY Collage Kit"],
    (0.2, 0.3): ["Sharing Board Game", "Teamwork-Themed Storybook", "Simple Habit Tracker", "Good Behavior Chart", "Encouragement Bookmark Set", "Magnetic Animal Figures", "Build-A-House Puzzle", "DIY Mask Kit", "Animal-Themed Puzzle"],
    (0.1, 0.2): ["Kindness Sticker Sheet", "Simple Cooperation Game", "Short Stories of Good Morals", "Behavior Improvement Journal", "Matching Card Game", "DIY Reward Chart", "Coloring Pages Pack", "Craft Stick Activity Kit", "Basic Building Blocks"],
    (0, 0.1): ["Positive Behavior Workbook", "Simple Team Game", "Feelings and Emotions Flashcards", "Responsibility Chart", "Simple Jigsaw Puzzle", "Kindness Coloring Sheets", "DIY Positive Affirmation Cards", "Storybook About Problem-Solving", "Good Deeds Roleplay Cards"]
}

# Assign gifts
def assign_gift(row):
    for rating_range, gifts in gifts_by_loveometer.items():
        if rating_range[0] <= row["Final_Score"] < rating_range[1]:
            return random.choice(gifts)
    return "No gift"

df["Gift"] = df.apply(assign_gift, axis=1)

def categorize_good_bad(row):
    return "Good" if row["Final_Score"] >= average_rating else "Bad"

df["Good/Bad"] = df.apply(categorize_good_bad, axis=1)

# Add an ID column if not present
if "ID" not in df.columns:
    df["ID"] = range(1, len(df) + 1)

# Separate good and bad kids
good_kids = df[df["Good/Bad"] == "Good"]
bad_kids = df[df["Good/Bad"] == "Bad"]

# Save the result to separate CSV files
good_kids_file = "good_kids_results.csv"
bad_kids_file = "bad_kids_results.csv"

good_kids[["ID", "Name", "Country", "Gift"]].to_csv(good_kids_file, index=False)
bad_kids[["ID", "Name", "Country", "Gift"]].to_csv(bad_kids_file, index=False)

print(f"Good kids results saved to {good_kids_file}.")
print(f"Bad kids results saved to {bad_kids_file}.")
