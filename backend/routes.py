from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel, EmailStr, Field, validator
from database import users_collection
from passlib.context import CryptContext
import os
from datetime import datetime, timedelta
import jwt
from typing import Optional
from database import jobs_collection
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
import math
from datetime import datetime, timedelta
from fastapi import Query
from pymongo.collection import Collection
from typing import Literal
from collections import Counter
import traceback
import logging
from pymongo.errors import OperationFailure
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel
import random, re

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)

router = APIRouter()

# ================= Authentication Setup =================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBasic()

# Security config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ================= Models =================
class UserCreate(BaseModel):
    full_name: str = Field(..., example="John Doe")
    email: EmailStr = Field(..., example="user@example.com")
    password: str = Field(..., example="SecurePass123!")

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str

# Create a Pydantic model to handle the form data (optional, depending on the complexity of validation)
class EligibilityData(BaseModel):
    job_title: str
    experience_level: str
    resume: str  # We'll just mock the resume processing for now

# ================= Utility Functions =================
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

# ================= Auth Routes =================
@router.post("/api/v1/auth/register", response_model=dict, status_code=201)
async def register(user: UserCreate):
    """
    Register a new user account
    """
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "disabled": False,
        "created_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
        
    return {"message": "User created successfully"}

@router.post("/api/v1/auth/login", response_model=Token)
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with email and password to get access token
    """
    user = users_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )
    
    # Set cookie for session management
    response.set_cookie(
        key="session_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=False,  # Set to True in production
        samesite="lax"
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/api/v1/auth/me", response_model=dict)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user profile
    """
    return {
        "email": current_user["email"],
        "full_name": current_user.get("full_name", ""),
        "created_at": current_user.get("created_at")
    }

@router.post("/api/v1/auth/logout")
async def logout(response: Response):
    """
    Logout by clearing the session cookie
    """
    response.delete_cookie("session_token")
    return {"message": "Successfully logged out"}

