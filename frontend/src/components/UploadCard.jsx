import { useRef } from "react";
import { ArrowPathIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";

export default function UploadCard({ file, onFileChange, onAnalyze, isLoading, buttonLabel = "Analyze" }) {
  const inputRef = useRef();

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (f) onFileChange(f);
  }

  return (
    /*  ⬇︎  changed line:  w-fixed + relative  */
    <div
      className="relative   w-full md:w-[420px]  h-[520px]
                 rounded-lg border shadow-sm flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFileChange(e.dataTransfer.files?.[0]);
      }}
    >
      {/* ---- preview / drop-zone ---- */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {file ? (
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <p className="text-neutral-400 italic text-center px-4">
            Drag &amp; drop or click to upload
          </p>
        )}
      </div>

      {/* ---- action buttons ---- */}
      <div className="flex gap-3 p-3 border-t">
        <button
          onClick={() => inputRef.current.click()}
          className="flex-1 text-neutral-800 dark:text-neutral-100
            bg-neutral-200  dark:bg-neutral-700
            hover:bg-neutral-300 dark:hover:bg-neutral-600
            text-sm py-2 rounded-lg flex items-center justify-center gap-1"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Upload
        </button>

        <button
          onClick={onAnalyze}
          disabled={!file || isLoading}
          className={`flex-1 bg-black text-white text-sm py-2 rounded-lg
                      flex items-center justify-center gap-1
                      ${!file || isLoading
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-neutral-800"}`}
        >
          <ArrowRightCircleIcon className="w-5 h-5" />
          {buttonLabel}
        </button>
      </div>

      {/* ---- hidden file input ---- */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={inputRef}
        onChange={pickFile}
      />

      {/* ---- overlay spinner ---- */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg">
          <span className="animate-pulse">Analyzing…</span>
        </div>
      )}
    </div>
  );
}