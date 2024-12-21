import math
import numpy as np
import csv

kids = []
countries = []
with open("C:\\Users\\Nikita\\Downloads\\santas_logistics.csv", 'r', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    header = next(csv_reader)
    for row in csv_reader:
        kids.append(row[1])
        countries.append([row[0],row[6]])

print(countries)
# Function to calculate the probability Santa can fit through the horn
def calculate_fit_probability(santa_size, horn_diameter):
    if santa_size <= horn_diameter:
        return 1.0  # 100% probability
    else:
        # Decreasing exponential model for probabilities
        return math.exp(-(santa_size - horn_diameter) / horn_diameter)

santa_size = 83.82

# Generate 5000 random horn sizes
# Assuming horn sizes are in centimeters and range from 50 to 150 cm
np.random.seed(42)  # For reproducibility
horn_sizes = np.random.uniform(50, 150, 5000)

fit_probabilities = []
for idx, horn_diameter in enumerate(horn_sizes):
    probability = calculate_fit_probability(santa_size, horn_diameter)
    fit_probabilities.append([idx, horn_diameter, probability])

# Print the results
print("\nFit Probabilities (Horn ID, Diameter, Probability):")
for horn_id, horn_diameter, probability in fit_probabilities:
    if probability < 0.6:
        print(f"Satna be carefull at the house of {kids[horn_id]}'s, it is tight, get some help!")