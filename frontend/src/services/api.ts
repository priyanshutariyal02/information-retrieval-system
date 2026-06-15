import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadResponse {
  message: string;
  session_id: string;
  chunks_count: number;
}

export interface QueryResponse {
  answer: string;
  session_id: string;
}

export interface QueryRequest {
  question: string;
  session_id: string;
  chat_history?: Array<{ role: string; content: string }>;
}

export interface HealthResponse {
  status: string;
  version: string;
  google_api_configured: boolean;
}

// Health check
export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

// Upload PDF files
export const uploadPDF = async (
  files: File[],
  sessionId: string
): Promise<UploadResponse> => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  formData.append('session_id', sessionId);

  const response = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Query the document
export const queryDocument = async (
  request: QueryRequest
): Promise<QueryResponse> => {
  const response = await apiClient.post<QueryResponse>('/query', request);
  return response.data;
};

// Delete session
export const deleteSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(`/session/${sessionId}`);
};

export default apiClient;
