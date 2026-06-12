import os
import glob
from deepface import DeepFace
import sys
import json

selfie_path = sys.argv[1]
photos_folder = sys.argv[2]

# Ensure photos folder exists and contains images
if not os.path.exists(photos_folder) or not os.path.isdir(photos_folder):
    print(json.dumps([]))
    sys.exit(0)

# Check if there is at least one image file to search against
image_extensions = ('*.jpg', '*.jpeg', '*.png', '*.webp', '*.JPG', '*.JPEG', '*.PNG', '*.WEBP')
has_images = False
for ext in image_extensions:
    if len(glob.glob(os.path.join(photos_folder, ext))) > 0:
        has_images = True
        break

if not has_images:
    print(json.dumps([]))
    sys.exit(0)

# Delete stale DeepFace representation cache files to force re-indexing of newly uploaded photos
for pkl_file in glob.glob(os.path.join(photos_folder, "*.pkl")):
    try:
        os.remove(pkl_file)
    except Exception as e:
        print(f"Warning: could not remove cache file {pkl_file}: {e}", file=sys.stderr)

try:
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
except Exception as e:
    print(f"DeepFace find error: {e}", file=sys.stderr)
    print(json.dumps([]))