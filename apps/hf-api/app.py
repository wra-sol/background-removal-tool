import io
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image
from transformers import AutoModelForImageSegmentation
import torch
from torchvision import transforms
import pillow_heif

app = FastAPI()

torch.set_float32_matmul_precision(["high", "highest"][0])
pillow_heif.register_heif_opener()

device = "cuda" if torch.cuda.is_available() else "cpu"
birefnet = AutoModelForImageSegmentation.from_pretrained(
    "ZhengPeng7/BiRefNet",
    trust_remote_code=True
)
birefnet.to(device)

transform_image = transforms.Compose(
    [
        transforms.Resize((1024, 1024)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)

def process(image):
    image_size = image.size
    input_images = transform_image(image).unsqueeze(0).to(device)
    with torch.no_grad():
        preds = birefnet(input_images)[-1].sigmoid().cpu()
    pred = preds[0].squeeze()
    pred_pil = transforms.ToPILImage()(pred)
    mask = pred_pil.resize(image_size)
    image.putalpha(mask)
    return image

@app.post("/segment")
async def segment(file: UploadFile = File(...)):
    print("[app.py] Received file:", file.filename)
    try:
        im = Image.open(file.file)
        im = im.convert("RGB")
        print("[app.py] Image converted to RGB")
        transparent = process(im)
        print("[app.py] Image processed and alpha mask applied")
        buf = io.BytesIO()
        transparent.save(buf, format="PNG")
        buf.seek(0)
        print("[app.py] Image saved to buffer, returning response")
        return StreamingResponse(buf, media_type="image/png") 
    except Exception as e:
        print(f"[app.py] Error during processing: {e}")
        raise 