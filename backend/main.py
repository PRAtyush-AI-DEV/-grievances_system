from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import datetime
import random
import uuid
import bcrypt
import os

from database.connection import Base, engine, get_db

# --- Load .env file ---
load_dotenv()

# --- Password Hashing Setup ---
def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

class StudentModel(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    enrollment = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    createdAt = Column(String)

class GrievanceModel(Base):
    __tablename__ = "grievances"
    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"), nullable=True, index=True)
    name = Column(String, index=True)
    enrollment = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    department = Column(String)
    year = Column(String)
    category = Column(String)
    priority = Column(String)
    subject = Column(String)
    description = Column(Text)
    status = Column(String, default="pending")
    submittedAt = Column(String)
    updatedAt = Column(String, nullable=True)
    adminNote = Column(Text, nullable=True)

Base.metadata.create_all(bind=engine)

# --- FastAPI App Setup ---
app = FastAPI(
    title="Student Grievance System API",
    description="Backend API for the Student Grievance System",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class StudentRegister(BaseModel):
    name: str
    enrollment: str
    email: str
    password: str

class StudentLogin(BaseModel):
    enrollment: str
    password: str

class StudentResponse(BaseModel):
    id: str
    name: str
    enrollment: str
    email: str
    
    class Config:
        from_attributes = True

class GrievanceCreate(BaseModel):
    student_id: Optional[str] = None
    name: str
    enrollment: str
    email: str
    phone: str
    department: str
    year: str
    category: str
    priority: str
    subject: str
    description: str

class GrievanceUpdate(BaseModel):
    status: str
    adminNote: Optional[str] = None

class GrievanceResponse(GrievanceCreate):
    id: str
    status: str
    submittedAt: str
    updatedAt: Optional[str] = None
    adminNote: Optional[str] = None

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    password: str

# --- Helper Function ---
def generate_grievance_id():
    prefix = 'SGS'
    year = str(datetime.datetime.now().year)[-2:]
    num = random.randint(10000, 99999)
    return f"{prefix}{year}{num}"

# --- Student Auth Routes ---

@app.post("/api/student/register", response_model=StudentResponse)
def register_student(student: StudentRegister, db: Session = Depends(get_db)):
    db_student = db.query(StudentModel).filter(StudentModel.enrollment == student.enrollment).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Enrollment number already registered")
        
    db_email = db.query(StudentModel).filter(StudentModel.email == student.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_student = StudentModel(
        id=str(uuid.uuid4()),
        name=student.name,
        enrollment=student.enrollment,
        email=student.email,
        password_hash=get_password_hash(student.password),
        createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

@app.post("/api/student/login")
def login_student(login_data: StudentLogin, db: Session = Depends(get_db)):
    student = db.query(StudentModel).filter(StudentModel.enrollment == login_data.enrollment).first()
    if not student or not verify_password(login_data.password, student.password_hash):
        raise HTTPException(status_code=401, detail="Invalid enrollment number or password")
    
    # In a real app we would issue a JWT token here. For this project, returning student details is sufficient.
    return {
        "success": True, 
        "token": student.id, 
        "student": {
            "id": student.id,
            "name": student.name,
            "enrollment": student.enrollment,
            "email": student.email
        }
    }

@app.get("/api/student/{student_id}/grievances", response_model=List[GrievanceResponse])
def get_student_grievances(student_id: str, db: Session = Depends(get_db)):
    return db.query(GrievanceModel).filter(GrievanceModel.student_id == student_id).order_by(GrievanceModel.submittedAt.desc()).all()


# --- Existing API Routes ---

@app.post("/api/grievances", response_model=GrievanceResponse)
def create_grievance(grievance: GrievanceCreate, db: Session = Depends(get_db)):
    new_id = generate_grievance_id()
    while db.query(GrievanceModel).filter(GrievanceModel.id == new_id).first() is not None:
        new_id = generate_grievance_id()
        
    db_grievance = GrievanceModel(
        id=new_id,
        **grievance.model_dump(),
        status="pending",
        submittedAt=datetime.datetime.now(datetime.timezone.utc).isoformat()
    )
    db.add(db_grievance)
    db.commit()
    db.refresh(db_grievance)
    return db_grievance

@app.get("/api/grievances", response_model=List[GrievanceResponse])
def get_all_grievances(db: Session = Depends(get_db)):
    return db.query(GrievanceModel).order_by(GrievanceModel.submittedAt.desc()).all()

@app.get("/api/grievances/{grievance_id}", response_model=GrievanceResponse)
def get_grievance(grievance_id: str, db: Session = Depends(get_db)):
    grievance = db.query(GrievanceModel).filter(GrievanceModel.id == grievance_id).first()
    if grievance is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    return grievance

@app.put("/api/grievances/{grievance_id}", response_model=GrievanceResponse)
def update_grievance(grievance_id: str, update_data: GrievanceUpdate, db: Session = Depends(get_db)):
    db_grievance = db.query(GrievanceModel).filter(GrievanceModel.id == grievance_id).first()
    if db_grievance is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
        
    db_grievance.status = update_data.status
    if update_data.adminNote is not None:
        db_grievance.adminNote = update_data.adminNote
    
    db_grievance.updatedAt = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    db.commit()
    db.refresh(db_grievance)
    return db_grievance

@app.delete("/api/grievances/{grievance_id}")
def delete_grievance(grievance_id: str, db: Session = Depends(get_db)):
    db_grievance = db.query(GrievanceModel).filter(GrievanceModel.id == grievance_id).first()
    if db_grievance is None:
        raise HTTPException(status_code=404, detail="Grievance not found")
    
    db.delete(db_grievance)
    db.commit()
    return {"message": "Grievance deleted successfully"}

@app.post("/api/admin/login")
def admin_login(login_data: AdminLogin):
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
    if login_data.password == ADMIN_PASSWORD:
        return {"success": True, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid password")
