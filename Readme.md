# Information Retrieval System

## Introduction

The **Information Retrieval System** is a Python-based application that enables users to upload documents (PDF or DOCX format) and then ask questions related to the content of those documents. The system uses natural language processing and embeddings to understand the document, process user queries, and return accurate and contextually relevant answers.

It integrates Google APIs to enhance functionality such as language models or embeddings.

---

## Features

- Upload documents in **PDF** or **DOCX** format.
- Ask questions related to the uploaded file.
- Intelligent answer generation using document embeddings.
- Uses Google API for enhanced NLP capabilities.
- Preprocessing pipeline to clean and chunk documents for retrieval.

---

## Tech Stack

- **Python**
- **Google Generative AI (PaLM / Gemini) API**
- **Streamlit** (for web interface)
- **PyMuPDF** (`fitz`) for PDF parsing
- **python-docx** for DOCX parsing
- **Google Generative AI SDK** (`google.generativeai`)

---

## Requirements

- pip install streamlit
- pip install faiss-cpu
- pip install google-generativeai
- pip install PyPDF2
- pip install langchain-google-communit
- pip install python-dotenv
- pip install langchain

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/priyanshutariyal02/information-retrieval-system.git
cd information-retrieval-system
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
```

### 3. Install Requirements

```bash
pip install -r requirements.txt
```

### 4. Set Up Google API Key

Create a `.env` file in the root directory and add your API key:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

> You must enable access to the Google Generative AI (PaLM/Gemini) API and generate an API key from [Google AI Studio](https://makersuite.google.com/).

---

## Usage

Start the Streamlit app:

```bash
streamlit run app.py
```

### How it Works

1. **Upload File**: Upload a `.pdf` or `.docx` document.
2. **Processing**: The document is chunked and converted into embeddings.
3. **Ask Questions**: Enter any question related to the uploaded content.
4. **Get Answers**: The system retrieves and displays the most relevant answer.

---
