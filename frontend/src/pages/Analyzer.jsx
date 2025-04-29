// src/pages/Analyzer.jsx
import { useState } from "react";
import UploadCard from "../components/UploadCard";
import ResultCard from "../components/ResultCard";
import ampLight from "../assets/Asset.png";
import ampDark  from "../assets/AssetWhite.png";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Analyzer() {
  /* ─── stage-1: material analysis ─── */
  const [matFile, setMatFile]   = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalyze, setLA] = useState(false);

  /* ─── stage-2: image generation ─── */
  const [baseFile,   setBaseFile]   = useState(null);
  const [genImage,   setGenImage]   = useState(null);
  const [loadingGen, setLG]         = useState(false);

  async function handleAnalyze() {
    if (!matFile) return;
    setLA(true);
    setAnalysis(null);
    setGenImage(null);
    try {
      const fd = new FormData();
      fd.append("file", matFile);
      const res = await fetch(`${API_URL}/analyze-image`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setAnalysis({ ...json, preview: URL.createObjectURL(matFile) });
    } catch (e) {
      alert(e.message);
    } finally {
      setLA(false);
    }
  }

  async function handleGenerate() {
    if (!baseFile || !matFile) return;
    setLG(true);
    setGenImage(null);
    try {
      const fd = new FormData();
      fd.append("material_image", matFile);
      fd.append("base_image", baseFile);
      const res = await fetch(`${API_URL}/generate-image`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setGenImage(URL.createObjectURL(blob));
    } catch (e) {
      alert(e.message);
    } finally {
      setLG(false);
    }
  }

  return (
    <div className="pb-24">
      {/* ← updated heading with inline ampersand PNGs */}
      <h1 className="text-3xl font-semibold mb-6 flex items-center gap-[2px]">
        Material
        <img
          src={ampLight}
          alt="&"
          className="h-[1em] inline-block dark:hidden align-baseline"
        />
        <img
          src={ampDark}
          alt="&"
          className="h-[1em] inline-block hidden dark:inline-block align-baseline"
        />
        Texture&nbsp;Analyzer
      </h1>

      {/* stage-1 row */}
      <div className="flex flex-col md:flex-row gap-10 justify-center">
        <UploadCard
          file={matFile}
          onFileChange={setMatFile}
          onAnalyze={handleAnalyze}
          isLoading={loadingAnalyze}
          buttonLabel="Analyze"
        />
        <ResultCard result={analysis} isLoading={loadingAnalyze} />
      </div>

      {/* stage-2 row */}
      {analysis && (
        <div className="mt-10 flex flex-col md:flex-row gap-10 justify-center">
          <UploadCard
            file={baseFile}
            onFileChange={setBaseFile}
            onAnalyze={handleGenerate}
            isLoading={loadingGen}
            buttonLabel="Generate"
          />
          <ResultCard
            result={genImage ? { preview: genImage } : null}
            isLoading={loadingGen}
            variant="image"
          />
        </div>
      )}
    </div>
  );
}