# backend/import_excel.py
import pandas as pd
from database import jobs_collection
from pathlib import Path

def import_jobs_from_excel(excel_path: str):
    """Import jobs from Excel to MongoDB with your schema"""
    try:
        df = pd.read_excel(excel_path)
        
        # Convert to MongoDB documents
        jobs = df.to_dict('records')
        
        # Clean collection and insert
        jobs_collection.delete_many({})
        result = jobs_collection.insert_many(jobs)
        
        print(f"Imported {len(result.inserted_ids)} jobs")
        return True
    except Exception as e:
        print(f"Import failed: {str(e)}")
        return False

if __name__ == "__main__":
    excel_path = Path(__file__).parent / "ai_ml_jobs_linkedin.xlsx"
    if import_jobs_from_excel(excel_path):
        print("Data import successful")
    else:
        print("Data import failed")