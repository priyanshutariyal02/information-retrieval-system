# Information Retrieval System

<div align="center">

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**An intelligent document analysis system powered by AI**

Upload PDFs • Ask Questions • Get Instant Answers

[Live Demo](#)

</div>

---

## Description

**Information Retrieval System** is a modern document intelligence platform that transforms how you interact with PDF documents. Built with cutting-edge AI technology, it allows you to upload multiple documents and have natural conversations about their content.

### What It Does

- **Upload** multiple PDF documents through an intuitive drag-and-drop interface
- **Process** documents using advanced text extraction and semantic chunking
- **Ask** natural language questions about your documents
- **Receive** accurate, context-aware answers powered by Google Gemini AI
- **Interact** through a beautiful, responsive chat interface with markdown support

### Why It's Useful

- **Save Time**: No more manual document searching - get answers instantly
- **Multi-Document**: Compare and analyze information across multiple PDFs
- **Natural Language**: Ask questions as you would to a colleague
- **Modern UI**: Enjoy a sleek, professional interface with dark mode support
- **Developer Friendly**: Built with modern tech stack for easy customization

---

## Tech Stack

### Frontend Architecture

<table>
<tr>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="48" height="48" alt="React" />
<br>React 18
</td>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
<br>TypeScript
</td>
<td align="center" width="96">
<img src="https://vitejs.dev/logo.svg" width="48" height="48" alt="Vite" />
<br>Vite 5
</td>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="48" height="48" alt="Tailwind" />
<br>Tailwind CSS
</td>
</tr>
</table>

| Layer                | Technology                  | Purpose                                           |
| -------------------- | --------------------------- | ------------------------------------------------- |
| **Framework**        | React 18 + TypeScript       | Component-based UI with type safety               |
| **Build Tool**       | Vite 5                      | Lightning-fast HMR and optimized builds           |
| **Styling**          | Tailwind CSS 3              | Utility-first CSS with dark mode support          |
| **HTTP Client**      | Axios                       | Promise-based REST API communication              |
| **Icons**            | Lucide React                | Beautiful, consistent icon system                 |
| **Markdown**         | React Markdown + Remark GFM | Rich text rendering with GitHub Flavored Markdown |
| **State Management** | React Context + Hooks       | Lightweight state management                      |
| **Routing**          | React Router DOM            | Client-side navigation                            |

---

### Backend Architecture

<table>
<tr>
<td align="center" width="96">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="48" height="48" alt="Python" />
<br>Python 3.9+
</td>
<td align="center" width="96">
<img src="https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png" width="48" height="48" alt="FastAPI" />
<br>FastAPI
</td>
<td align="center" width="96">
<img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" width="48" height="48" alt="Gemini" />
<br>Gemini AI
</td>
</tr>
</table>

| Layer              | Technology                               | Purpose                                        |
| ------------------ | ---------------------------------------- | ---------------------------------------------- |
| **Framework**      | FastAPI 0.104+                           | High-performance async REST API                |
| **Server**         | Uvicorn                                  | ASGI server with hot reload                    |
| **AI Model**       | Google Gemini Pro                        | Advanced language understanding and generation |
| **LLM Framework**  | LangChain 0.1.20                         | AI orchestration and chain management          |
| **Vector Store**   | FAISS (CPU)                              | Efficient similarity search                    |
| **Embeddings**     | HuggingFace Sentence Transformers        | Text-to-vector conversion (`all-MiniLM-L6-v2`) |
| **PDF Parser**     | PyPDF2                                   | Text extraction from PDF documents             |
| **Text Splitting** | LangChain RecursiveCharacterTextSplitter | Intelligent document chunking                  |
| **Environment**    | Python-dotenv                            | Secure configuration management                |
| **File Upload**    | Python Multipart                         | Multipart form-data handling                   |

---

## Endpoints Overview

| Method   | Endpoint                | Description              | Auth Required |
| -------- | ----------------------- | ------------------------ | ------------- |
| `GET`    | `/`                     | Root endpoint - API info | ❌            |
| `GET`    | `/health`               | Health check             | ❌            |
| `POST`   | `/upload`               | Upload PDF documents     | ❌            |
| `POST`   | `/query`                | Ask questions            | ❌            |
| `DELETE` | `/session/{session_id}` | Clear session            | ❌            |

### 1. Health Check

Check if the backend server is running and configured properly.

**Endpoint:** `GET /health`

### 2. Upload Documents

Upload one or more PDF documents for processing.

**Endpoint:** `POST /upload`

**Content-Type:** `multipart/form-data`

**Parameters:**

| Field        | Type   | Required | Description                      |
| ------------ | ------ | -------- | -------------------------------- |
| `files`      | File[] | ✅       | Array of PDF files to upload     |
| `session_id` | string | ✅       | Unique session identifier (UUID) |

### 3. Query Documents

Ask questions about uploaded documents.

**Endpoint:** `POST /query`

**Content-Type:** `application/json`

**Request Body:**

| Field          | Type   | Required | Description                      |
| -------------- | ------ | -------- | -------------------------------- |
| `question`     | string | ✅       | Natural language question        |
| `session_id`   | string | ✅       | Session ID from upload response  |
| `chat_history` | array  | ❌       | Previous conversation (optional) |

### 4. Delete Session

Clear a session and free up server resources.

**Endpoint:** `DELETE /session/{session_id}`

**Path Parameters:**

| Parameter    | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| `session_id` | string | ✅       | Session ID to delete |

### 5. Root Endpoint

Get basic API information.

**Endpoint:** `GET /`

### CORS Configuration

The backend allows cross-origin requests from:

- `http://localhost:5173` (Vite dev server)

To add more origins, update `backend/app.py`:

```py
app.add_middleware(
CORSMiddleware,
allow_origins=[
"http://localhost:5173",
"https://yourdomain.com" # Add production URL
],
allow_credentials=True,
allow_methods=[""],
allow_headers=[""],
)

```

---

### Rate Limiting

Currently no rate limiting is implemented. For production, consider:

- Using `slowapi` for request throttling
- Implementing API key authentication
- Adding request size limits

---