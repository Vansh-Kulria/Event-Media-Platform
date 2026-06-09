from deepface import DeepFace
import sys
import json

selfie_path = sys.argv[1]
photos_folder = sys.argv[2]

result = DeepFace.find(
    img_path=selfie_path,
    db_path=photos_folder,
    enforce_detection=False
)

matches = []

if len(result) > 0:
    df = result[0]

    for _, row in df.iterrows():
        matches.append(row["identity"])

print(json.dumps(matches))