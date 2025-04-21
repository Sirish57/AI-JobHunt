import pandas as pd 
from database import jobs_collection

def load_data(file_path: str = "ai_ml_jobs_linkedin.xlsx"):
    try:
        df = pd.read_excel(file_path)
        df = df.where(pd.notnull(df), None)

        # No conversion on 'publishedAt', leave it as-is
        print("🔍 Data types before inserting:\n", df.dtypes)

        records = df.to_dict(orient="records")

        if records:
            jobs_collection.delete_many({})
            result = jobs_collection.insert_many(records)
            print(f"✅ Inserted {len(result.inserted_ids)} documents")
            return True
        else:
            print("⚠️ No records to insert.")
            return False

    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return False

if __name__ == "__main__":
    load_data()
