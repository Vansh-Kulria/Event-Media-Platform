"use client";

import { useEffect, useState } from "react";
import { uploadSelfie, recognizeFace, getMySelfie } from "@/services/media.service";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { User, Camera, X, Sparkles } from "lucide-react";

export default function SelfiePage() {
  const { user, setUser } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSelfie, setCurrentSelfie] = useState<string | null>(null);

  const loadSelfie = async () => {
    try {
      const data = await getMySelfie();
      setCurrentSelfie(data?.selfieUrl || null);
    } catch (error) {
      console.error("Failed to load selfie:", error);
    }
  };

  useEffect(() => {
    loadSelfie();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const data = await uploadSelfie(file);
      toast.success("Selfie uploaded successfully!");
      setCurrentSelfie(data.selfieUrl);
      setFile(null);
      setPreview(null);
      
      // Update store user
      if (user) {
        setUser({ ...user, selfieUrl: data.selfieUrl });
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRecognize = async () => {
    try {
      setLoading(true);
      const result = await recognizeFace();
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      toast.error("Facial recognition run failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
          Facial Recognition Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Upload a reference selfie to let the AI search event galleries and find photos containing your face.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Selfie Status Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Current Reference Selfie</h2>
          {currentSelfie && currentSelfie !== "null" && currentSelfie !== "undefined" && currentSelfie.trim() !== "" ? (
            <div className="space-y-4">
              <div className="relative h-44 w-44 rounded-full overflow-hidden border-2 border-violet-500 shadow-xl shadow-violet-500/10 mx-auto">
                <img
                  src={currentSelfie.startsWith("http") ? currentSelfie : `http://localhost:5000${currentSelfie}`}
                  alt="Current Selfie"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ready for automated face matching.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-44 w-44 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-600 mx-auto">
                <User className="h-20 w-20" />
              </div>
              <p className="text-xs text-slate-500">No reference selfie uploaded yet.</p>
            </div>
          )}
        </div>

        {/* Upload Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Upload New Selfie</h2>
            
            {preview ? (
              <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-slate-200 dark:border-white/15 mx-auto bg-slate-950">
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-1 right-1 h-5 w-5 bg-black/60 rounded-full text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-white/15 rounded-xl p-8 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer" onClick={() => document.getElementById("selfie-input")?.click()}>
                <input
                  id="selfie-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Camera className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                <span className="text-xs text-slate-500 dark:text-slate-400 text-center">Click to select selfie</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-violet-600/10"
            >
              {loading ? "Uploading..." : "Upload Selfie"}
            </button>

            {currentSelfie && (
              <button
                onClick={handleRecognize}
                disabled={loading}
                className="w-full rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-250 dark:border-white/10 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4.5 w-4.5 text-violet-500 dark:text-violet-400" />
                <span>Find My Photos in Galleries</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}