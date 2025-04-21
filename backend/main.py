from fastapi import FastAPI, HTTPException, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from pydantic import BaseModel
import secrets
from routes import router

app = FastAPI()
app.include_router(router)

# Security configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Secure user database with better password
users_db = {
    "user@example.com": {
        "password": pwd_context.hash("SecurePass123!"),  # Stronger password
        "name": "Test User"
    }
}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/auth/login")
async def login(request: LoginRequest, response: Response):
    user = users_db.get(request.email)
    
    if not user or not pwd_context.verify(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate secure session token
    session_token = secrets.token_urlsafe(32)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=3600,
        httponly=True,
        secure=False,  # True in production
        samesite="lax"
    )
    
    return {"message": "Login successful"}

# ... rest of your endpoints remain the same ...

@app.get("/auth/check")
async def check_login(session_token: str = Cookie(None)):
    if not session_token:
        raise HTTPException(status_code=401)
    return {"status": "authenticated"}

@app.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("session_token")
    return {"message": "Logged out"}