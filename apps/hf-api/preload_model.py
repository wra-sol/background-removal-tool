from transformers import AutoModelForImageSegmentation

print("Preloading BiRefNet model...")
AutoModelForImageSegmentation.from_pretrained(
    "ZhengPeng7/BiRefNet",
    trust_remote_code=True
)
print("Model preloaded successfully!") 