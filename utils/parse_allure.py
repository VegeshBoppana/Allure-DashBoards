import os, json

def process_allure_folder(path):
    results = []
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith("-result.json"):
                with open(os.path.join(root, file)) as f:
                    data = json.load(f)
                    results.append({
                        "name": data.get("name"),
                        "tags": [label['value'] for label in data.get('labels', []) if label['name'] == 'tag'],
                        "steps": [(step['name'], step['stop'] - step['start']) for step in data.get('steps', []) if 'start' in step and 'stop' in step]
                    })
    with open("static/allure_data.json", "w") as f:
        json.dump(results, f)