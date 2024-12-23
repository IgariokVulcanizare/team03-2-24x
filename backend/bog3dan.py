import csv
from collections import defaultdict
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk import NaiveBayesClassifier

# Ensure NLTK resources are downloaded
nltk.download('stopwords')
nltk.download('punkt')

# Limit processing to the first 200 kids
gifts = []
kids = []

with open("santa.csv", 'r', encoding='utf-8') as file:
    csv_reader = csv.reader(file)
    header = next(csv_reader)
    for i, row in enumerate(csv_reader):
        if i >= 200:  # Limit to the first 200 rows
            break
        kids.append((row[0], row[1], row[7]))  # Store kid's ID, name, and desired gift
        gifts.append(row[7])

# Sample training dataset
training_data = [
    ('Door Basketball Hoop', 'Toys and Vehicles'),
    ('Rhythm Tambourine', 'Musical Instruments'),
    ('School House Pack', 'Educational Kits'),
    ('Wireless Headphones', 'Musical Instruments'),
    ('Rocket Building Set', 'Games and Puzzles'),
    ('Beauty Salon Set', 'Toys and Vehicles'),
    ('Music Mixing Set', 'Musical Instruments'),
    ('Cooking Master Kit', 'Food Cooking'),
    ('Performance Microphone', 'Musical Instruments'),
    ('Diamond Dig Set', 'Games and Puzzles'),
]

# Define stopwords
stop_words = set(stopwords.words('english'))

def extract_features(text):
    """
    Extract features from the text by tokenizing, removing stopwords,
    and creating a bag-of-words feature dictionary.
    """
    words = word_tokenize(text.lower())
    filtered_words = [word for word in words if word.isalpha() and word not in stop_words]
    features = {word: True for word in filtered_words}
    return features

# Prepare the training set
training_set = [(extract_features(text), category) for (text, category) in training_data]

# Train the classifier
classifier = NaiveBayesClassifier.train(training_set)

def classify_product_with_uncategorized(text, threshold=0.5):
    """
    Classify a product and return 'uncategorized' if the confidence is below the threshold.
    """
    features = extract_features(text)
    probabilities = classifier.prob_classify(features)
    top_category = probabilities.max()
    top_prob = probabilities.prob(top_category)
    if top_prob < threshold:
        return 'uncategorized'
    else:
        return top_category

def categorize_gift(gift_name):
    """
    Fallback categorization using keywords if classification fails.
    """
    if any(keyword in gift_name.lower() for keyword in ['music', 'instrument', 'drum', 'guitar', 'piano', 'violin', 'trumpet']):
        return 'Musical Instruments'
    elif any(keyword in gift_name.lower() for keyword in ['art', 'drawing', 'painting', 'craft', 'sculpture']):
        return 'Arts and Crafts'
    elif any(keyword in gift_name.lower() for keyword in ['science', 'lab', 'kit', 'biology', 'robot', 'engineering']):
        return 'Educational Kit'
    elif any(keyword in gift_name.lower() for keyword in ['game', 'board', 'puzzle', 'strategy', 'trivia']):
        return 'Games and Puzzles'
    elif any(keyword in gift_name.lower() for keyword in ['outdoor', 'camping', 'hiking', 'adventure', 'fishing']):
        return 'Outdoor Activities'
    elif any(keyword in gift_name.lower() for keyword in ['toy', 'figure', 'doll', 'lego', 'action', 'vehicle']):
        return 'Toys and Vehicles'
    elif any(keyword in gift_name.lower() for keyword in ['kitchen', 'cooking', 'food', 'baking']):
        return 'Food Cooking'
    elif any(keyword in gift_name.lower() for keyword in ['animal', 'zoo', 'farm', 'wildlife', 'pet']):
        return 'Animal and Nature'
    else:
        return 'Miscellaneous'

categorized_gifts = defaultdict(list)
unknowns = []

# Categorize each gift with fallback
for kid_id, kid_name, gift in kids:
    category = classify_product_with_uncategorized(gift)
    if category == 'uncategorized':
        category = categorize_gift(gift)
    categorized_gifts[category].append((kid_id, kid_name, gift))

# Save categorized gifts to a CSV file
output_file = "categorized_gifts.csv"
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(['Category', 'Kid ID', 'Kid Name', 'Gift'])
    for category, items in categorized_gifts.items():
        for kid_id, kid_name, gift in items:
            csv_writer.writerow([category, kid_id, kid_name, gift])

print(f"Categorized gifts saved to {output_file}.")
