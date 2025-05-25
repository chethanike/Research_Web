from flask import Flask, request, send_file, jsonify, render_template
from datetime import datetime
import random, math, re, os

# Initialize Flask app
app = Flask(__name__)

# Configuration constants
KEYSIZE = 8                    
TOP_N_KEYS = 15               
KEY_FILE = "uploaded_keys.txt"  # Where uploaded keys are stored
GENERATED_FILE = "generated_keys.txt"  # Where generated keys are saved

# Converts a date and time string into a Unix timestamp
def convert_to_timestamp(date_string, time_string):
    dt = datetime.strptime(f"{date_string} {time_string}", "%Y-%m-%d %H:%M:%S")
    return int(dt.timestamp())

# Generates keys for each second between two timestamps and saves them to a file
def generate_keys_to_file(start_timestamp, end_timestamp, filename):
    with open(filename, "w") as file:
        for t in range(start_timestamp, end_timestamp + 1):
            random.seed(t)  # Seed RNG with timestamp
            key = [random.randint(0, 255) for _ in range(KEYSIZE)]  # Generate 8 random bytes
            file.write("".join(f"{byte:02x}" for byte in key) + "\n")  # Save as hex string

# Loads keys from a file and returns them as lists of byte values
def load_keys(filename):
    with open(filename, "r") as file:
        return [[int(line[i:i+2], 16) for i in range(0, len(line.strip()), 2)] for line in file]

# Calculates byte-level similarity between two keys
def calculate_character_similarity(user_key, generated_key):
    match_count = sum(1 for u, g in zip(user_key, generated_key) if u == g)
    return (match_count / KEYSIZE) * 100  # Return similarity in %

# Finds the top 20 keys most similar to the user's key
def find_top_20_keys(user_key, generated_keys):
    sorted_keys = sorted(
        [(calculate_character_similarity(user_key, g_key), g_key) for g_key in generated_keys],
        key=lambda x: x[0], reverse=True  # Sort by similarity descending
    )
    return sorted_keys[:TOP_N_KEYS]

# Converts a key to a 64-bit binary string
def key_to_binary(key):
    return ''.join(format(byte, '08b') for byte in key)

# Computes Euclidean distance between two binary strings of keys
def euclidean_distance_binary(key1, key2):
    return math.sqrt(sum((int(b1) - int(b2)) ** 2 for b1, b2 in zip(key_to_binary(key1), key_to_binary(key2))))

# Finds the most similar key (in top ) based on Euclidean distance in binary
def find_most_similar_key_binary(user_key, top_20_keys):
    return min([(euclidean_distance_binary(user_key, k), k) for _, k in top_20_keys], key=lambda x: x[0])

# Home page
@app.route("/")
def index():
    return render_template("index.html")

# API to generate keys based on time range
@app.route("/generate_keys", methods=["POST"])
def api_generate_keys():
    data = request.json
    start_ts = convert_to_timestamp(data["startDate"], data["startTime"])
    end_ts = convert_to_timestamp(data["endDate"], data["endTime"])
    generate_keys_to_file(start_ts, end_ts, GENERATED_FILE)
    return jsonify({"message": "Keys generated.", "download": "/download_keys"})

# Endpoint to download the generated keys file
@app.route("/download_keys")
def download_keys():
    return send_file(GENERATED_FILE, as_attachment=True)

# Upload user-supplied keys for matching
@app.route("/upload_keys", methods=["POST"])
def upload_keys():
    file = request.files["file"]
    if file and file.filename.endswith(".txt"):
        file.save(KEY_FILE)
        return jsonify({"message": "File uploaded successfully."})
    return jsonify({"error": "Only .txt files allowed."}), 400

# Endpoint to match a user-supplied key with uploaded/generated keys
@app.route("/match_key", methods=["POST"])
def match_key():
    data = request.json
    user_input = data["userKey"]

    # Validate hex format (must be 16 characters = 8 bytes)
    if not re.fullmatch(r"[0-9a-fA-F]{16}", user_input):
        return jsonify({"error": "Invalid key format."}), 400

    # Convert user's input to byte array
    user_key = [int(user_input[i:i+2], 16) for i in range(0, len(user_input), 2)]

    # Load keys from uploaded file
    try:
        keys = load_keys(KEY_FILE)
    except FileNotFoundError:
        return jsonify({"error": "Key file not found."}), 400

    # Get top 20 closest keys (byte similarity)
    top_20 = find_top_20_keys(user_key, keys)

    # Among the top 20, find the most similar using binary Euclidean distance
    closest_distance, closest_key = find_most_similar_key_binary(user_key, top_20)

    # Calculate max theoretical distance (for normalization)
    max_binary_distance = math.sqrt( KEYSIZE * 8)

    # Convert distance to similarity percentage
    binary_similarity = (1 - closest_distance / max_binary_distance) * 100

    # Flag if key is too similar (>65%)
    status = "vulnerable" if binary_similarity > 65 else "secure"

    # Respond with top matches and similarity details
    return jsonify({
        "topKeys": [{"key": "".join(f"{b:02x}" for b in k), "similarity": round(sim, 2)} for sim, k in top_20],
        "closestKey": "".join(f"{b:02x}" for b in closest_key),
        "binarySimilarity": round(binary_similarity, 2),
        "status": status
    })

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
