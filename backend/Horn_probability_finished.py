import math
import numpy as np
import csv
from collections import defaultdict

# Function to calculate the probability Santa can fit through the horn
def calculate_fit_probability(santa_size, horn_diameter):
    if santa_size <= horn_diameter:
        return 1.0  # 100% probability
    else:
        # Decreasing exponential model for probabilities
        return math.exp(-(santa_size - horn_diameter) / horn_diameter)

# Santa's size in centimeters
santa_size = 83.82

# Read data from CSV
kids = []
countries = []
data = []
with open("santa.csv", 'r', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    header = next(csv_reader)
    for row in csv_reader:
        kids.append(row[1])  # Kid's name
        countries.append(row[6])  # Country
        data.append(row)  # Store all data

# Generate 5000 random horn sizes
np.random.seed(42)  # For reproducibility
horn_sizes = np.random.uniform(50, 150, 5000)

# Add fit probabilities and messages to data
fit_probabilities = []
for idx, row in enumerate(data):
    if idx < len(horn_sizes):
        horn_diameter = horn_sizes[idx]
        probability = calculate_fit_probability(santa_size, horn_diameter)
        message = ""
        if probability < 0.6:
            message = f"Rudolph is suggesting Santa skip the cookies at {row[1]}'s house"
        else:
            message = "You can enter safely."
        row.append(f"{probability:.2f}")  # Add fit probability
        row.append(message)  # Add the horn message
        fit_probabilities.append([idx, horn_diameter, probability])

# Calculate probabilities per country
country_probabilities = defaultdict(list)
for idx, horn_diameter in enumerate(horn_sizes):
    if idx < len(kids):
        probability = calculate_fit_probability(santa_size, horn_diameter)
        country_probabilities[countries[idx]].append(probability)

# Calculate average probability for each country and find warning countries
warning_countries = []
country_average_probabilities = {}
for country, probabilities in country_probabilities.items():
    avg_probability = sum(probabilities) / len(probabilities)
    country_average_probabilities[country] = avg_probability
    if avg_probability < 0.65:
        warning_countries.append(country)

# Save updated data to a new CSV file
updated_header = header + ["Fit Probability", "Horn Message"]
output_file = "updated_santa.csv"
with open(output_file, "w", encoding="utf-8", newline="") as file:
    csv_writer = csv.writer(file)
    csv_writer.writerow(updated_header)
    csv_writer.writerows(data)

# Print warning messages and phrases




print(f"Updated CSV file saved as: {output_file}")
