import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import FileUpload from "./components/FileUpload";
import ChatInterface from "./components/ChatInterface";
import ThemeToggle from "./components/ThemeToggle";
import { uploadPDF, queryDocument, checkHealth } from "./services/api";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ChatSession, Message } from "./types/chat";

function App() {
  const [session, setSession] = useState<ChatSession>({
    id: uuidv4(),
    messages: [],
    isDocumentUploaded: false,
  });

  // const [uploadedFiles, setUploadedFiles] = useState<
  //   Array<{
  //     name: string;
  //     size: number;
  //     uploadedAt: Date;
  //   }>
  // >([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setIsHealthy(true))
      .catch(() => setIsHealthy(false));
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      const response = await uploadPDF(files, session.id);

      // Add to uploaded files history
      // const newFiles = files.map((file) => ({
      //   name: file.name,
      //   size: file.size,
      //   uploadedAt: new Date(),
      // }));
      // setUploadedFiles((prev) => [...prev, ...newFiles]);

      setSession((prev) => ({
        ...prev,
        isDocumentUploaded: true,
        chunksCount: response.chunks_count,
      }));

      showNotification(
        "success",
        `✓ Successfully processed ${files.length} file(s) into ${response.chunks_count} chunks`
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      showNotification(
        "error",
        error.response?.data?.detail ||
          "Failed to upload PDF. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // const handleClearSession = () => {
  //   const newSessionId = uuidv4();
  //   setSession({
  //     id: newSessionId,
  //     messages: [],
  //     isDocumentUploaded: false,
  //   });
  //   setUploadedFiles([]);
  //   showNotification(
  //     "success",
  //     "Session cleared. You can upload new documents."
  //   );
  // };

  const handleSendMessage = async (question: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    setIsQuerying(true);
    try {
      const response = await queryDocument({
        question,
        session_id: session.id,
        chat_history: [],
      });

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
      };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }));
    } catch (error: any) {
      console.error("Query error:", error);
      showNotification(
        "error",
        error.response?.data?.detail ||
          "Failed to get answer. Please try again."
      );
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 transition-colors duration-500">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-300/20 dark:bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Sparkles icon  */}
              {/* <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-xl">
                <Sparkles className="h-7 w-7 text-white" />
              </div> */}
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Astri-X RAG
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Upload your documents and chat with AI to extract insights
              instantly
            </p>

            {/* Status badges */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div
                className={`px-4 py-2 rounded-full border backdrop-blur-xl ${
                  isHealthy === true
                    ? "bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : isHealthy === false
                    ? "bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-gray-50/80 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className="text-sm font-medium">
                  Backend:{" "}
                  {isHealthy === true
                    ? "✓ Connected"
                    : isHealthy === false
                    ? "✗ Offline"
                    : "Checking..."}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Notification */}
          {notification && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4 animate-slide-down">
              <div
                className={`p-4 rounded-2xl flex items-center gap-3 backdrop-blur-xl shadow-lg border transition-all duration-300
        ${
          notification.type === "success"
            ? "bg-green-50/90 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
            : "bg-red-50/90 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
        }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <p className="text-sm font-medium flex-1 text-center">
                  {notification.message}
                </p>
              </div>
            </div>
          )}

          {/* Uploaded Files Display */}
          {/* {uploadedFiles.length > 0 && (
            <div className="mb-6 max-w-7xl mx-auto">
              <div className="card animate-slide-down">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      Uploaded Documents ({uploadedFiles.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleClearSession}
                    className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Session
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {session.chunksCount && (
                  <div className="mt-3 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      ✓ Processed into {session.chunksCount} searchable chunks
                    </p>
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            <FileUpload onUpload={handleUpload} isLoading={isUploading} />
            <ChatInterface
              messages={session.messages}
              onSendMessage={handleSendMessage}
              isLoading={isQuerying}
              disabled={!session.isDocumentUploaded}
            />
          </div>

          {/* Footer - keep your enhanced version */}
          <footer className="text-center mt-16 pb-8 space-y-6">
            <div className="pt-4 border-t border-gray-200 dark:border-dark-800">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                © {new Date().getFullYear()} All Right Reserved. Powered by{" "}
                <a
                  href="https://github.com/astri-x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative text-sm bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent hover:from-primary-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  <span className="absolute left-0 -bottom-[0.5px] w-full h-[1px] bg-gradient-to-r from-primary-400 via-purple-400 to-pink-600"></span>
                  Astri-X
                </a>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
