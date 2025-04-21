from database import users_collection
from database import jobs_collection
company = "Wesper"
job_title = "AI/ML Engineer"
job_details = jobs_collection.find_one({
    "companyName": {"$regex": f"^{company}$", "$options": "i"},
    "title": {"$regex": f"^{job_title}$", "$options": "i"}
})
print(job_details)
