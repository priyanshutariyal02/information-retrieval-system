import os
import tempfile
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

from src.helper import (
    get_pdf_text,
    get_text_chunks,
    get_vector_store,
    get_conversational_chain
)

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
os.environ['GOOGLE_API_KEY'] = GOOGLE_API_KEY

# Initialize FastAPI app
app = FastAPI(
    title="Information Retrieval System API",
    description="Backend API for PDF-based question answering using LangChain and Google Gemini",
    version="2.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for vector stores (keyed by session_id)
# This is temporary - we'll move to server-side storage later
vector_stores = {}

# Pydantic models for request/response
class QueryRequest(BaseModel):
    question: str
    session_id: str
    chat_history: Optional[List[dict]] = []

class QueryResponse(BaseModel):
    answer: str
    session_id: str

class UploadResponse(BaseModel):
    message: str
    session_id: str
    chunks_count: int

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "google_api_configured": bool(GOOGLE_API_KEY)
    }

# Upload and process PDF endpoint
@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    files: List[UploadFile] = File(...),
    session_id: str = Form(...)
):
    """
    Upload one or more PDF files and process them.
    Returns a session_id to use for subsequent queries.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Validate file types
    for file in files:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.filename}. Only PDF files are allowed."
            )
    
    try:
        # Save uploaded files temporarily
        temp_files = []
        for file in files:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            content = await file.read()
            temp_file.write(content)
            temp_file.close()
            temp_files.append(temp_file.name)
        
        # Process PDFs using existing helper functions
        raw_text = get_pdf_text(temp_files)
        
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the PDF(s)")
        
        text_chunks = get_text_chunks(raw_text)
        vector_store = get_vector_store(text_chunks)
        
        # Store vector store with session_id
        vector_stores[session_id] = vector_store
        
        # Clean up temporary files
        for temp_file_path in temp_files:
            os.unlink(temp_file_path)
        
        return UploadResponse(
            message="PDF processed successfully",
            session_id=session_id,
            chunks_count=len(text_chunks)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

# Query endpoint
@app.post("/query", response_model=QueryResponse)
async def query_document(request: QueryRequest):
    """
    Ask a question about the uploaded document.
    Requires session_id from the upload response.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    if request.session_id not in vector_stores:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please upload a PDF first."
        )
    
    try:
        vector_store = vector_stores[request.session_id]
        conversation_chain = get_conversational_chain(vector_store)
        
        # Invoke the conversational chain
        response = conversation_chain.invoke({'question': request.question})
        
        # Extract answer from response
        answer = response.get('answer', 'No answer generated')
        
        return QueryResponse(
            answer=answer,
            session_id=request.session_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# Delete session endpoint (cleanup)
@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and its associated vector store"""
    if session_id in vector_stores:
        del vector_stores[session_id]
        return {"message": f"Session {session_id} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Information Retrieval System API",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
