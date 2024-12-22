import csv
import json

def csv_to_json(csv_file_path, json_file_path):
    """Converts a CSV file to a JSON file."""
    data = []

    with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            # Convert numeric values from strings to appropriate types
            for key in row:
                try:
                    if row[key] and key not in ['Name', 'Location', 'Country', 'Gift_Preference', 'Horn Message', 'Good_Deed', 'Bad_Deed', 'Gift']:
                        row[key] = float(row[key]) if '.' in row[key] else int(row[key])
                except ValueError:
                    pass

            data.append(row)

    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)

# Convert santa2.csv
csv_to_json('santa2.csv', 'santa2.json')

# Convert gifts.csv
csv_to_json('gifts.csv', 'gifts.json')

print("CSV files have been successfully converted to JSON!")
