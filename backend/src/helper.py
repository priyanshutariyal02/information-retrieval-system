import os
from typing import List, Union
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
os.environ['GOOGLE_API_KEY'] = GOOGLE_API_KEY


def get_pdf_text(pdf_paths: Union[List[str], List]) -> str:
    """
    Extract text from PDF files with better error handling.
    
    Args:
        pdf_paths: List of file paths or file objects
        
    Returns:
        Concatenated text from all PDFs
    """
    text = ""
    files_processed = 0
    
    for pdf_path in pdf_paths:
        try:
            pdf_reader = PdfReader(pdf_path)
            file_text = ""
            
            # Add document separator
            file_text += f"\n\n--- Document: {os.path.basename(str(pdf_path)) if isinstance(pdf_path, str) else 'uploaded-file'} ---\n\n"
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    extracted = page.extract_text()
                    if extracted and extracted.strip():
                        file_text += extracted + "\n"
                except Exception as page_error:
                    print(f"Error extracting page {page_num} from {pdf_path}: {str(page_error)}")
                    continue
            
            if file_text.strip():
                text += file_text
                files_processed += 1
                # print(f"Successfully extracted text from {pdf_path}: {len(file_text)} characters")
            else:
                print(f"Warning: No text extracted from {pdf_path}")
                
        except Exception as e:
            print(f"Error reading PDF {pdf_path}: {str(e)}")
            continue
    
    # print(f"Total files processed: {files_processed}/{len(pdf_paths)}")
    # print(f"Total text length: {len(text)} characters")
    
    return text


def get_text_chunks(text: str) -> List[str]:
    """
    Split text into chunks for embedding with better parameters.
    
    Args:
        text: Raw text to split
        
    Returns:
        List of text chunks
    """
    if not text or not text.strip():
        print("Warning: Empty text provided to get_text_chunks")
        return []
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,  # Increased overlap for better context
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = text_splitter.split_text(text)
    # print(f"Created {len(chunks)} chunks from text")
    return chunks


def get_vector_store(text_chunks: List[str]):
    """
    Create FAISS vector store from text chunks.
    
    Args:
        text_chunks: List of text chunks to embed
        
    Returns:
        FAISS vector store
    """
    if not text_chunks:
        raise ValueError("No text chunks provided to create vector store")
    
    # print(f"Creating vector store with {len(text_chunks)} chunks")
    
    # Use free local embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    # print("Vector store created successfully")
    return vector_store


def get_conversational_chain(vector_store):
    """
    Create conversational retrieval chain with improved settings.
    
    Args:
        vector_store: FAISS vector store
        
    Returns:
        ConversationalRetrievalChain instance
    """
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.3,  # Lower temperature for more factual responses
        convert_system_message_to_human=True
    )
    
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="answer"
    )
    
    # Enhanced QA prompt
    prompt_template = """You are a helpful AI assistant. Answer the question based on the provided context in a clear, natural, and conversational way.

Context from documents:
{context}

Question: {question}

Guidelines:
- Answer naturally as if you're explaining to a colleague
- Use bullet points or numbered lists when listing multiple items
- Keep it concise and well-organized
- Only mention the document name if asked about which document or if comparing documents
- Don't include raw quotes or references to "context" in your response
- If the information isn't in the context, simply say you don't have that information

Answer:"""
    
    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )
    
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        ),
        memory=memory,
        combine_docs_chain_kwargs={"prompt": PROMPT},
        return_source_documents=True,
        verbose=False  # Disable verbose to reduce noise
    )
    
    return conversation_chain
