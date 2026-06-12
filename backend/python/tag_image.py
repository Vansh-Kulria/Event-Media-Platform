import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import sys
import json
import warnings
warnings.filterwarnings("ignore")

import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
import cv2

# A dictionary mapping raw ImageNet labels/keywords to human-friendly social/event tags
FRIENDLY_VOCABULARY = {
    # Food & Dining
    "food": ["food", "dining", "gathering"],
    "dish": ["food", "dining"],
    "plate": ["food", "dining"],
    "wine": ["celebration", "drinks", "party", "gathering"],
    "beer": ["celebration", "drinks", "party", "gathering"],
    "cup": ["drinks", "dining"],
    "glass": ["drinks", "dining"],
    "mug": ["drinks", "dining"],
    "restaurant": ["dining", "indoor", "gathering"],
    "table": ["indoor", "dining"],

    # Attire, Fashion & People (implies human portraits/candids)
    "suit": ["formal", "people", "portrait", "attire"],
    "groom": ["formal", "wedding", "people", "celebration"],
    "bride": ["formal", "wedding", "people", "celebration"],
    "jean": ["people", "candid", "casual"],
    "t-shirt": ["people", "candid", "casual"],
    "sweatshirt": ["people", "candid", "casual"],
    "jersey": ["sports", "people", "active"],
    "sunglasses": ["people", "outdoor", "fashion"],
    "bow tie": ["formal", "fashion", "people"],
    "wig": ["people", "fun", "candid"],
    "hair": ["people", "portrait"],
    "face": ["people", "portrait"],

    # Concerts, Shows & Music
    "stage": ["music", "concert", "performance", "stage"],
    "microphone": ["music", "concert", "performance", "vocals"],
    "guitar": ["music", "concert", "performance", "instrument"],
    "piano": ["music", "performance", "instrument"],
    "drum": ["music", "performance", "instrument"],
    "spotlight": ["music", "concert", "stage", "light"],

    # Nature, Scenery & Outdoors
    "valley": ["nature", "outdoor", "landscape"],
    "mountain": ["mountains", "nature", "outdoor", "landscape"],
    "alp": ["mountains", "nature", "outdoor", "landscape"],
    "beach": ["beach", "sea", "ocean", "nature", "outdoor"],
    "sea": ["beach", "sea", "ocean", "nature", "outdoor"],
    "cliff": ["nature", "outdoor", "landscape"],
    "forest": ["forest", "trees", "nature", "outdoor"],
    "tree": ["trees", "nature", "outdoor"],
    "park": ["park", "nature", "outdoor"],
    "lakeside": ["nature", "outdoor", "lake"],
    "flower": ["nature", "outdoor", "floral"],
    "garden": ["nature", "outdoor", "garden"],

    # Buildings & Interiors
    "palace": ["architecture", "building"],
    "castle": ["architecture", "building"],
    "church": ["architecture", "building"],
    "classroom": ["indoor", "education"],
    "office": ["indoor", "workplace"],
    "library": ["indoor", "education"],

    # Sports & Activities
    "ball": ["sports", "active", "game"],
    "racket": ["sports", "active"],
    "running": ["sports", "active"],
    "swimming": ["sports", "active"],

    # Tech & Workplace
    "cellular telephone": ["people", "technology", "candid"],
    "laptop": ["indoor", "technology", "work"],
    "notebook": ["indoor", "work"],
    "computer": ["indoor", "technology"],

    # Vehicles & Transport
    "car": ["vehicle", "transport", "outdoor"],
    "cab": ["vehicle", "transport", "outdoor"],
    "limousine": ["vehicle", "transport", "outdoor"],
    "motorcycle": ["vehicle", "transport", "outdoor"],
    "bicycle": ["vehicle", "transport", "outdoor"],
    "truck": ["vehicle", "transport", "outdoor"],
    "bus": ["vehicle", "transport", "outdoor"],

    # Animals & Pets
    "dog": ["animals", "pets", "outdoor"],
    "cat": ["animals", "pets", "indoor"],
    "horse": ["animals", "nature", "outdoor"],
    "bird": ["animals", "nature", "outdoor"],
}

def map_predictions_to_friendly_tags(decoded_preds):
    friendly_tags = set()
    
    # Match against our friendly vocabulary dictionary (minimum 10% confidence for better accuracy)
    for _, label, prob in decoded_preds:
        if prob > 0.10:
            label_lower = label.replace('_', ' ').lower()
            
            # Check for direct or partial keyword matches in friendly vocabulary
            for keyword, mapped_tags in FRIENDLY_VOCABULARY.items():
                if keyword in label_lower:
                    for tag in mapped_tags:
                        friendly_tags.add(tag)

    # General inference rules if no friendly tags were matched
    if len(friendly_tags) == 0:
        # Check top prediction
        top_label = decoded_preds[0][1].replace('_', ' ').lower()
        
        # If it's a typical portrait context (clothing/accessories/human traits)
        portrait_indicators = ["suit", "t-shirt", "jean", "jersey", "sunglasses", "wig", "hair", "mortarboard", "groom", "bride", "gown", "kimono"]
        if any(ind in top_label for ind in portrait_indicators):
            friendly_tags.update(["people", "portrait", "candid"])
        else:
            # Fallback to general event/photo tags
            friendly_tags.update(["event", "gathering", "people"])

    return list(friendly_tags)

def tag_image(img_path):
    try:
        # Handle video format check
        ext = os.path.splitext(img_path)[1].lower()
        if ext in ['.mp4', '.mov', '.webm', '.avi', '.mkv']:
            cap = cv2.VideoCapture(img_path)
            frame = None
            # Skip potential leading black/fade-in frames (up to 30 frames)
            for _ in range(30):
                success, f = cap.read()
                if not success:
                    break
                frame = f
                if np.mean(f) > 15:
                    break
            cap.release()
            
            if frame is not None:
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img_resized = cv2.resize(frame_rgb, (224, 224))
                x = img_resized.astype(np.float32)
                x = np.expand_dims(x, axis=0)
                x = preprocess_input(x)
            else:
                raise Exception("Could not read any frames from video")
        else:
            # Standard image load
            img = image.load_img(img_path, target_size=(224, 224))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)

        model = MobileNetV2(weights='imagenet')
        preds = model.predict(x, verbose=0)
        decoded = decode_predictions(preds, top=5)[0]

        return map_predictions_to_friendly_tags(decoded)
    except Exception as e:
        print(f"Tagging error: {e}", file=sys.stderr)
        return ["people", "portrait", "candid"]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(1)
        
    img_path = sys.argv[1]
    tags = tag_image(img_path)
    print(json.dumps(tags))

