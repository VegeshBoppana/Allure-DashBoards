from flask import Flask, request, render_template, redirect, url_for
import os, shutil
import json

app = Flask(__name__)
UPLOAD_FOLDER = "allure_reports"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def parse_allure_folder(path):
    data = []
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith("-result.json"):
                with open(os.path.join(root, file)) as f:
                    json_data = json.load(f)
                    data.append({
                        "tcid": json_data.get("name", ""),
                        "tags": [lbl["value"] for lbl in json_data.get("labels", []) if lbl["name"] == "tag"],
                        "steps": [
                            (step["name"], step["stop"] - step["start"])
                            for step in json_data.get("steps", [])
                            if "start" in step and "stop" in step
                        ]
                    })
    with open("static/allure_data.json", "w") as out:
        json.dump(data, out)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    folder_path = os.path.join(app.config['UPLOAD_FOLDER'], "latest")
    shutil.rmtree(folder_path, ignore_errors=True)
    os.makedirs(folder_path, exist_ok=True)

    report_files = request.files.getlist("report_folder")
    for f in report_files:
        if not f.filename.strip(): continue
        save_path = os.path.join(folder_path, f.filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        f.save(save_path)

    parse_allure_folder(folder_path)
    return redirect(url_for("charts"))

@app.route("/charts")
def charts():
    return render_template("charts.html")

@app.route("/charts/tag")
def tag_chart():
    return render_template("tag_chart.html")

@app.route("/charts/variation")
def step_variation():
    return render_template("step_variation.html")

# Add if needed:
# @app.route("/charts/heatmap")
# def heatmap():
#     return render_template("heatmap.html")

if __name__ == "__main__":
    app.run(debug=True)
