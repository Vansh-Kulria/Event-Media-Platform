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

def tag_image(img_path):
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)

        model = MobileNetV2(weights='imagenet')
        preds = model.predict(x, verbose=0)
        decoded = decode_predictions(preds, top=5)[0]

        tags = []
        for (imagenet_id, label, prob) in decoded:
            if prob > 0.08:
                clean_label = label.replace('_', ' ').strip()
                tags.append(clean_label)
        
        if not tags and decoded:
            tags.append(decoded[0][1].replace('_', ' ').strip())
            
        return tags
    except Exception as e:
        return ["photo", "event"]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(1)
        
    img_path = sys.argv[1]
    tags = tag_image(img_path)
    print(json.dumps(tags))
