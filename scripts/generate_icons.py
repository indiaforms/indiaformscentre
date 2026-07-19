from PIL import Image
import os

base_dir = r"c:\Users\hp\Documents\IFC\public"
logo_path = os.path.join(base_dir, "logo.jpg")

if os.path.exists(logo_path):
    img = Image.open(logo_path)
    # Convert to RGBA for PNG
    img = img.convert("RGBA")
    
    # Generate 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(base_dir, "icon-192x192.png"))
    
    # Generate 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(os.path.join(base_dir, "icon-512x512.png"))
    print("Icons generated successfully!")
else:
    print("Logo not found at", logo_path)
