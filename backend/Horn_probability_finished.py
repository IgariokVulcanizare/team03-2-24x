
import math
import numpy as np
import csv
from collections import defaultdict

# Read data from CSV
kids = []
countries = []
with open("C:\\Users\\Nikita\\Downloads\\santas_logistics.csv", 'r', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    header = next(csv_reader)
    for row in csv_reader:
        kids.append(row[1])  # Kid's name
        countries.append(row[6])  # Country

# Function to calculate the probability Santa can fit through the horn
def calculate_fit_probability(santa_size, horn_diameter):
    if santa_size <= horn_diameter:
        return 1.0  # 100% probability
    else:
        # Decreasing exponential model for probabilities
        return math.exp(-(santa_size - horn_diameter) / horn_diameter)

# Santa's size in centimeters
santa_size = 83.82

# Generate 5000 random horn sizes
np.random.seed(42)  # For reproducibility
horn_sizes = np.random.uniform(50, 150, 5000)

# Calculate probabilities per country
country_probabilities = defaultdict(list)
for idx, horn_diameter in enumerate(horn_sizes):
    if idx < len(kids):  # Ensure index is within bounds of kids and countries
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

# Print average probabilities for each country
# print("\nAverage Probabilities per Country:")
# for country, avg_probability in country_average_probabilities.items():
#     print(f"{country}: {avg_probability:.2f}")

# Print warning countries
# if warning_countries:
#     print("\nWarning: Countries with average probability < 0.6")
#     for country in warning_countries:
#         print(f"- {country}")
# else:
#     print("\nAll countries have sufficient probabilities!")
print("Santa, better practice your yoga for this countries!")
for country in warning_countries:
    print(country, end=" ")
print("\n")
fit_probabilities = []
for idx, horn_diameter in enumerate(horn_sizes):
    probability = calculate_fit_probability(santa_size, horn_diameter)
    fit_probabilities.append([idx, horn_diameter, probability])

for horn_id, horn_diameter, probability in fit_probabilities:
    if probability < 0.6:
        print(f"For the {kids[horn_id]}'s house Rudolph is suggesting Santa skip the cookies here...")
    else:
        print("You can entry safely")