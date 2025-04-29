from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import base64
from groq import Groq
import imghdr
import logging
import os
from dotenv import load_dotenv
import json
from openai import OpenAI
from io import BytesIO

app = FastAPI(title="Image Analysis and Generation API")

# Load environment variables from .env
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq client with API key from environment variable
groq_api_key = os.getenv("GROQ_API_KEY", "")
if not groq_api_key:
    logger.error("GROQ_API_KEY environment variable not set.")
    raise Exception("GROQ_API_KEY environment variable not set.")
groq_client = Groq(api_key=groq_api_key)

# Initialize OpenAI client with API key from environment variable
openai_api_key = os.getenv("OPENAI_API_KEY", "")
if not openai_api_key:
    logger.error("OPENAI_API_KEY environment variable not set.")
    raise Exception("OPENAI_API_KEY environment variable not set.")
openai_client = OpenAI(api_key=openai_api_key)

def encode_image_to_data_url(image_bytes: bytes, image_type: str) -> str:
    """Encodes image bytes to a Data URL."""
    encoded_str = base64.b64encode(image_bytes).decode('utf-8')
    return f"data:image/{image_type};base64,{encoded_str}"

def analyze_material(image_bytes: bytes) -> dict:
    """Analyzes the material image and returns its properties as a dictionary."""
    # Validate image
    image_type = imghdr.what(None, h=image_bytes[:512])
    if image_type is None:
        logger.error("Uploaded file is not a valid image.")
        raise ValueError("Invalid image file.")
    
    # Encode to data URL
    data_url = encode_image_to_data_url(image_bytes, image_type)
    
    # Prepare message for Groq API
    Input_Prompt = """
    Here is an image of a material, now you have to, Identify the type of the material,
    colour, properties and where it can be used and respond in a JSON format.
    Output = {
        "Material": "Material Type",
        "Colour": "Colour",
        "Properties": "Properties",
        "Uses": "Potential Uses"
    }
    When it comes to Properties, think about the characteristics of the material and provide a brief description.
    Respond with the JSON output.
    """
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": Input_Prompt
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": data_url
                    }
                }
            ]
        }
    ]
    
    # Call Groq API
    completion = groq_client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=messages,
        temperature=1,
        max_tokens=4192,
        top_p=1,
        stream=False,
        response_format={"type": "json_object"},
        stop=None,
    )
    
    # Extract and parse response
    response = completion.choices[0].message.content
    try:
        response_json = json.loads(response)
        logger.info(f"Parsed JSON Response: {response_json}")
        return response_json
    except json.JSONDecodeError:
        logger.error("Groq API response content is not valid JSON.")
        raise ValueError("Groq API did not return valid JSON.")

@app.post("/analyze-image", response_class=JSONResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    Endpoint to upload an image and receive its analysis in JSON format.

    - **file**: Image file to be analyzed.
    """
    try:
        # Read image bytes with initial validation
        header = await file.read(512)
        image_type = imghdr.what(None, h=header)
        await file.seek(0)  # Reset file pointer
        if image_type is None:
            logger.error("Uploaded file is not a valid image.")
            raise HTTPException(status_code=400, detail="Invalid image file.")
        
        image_bytes = await file.read()
        
        # Analyze material
        analysis = analyze_material(image_bytes)
        return JSONResponse(content=analysis)
    except Exception as e:
        logger.exception("Error in analyze_image endpoint.")
        raise HTTPException(status_code=500, detail="Error analyzing image.") from e

@app.post("/generate-image")
async def generate_image(material_image: UploadFile = File(...), base_image: UploadFile = File(...)):
    """
    Endpoint to generate a new image based on material analysis and a base image.

    - **material_image**: Image file of the material to analyze.
    - **base_image**: Image file to transform based on material properties.
    """
    try:
        # Read image bytes
        material_bytes = await material_image.read()
        base_bytes = await base_image.read()
        
        # Validate base image
        base_image_type = imghdr.what(None, h=base_bytes[:512])
        if base_image_type is None:
            logger.error("Base image is not a valid image.")
            raise HTTPException(status_code=400, detail="Invalid base image file.")
        
        # Analyze material
        analysis = analyze_material(material_bytes)
        
        # Create prompt from analysis
        material = analysis.get("Material", "unknown")
        colour = analysis.get("Colour", "unknown")
        properties = analysis.get("Properties", "unknown")
        prompt = f"Transform this image to look like it's made of {material}, with {colour} color and {properties}."
        
        # Call OpenAI API with base image as a file-like object
        base_image_file = BytesIO(base_bytes)
        base_image_file.name = f"base_image.{base_image_type}"
        
        result = openai_client.images.edit(
            model="gpt-image-1",  # Use an appropriate OpenAI model for image editing
            image=base_image_file,
            prompt=prompt,
        )
        
        # Get the generated image
        image_base64 = result.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)
        
        # Return the image bytes
        return Response(content=image_bytes, media_type="image/png")
    except ValueError as ve:
        logger.exception("Value error in generate_image endpoint.")
        raise HTTPException(status_code=400, detail=str(ve)) from ve
    except Exception as e:
        logger.exception("Error in generate_image endpoint.")
        raise HTTPException(status_code=500, detail="Error generating image.") from e