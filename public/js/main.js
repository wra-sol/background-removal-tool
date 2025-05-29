const form = document.getElementById("uploadForm");
const loading = document.getElementById("loading");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const resultImg = document.getElementById("result");
const errorMsg = document.getElementById("errorMsg");
const downloadBtn = document.getElementById("downloadBtn");
const imageUpload = document.getElementById("imageUpload"); // Get the input element
const fileNameSpan = document.getElementById("file-name"); // Get the span
const dropZone = document.getElementById("drop-zone");
const dropZoneText = document.getElementById("drop-zone-text");
const pasteBtn = document.getElementById("pasteBtn");
const originalPreview = document.getElementById("originalPreview");

resetBtn.addEventListener("click", () => {
  imageUpload.value = "";
  fileNameSpan.textContent = "No file chosen";
  showOriginalPreview(null);
  setFileList(null);
  resultImg.style.display = "none";
  downloadBtn.style.display = "none";
  errorMsg.style.display = "none";
  errorMsg.textContent = "";
  loading.style.display = "none";
  submitBtn.disabled = false;
});

dropZone.addEventListener("click", (e) => {
  // Prevent click if the paste button (or its children) was clicked
  if (e.target.closest && e.target.closest("#pasteBtn")) return;
  imageUpload.click();
});
dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    imageUpload.click();
  }
});
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
  dropZoneText.textContent = "Drop image here";
});
dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  dropZoneText.textContent = "Drop image here or click to upload";
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  dropZoneText.textContent = "Drop image here or click to upload";
  setFileList(e.dataTransfer.files);
});
imageUpload.addEventListener("change", function () {
  setFileList(this.files);
});

function setFileInput(file) {
  if (!file) {
    imageUpload.value = "";
    fileNameSpan.textContent = "No file chosen";
    showOriginalPreview(null);
    return;
  }
  const dt = new DataTransfer();
  dt.items.add(file);
  imageUpload.files = dt.files;
  fileNameSpan.textContent = file.name || "Pasted image";
  showOriginalPreview(file);
}
function setFileList(files) {
  if (files && files.length > 0) {
    setFileInput(files[0]);
  } else {
    setFileInput(null);
  }
}
function showOriginalPreview(file) {
  if (!file) {
    originalPreview.style.display = "none";
    originalPreview.src = "";
    return;
  }
  const url = URL.createObjectURL(file);
  originalPreview.src = url;
  originalPreview.style.display = "block";
}
document.addEventListener("paste", (e) => {
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      setFileInput(file);
      break;
    }
  }
});
dropZone.addEventListener("paste", (e) => {
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      setFileInput(file);
      break;
    }
  }
});

pasteBtn.addEventListener("click", async () => {
  if (!navigator.clipboard || !navigator.clipboard.read) {
    alert("Clipboard image paste is not supported in this browser.");
    return;
  }
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith("image/")) {
          const blob = await item.getType(type);
          const file = new File([blob], "clipboard-image.png", { type });
          setFileInput(file);
          return;
        }
      }
    }
    alert("No image found in clipboard.");
  } catch (err) {
    alert("Failed to read clipboard: " + err);
  }
});

form.onsubmit = async (e) => {
  e.preventDefault();
  loading.style.display = "inline-block";
  submitBtn.disabled = true;
  resultImg.style.display = "none";
  errorMsg.style.display = "none";
  errorMsg.textContent = "";
  const formData = new FormData(e.target);
  try {
    const res = await fetch("/process", { method: "POST", body: formData });
    loading.style.display = "none";
    submitBtn.disabled = false;
    if (res.ok) {
      const blob = await res.blob();
      resultImg.src = URL.createObjectURL(blob);
      resultImg.style.display = "block";
      downloadBtn.style.display = "inline-block";
      downloadBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = resultImg.src;
        a.download = "processed.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
    } else {
      errorMsg.textContent = "Processing failed. Please try another image.";
      errorMsg.style.display = "block";
      downloadBtn.style.display = "none";
    }
  } catch (err) {
    loading.style.display = "none";
    submitBtn.disabled = false;
    errorMsg.textContent = "Network error. Please check your connection.";
    errorMsg.style.display = "block";
    downloadBtn.style.display = "none";
  }
};
