import csv
from nltk.tokenize import word_tokenize

# Load AFINN sentiment scores
afinn = {}
with open('AFINN-111.txt', 'r', encoding='utf-8') as f:
    for line in f:
        word, score = line.strip().split('\t')
        if word != "lost":  # Exclude "lost" from scores if required
            afinn[word] = int(score)


# Function to compute sentiment score
def compute_action_score(text):
    tokens = word_tokenize(text.lower())
    score = sum(afinn.get(token, 0) for token in tokens)
    return score


# File path for the CSV
file_path = "santa.csv"

# Read and process the CSV data
goods = []
bads = []
school_grades = []
listened = []

total_school_grades = 0
total_listened = 0
count_school = 0
count_listened = 0

with open(file_path, 'r', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    header = next(csv_reader)  # Skip the header row
    for row in csv_reader:
        # Adjust indices based on your CSV structure
        goods.append(row[-2])
        bads.append(row[-1])

        # Calculate average for school grades
        if row[-3]:  # Check if the value is not empty
            total_school_grades += float(row[-3])
            count_school += 1

        # Calculate average for listened
        if row[-4]:  # Check if the value is not empty
            total_listened += float(row[-4])
            count_listened += 1

# Compute averages
school_average = total_school_grades / count_school if count_school > 0 else 0
listen_average = total_listened / count_listened if count_listened > 0 else 0

with open(file_path, 'r', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    header = next(csv_reader)
    for row in csv_reader:
        if row[-3] != '':
            school_grades.append(float(row[-3]))
        else:
            school_grades.append(school_average)
        if row[-4] != '':
            listened.append(float(row[-4]))
        else:
            listened.append(listen_average)

# Score the good actions
scored_goods = [[idx, compute_action_score(good)] for idx, good in enumerate(goods)]

# Adjust good action scores
min_good_score = abs(min(scored_goods, key=lambda x: x[1])[1]) + 1
for item in scored_goods:
    item[1] += min_good_score

# Score the bad actions
scored_bads = [[idx, compute_action_score(bad)] for idx, bad in enumerate(bads)]

# Combine scores for each student
combined_scores = []
for idx in range(len(scored_goods)):
    good_score = scored_goods[idx][1]
    bad_score = scored_bads[idx][1]
    total_score = good_score + bad_score
    combined_scores.append([idx, total_score])

# Normalize and combine scores
min_combined_score = abs(min(combined_scores, key=lambda x: x[1])[1])
for item in combined_scores:
    item[1] += min_combined_score

max_combined_score = max(combined_scores, key=lambda x: x[1])[1]
for idx in range(len(combined_scores)):
    normalized_score = combined_scores[idx][1] / (3 * max_combined_score)
    grade_component = school_grades[idx] / (3 * max(school_grades))
    listen_component = listened[idx] / (3 * listen_average)
    combined_scores[idx][1] = normalized_score + grade_component + listen_component

for idx in range(len(combined_scores)):
    combined_scores[idx][0] += 1
average = 0
# Print the final combined scores
for idx in range(len(combined_scores)):
    average += combined_scores[idx][1]

#return combined_scores, average