# ================= Job Search Route =================
# Helper function to serialize ObjectId to string
def serialize_objectid(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

# Route to fetch job details
def sanitize_floats(data):
    def sanitize(obj):
        if isinstance(obj, float):
            if math.isinf(obj) or math.isnan(obj):
                return None
        elif isinstance(obj, dict):
            return {k: sanitize(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [sanitize(i) for i in obj]
        return obj
    return sanitize(data)

def sanitizer(obj):
    if isinstance(obj, float):
        if math.isinf(obj) or math.isnan(obj):
            return None
    elif isinstance(obj, dict):
        return {k: sanitizer(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitizer(i) for i in obj]
    return obj

@router.get("/api/v1/jobs")
async def get_job_details(company: str, job_title: str):
    job_details = jobs_collection.find_one({
        "companyName": {"$regex": f"^{company}$", "$options": "i"},
        "title": {"$regex": f"^{job_title}$", "$options": "i"}
    })

    if not job_details:
        raise HTTPException(status_code=404, detail="Job not found")

    job_details = jsonable_encoder(job_details, custom_encoder={ObjectId: str})
    
    sanitized_details = sanitizer(job_details)
    return JSONResponse(content=sanitized_details)

from bson import ObjectId
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import math

@router.get("/api/v1/jobs/all")
async def get_all_jobs(
    company: Optional[str] = None,
    job_title: Optional[str] = None,
    location: Optional[str] = None,
    contract_type: Optional[str] = None,
    work_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    sector: Optional[str] = None,
):
    query = {}
    if company:
        query["companyName"] = {"$regex": f"^{company}$", "$options": "i"}
    if job_title:
        query["title"] = {"$regex": f"^{job_title}$", "$options": "i"}
    if location:
        query["location"] = {"$regex": f"^{location}$", "$options": "i"}
    if contract_type:
        query["contractType"] = contract_type
    if work_type:
        query["workType"] = work_type
    if experience_level:
        query["experienceLevel"] = experience_level
    if sector:
        query["sector"] = sector

    job_details = jobs_collection.find(query if query else {}).limit(20)  # Limit for performance
    job_list = list(job_details)

    if not job_list:
        raise HTTPException(status_code=404, detail="No jobs found")

    job_list = jsonable_encoder(job_list, custom_encoder={ObjectId: str})
    job_list = sanitize_floats(job_list)
    return JSONResponse(content=job_list)


# ================= StatsCharts Route =================
@router.get("/api/v1/statscharts")
async def get_job_stats():
    try:
        pipeline = [
            {
                "$project": {
                    "contractType": 1,
                    "workType": 1,
                    "experienceLevel": 1,
                    "sector": 1,
                    "title": 1 ,
                    "companyName": 1,
                    "location": {
                        "$arrayElemAt": [{"$split": ["$location", ","]}, 0]
                    },
                    "applicationsCount": 1,
                    "month": {
                        "$toString": "$publishedAt"  # publishedAt is a numeric year
                    },
                    "skills": {
                        "$regexFindAll": {
                            "input": "$title",
                            "regex": "(AI|ML|Engineer|Data Scientist)",
                            "options": "i"
                        }
                    }
                }
            },
            {
                "$match": {
                    "applicationsCount": {"$gte": 0}
                }
            },
            {
                "$facet": {
                    "contractTypes": [
                        {"$group": {"_id": "$contractType", "count": {"$sum": 1}}}
                    ],
                    "workTypes": [
                        {"$group": {"_id": "$workType", "count": {"$sum": 1}}}
                    ],
                    "experienceLevels": [
                        {"$group": {"_id": "$experienceLevel", "count": {"$sum": 1}}}
                    ],
                    "sectors": [
                        {"$group": {"_id": "$sector", "count": {"$sum": 1}}}
                    ],
                    "locations": [
                        {"$group": {"_id": "$location", "count": {"$sum": 1}}}
                    ],
                    "applicationsHistogram": [
                        {
                            "$bucket": {
                                "groupBy": "$applicationsCount",
                                "boundaries": [0, 50, 100, 200, 500],
                                "default": "500+"
                            }
                        }
                    ],
                    "trendsOverTime": [
                        {"$group": {"_id": "$month", "count": {"$sum": 1}}}
                    ],
                    "topSkills": [
                        {"$unwind": "$skills"},
                        {
                            "$group": {
                                "_id": {"$toLower": "$skills.match"},
                                "count": {"$sum": 1}
                            }
                        }
                    ],
                     "titles": [
                        {
                            "$group": {
                                "_id": "$title",
                                "count": {"$sum": 1}
                            }
                        }
                    ],
                    "companyNames": [ 
                        {"$group": {"_id": "$companyName", "count": {"$sum": 1}}}
                    ]
                }
            }
        ]

        # Use blocking code to retrieve the results
        results = list(jobs_collection.aggregate(pipeline))

        if not results:
            return JSONResponse(content={"message": "No data available"}, status_code=404)

        return JSONResponse(
            content=jsonable_encoder(results, custom_encoder={ObjectId: str})
        )

    except Exception as e:
        return JSONResponse(
            content={
                "error": "Data processing failed",
                "details": str(e),
                "solution": "Ensure 'publishedAt' values are numeric years (e.g., 2021)"
            },
            status_code=500
        )


@router.post("/api/v1/eligibility/check")
async def check_eligibility(
    job_title: str = Form(...),
    experience_level: str = Form(...),
    resume: UploadFile = File(...)
):
    # Accept only .pdf, .doc, .docx
    allowed_extensions = ['.pdf', '.doc', '.docx']
    filename = resume.filename.lower()

    if not any(filename.endswith(ext) for ext in allowed_extensions):
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid file format. Only PDF, DOC, DOCX are allowed."}
        )

    # Simulate eligibility randomly
    eligible = random.choice([True, False])

    if eligible:
        return {"eligible": True, "message": "You are eligible for this position with your experience."}
    else:
        return {
            "eligible": False,
            "message": "Sorry, you are not eligible. Consider taking these related courses:",
            "courses": [
                "Advanced Machine Learning",
                "Resume Writing for Tech Jobs",
                "Upskilling in Python for Data Science"
            ]
        }

    print("✅ Endpoint hit")
    print(f"Job Title: {job_title}, Experience Level: {experience_level}")
    print(f"Resume Filename: {resume.filename}")


