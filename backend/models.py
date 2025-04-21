from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Union
from enum import Enum
import re
from datetime import datetime

# ================= User Models =================
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    disabled: Optional[bool] = False

class UserCreate(UserBase):
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one number")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime
    last_login: Optional[datetime] = None
    job_preferences: Optional[List[str]] = None

# ================= Job Models =================
class ExperienceLevel(str, Enum):
    entry = "Entry level"
    mid = "Mid-Senior level"
    senior = "Senior level"
    intern = "Internship"
    associate = "Associate"
    director = "Director"
    executive = "Executive"
    not_applicable = "Not Applicable"

class JobType(str, Enum):
    full_time = "Full-time"
    part_time = "Part-time"
    contract = "Contract"
    temporary = "Temporary"
    internship = "Internship"
    other = "Other"

class WorkType(str, Enum):
    on_site = "On-site"
    hybrid = "Hybrid"
    remote = "Remote"

class SalaryRange(str, Enum):
    range_30k = "$30,000-$50,000"
    range_50k = "$50,000-$70,000"
    range_70k = "$70,000-$90,000"
    range_90k = "$90,000-$120,000"
    range_120k = "$120,000+"

class JobBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    company: str = Field(..., alias="companyName", min_length=2, max_length=50)
    location: str = Field(..., min_length=2, max_length=50)
    job_type: JobType = Field(..., alias="contractType")
    experience_level: ExperienceLevel = Field(..., alias="experienceLevel")
    industry: str = Field(..., alias="sector", min_length=2, max_length=50)
    description: str = Field(..., min_length=10, max_length=2000)
    applications_count: Optional[Union[int, str]] = Field(None, alias="applicationsCount")
    published_at: Union[str, datetime] = Field(..., alias="publishedAt")
    work_type: WorkType = Field(..., alias="workType")
    skills_required: List[str] = Field(default_factory=list)
    salary_range: Optional[SalaryRange] = None
    is_active: bool = Field(default=True)

    @validator('applications_count', pre=True)
    def parse_applications_count(cls, v):
        if v is None:
            return None
        if isinstance(v, int):
            return v
        if isinstance(v, str):
            numbers = re.findall(r'\d+', v)
            return int(numbers[0]) if numbers else v
        return v

    @validator('experience_level', pre=True)
    def map_experience_level(cls, v):
        if isinstance(v, str):
            v_clean = v.strip().lower()
            mapping = {
                "entry level": ExperienceLevel.entry,
                "mid-senior level": ExperienceLevel.mid,
                "senior level": ExperienceLevel.senior,
                "internship": ExperienceLevel.intern,
                "not applicable": ExperienceLevel.not_applicable,
                "associate": ExperienceLevel.associate,
                "executive": ExperienceLevel.executive,
                "director": ExperienceLevel.director
            }
            return mapping.get(v_clean, ExperienceLevel.not_applicable)
        return v

    @validator('published_at', pre=True)
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                try:
                    return datetime.strptime(v, "%Y-%m-%d")
                except ValueError:
                    return v
        return v

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str = Field(..., alias="_id")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.strftime("%Y-%m-%d %H:%M:%S") if v else None
        }
        allow_population_by_field_name = True

# ================= Filter Models =================
class JobFilters(BaseModel):
    search_query: Optional[str] = Field(None, min_length=2, max_length=50)
    job_types: Optional[List[JobType]] = None
    experience_levels: Optional[List[ExperienceLevel]] = None
    work_types: Optional[List[WorkType]] = None
    salary_ranges: Optional[List[SalaryRange]] = None
    locations: Optional[List[str]] = None
    industries: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    posted_since: Optional[int] = Field(None, description="Days since posting")

# ================= Eligibility Models =================
class SkillAssessment(BaseModel):
    skill: str
    has_skill: bool
    importance: int = Field(1, ge=1, le=5)

class EligibilityRequest(BaseModel):
    job_title: str = Field(..., min_length=3, max_length=100)
    experience_level: ExperienceLevel
    skills: List[SkillAssessment]
    resume_text: Optional[str] = None
    current_salary: Optional[SalaryRange] = None

class EligibilityResponse(BaseModel):
    is_eligible: bool
    match_score: float = Field(..., ge=0, le=1)
    missing_skills: List[str]
    recommended_certifications: List[str]
    suggested_jobs: List[JobResponse]
    salary_comparison: Optional[str] = None
    improvement_suggestions: List[str]

# ================= Analytics Models =================
class JobTrend(BaseModel):
    date: str
    job_count: int
    average_salary: Optional[str] = None

class SkillTrend(BaseModel):
    skill: str
    demand: float = Field(..., ge=0, le=1)
    growth: float = Field(..., ge=-1, le=1)

# ================= Application Models =================
class ApplicationStatus(str, Enum):
    applied = "Applied"
    reviewed = "Reviewed"
    interview = "Interview"
    rejected = "Rejected"
    offered = "Offered"

class JobApplication(BaseModel):
    job_id: str
    user_id: str
    status: ApplicationStatus = ApplicationStatus.applied
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None
    resume_version: Optional[str] = None