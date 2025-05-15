from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging
import base64
import os
from datetime import datetime
import pytesseract
from PIL import Image
import io

# set logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Image Server")

# set cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# create upload directory
UPLOAD_DIR = "uploaded_images"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class ImageRequest(BaseModel):
    image: str  # base64 encoded image

class ImageResponse(BaseModel):
    success: bool
    message: str
    error: str = None
    filename: str = None

@app.get("/")
async def root():
    return {"message": "Server is running"}

@app.post("/ocr", response_model=ImageResponse)
async def process_image(request: ImageRequest):
    try:
        logger.debug("Received image request")
        
        # decode base64 image data
        try:
            image_data = base64.b64decode(request.image)
            logger.debug(f"Decoded image size: {len(image_data)} bytes")
        except Exception as e:
            logger.error(f"Failed to decode base64 image: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid image data")

        # save image file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"image_{timestamp}.jpg"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(image_data)
        logger.debug(f"Image saved to: {filepath}")

        # convert to PIL Image object
        image = Image.open(io.BytesIO(image_data))
        
        # run ocr
        try:
            text = pytesseract.image_to_string(image, lang='eng')
            logger.debug(f"Extracted text: {text}")
            
            # check if the text is empty
            if not text.strip():
                return ImageResponse(
                    success=True,
                    message="cannot find text in the image",
                    filename=filename
                )
            
            return ImageResponse(
                success=True,
                message=f"extracted text: {text.strip()}",
                filename=filename
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            return ImageResponse(
                success=False,
                message="OCR 처리 중 오류가 발생했습니다.",
                error=str(e),
                filename=filename
            )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # start server
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # restart server when code is changed
    ) 