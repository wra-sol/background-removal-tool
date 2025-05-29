from PIL import Image
import spaces
from transformers import AutoModelForImageSegmentation
import torch
from torchvision import transforms
import pillow_heif  

torch.set_float32_matmul_precision(["high", "highest"][0])

pillow_heif.register_heif_opener()

device = "cuda" if torch.cuda.is_available() else "cpu"

birefnet = AutoModelForImageSegmentation.from_pretrained(
    "ZhengPeng7/BiRefNet", trust_remote_code=True
)
birefnet.to(device)

transform_image = transforms.Compose(
    [
        transforms.Resize((1024, 1024)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

def fn(image):
    im = Image.open(image)
    im = im.convert("RGB")
    origin = im.copy()
    processed_image = process(im)
    return (processed_image, origin)

@spaces.GPU
def process(image):
    image_size = image.size
    input_images = transform_image(image).unsqueeze(0).to(device)
    # Prediction
    with torch.no_grad():
        preds = birefnet(input_images)[-1].sigmoid().cpu()
    pred = preds[0].squeeze()
    pred_pil = transforms.ToPILImage()(pred)
    mask = pred_pil.resize(image_size)
    image.putalpha(mask)
    return image

def process_file(f):
    name_path = f.rsplit(".", 1)[0] + ".png"
    im = Image.open(f)
    im = im.convert("RGB")
    transparent = process(im)
    transparent.save(name_path)
    return name_path

if __name__ == "__main__":
    import sys
    if len(sys.argv) == 3:
        input_file, output_file = sys.argv[1], sys.argv[2]
        im = Image.open(input_file)
        im = im.convert("RGB")
        transparent = process(im)
        transparent.save(output_file)
    else:
        print("Usage: python app.py <input_file> <output_file>")