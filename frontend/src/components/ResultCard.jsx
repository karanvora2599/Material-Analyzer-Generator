// src/components/ResultCard.jsx
import {
  BookmarkIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  CheckIcon,
  PaintBrushIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import Loader from "./Loader"; // your cube animation

/**
 * Splits a string into sentences (by “.” or “;”) and trims out any empty pieces.
 */
const bulletize = (txt = "") =>
  txt
    .split(/[.;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * ResultCard
 *
 * Props:
 *  - result: { preview, Material, Colour?, Properties?, Uses? }
 *  - isLoading: boolean
 *  - variant: "image"  → use the image-only layout
 */
export default function ResultCard({ result, isLoading, variant }) {
  //
  // ─── Variant: image-only card (for generated image) ───────────────────
  //
  if (variant === "image") {
    return (
      <div
        className="relative w-full md:w-[420px] h-[520px] rounded-xl overflow-hidden shadow-sm
                   border border-neutral-200 dark:border-neutral-700
                   bg-white dark:bg-neutral-900 flex items-center justify-center"
      >
        {/* overlay loader when generating */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center
                          bg-white/80 dark:bg-neutral-900/80">
            <Loader />
          </div>
        )}

        {/* when loading, don’t render placeholder or image */}
        {!isLoading && result?.preview && (
          <>
            {/* show generated image */}
            <img
              src={result.preview}
              alt="generated"
              className="object-contain w-full h-full"
            />

            {/* download button */}
            <a
              href={result.preview}
              download="generated.png"
              className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-3 py-1.5 rounded
                         hover:bg-black transition"
            >
              Download
            </a>
          </>
        )}

        {/* placeholder only when NOT loading and no preview yet */}
        {!isLoading && !result?.preview && (
          <p className="text-neutral-400 italic">Image will appear here 🖼️</p>
        )}
      </div>
    );
  }

  //
  // ─── Analysis or initial placeholder ───────────────────────────────────
  //
  if (!result || isLoading) {
    return (
      <div
        className="relative w-full md:w-[420px] h-[520px] rounded-lg border
                   border-neutral-200 dark:border-neutral-700 shadow-sm
                   bg-white dark:bg-neutral-900 flex items-center justify-center"
      >
        {isLoading ? (
          <Loader />
        ) : (
          <p className="text-neutral-400 italic">
            Analysis will appear here&nbsp;📈
          </p>
        )}
      </div>
    );
  }

  //
  // ─── Parsed-data analysis card ───────────────────────────────────────
  //
  const [openSection, setOpen] = useState("properties");
  const toggle = (name) => setOpen((o) => (o === name ? null : name));

  const colours = result.Colour?.split(/[,/&]+/i).map((c) => c.trim()) ?? [];
  const props   = bulletize(result.Properties);
  const uses    = bulletize(result.Uses);

  return (
    <div
      className="relative w-full md:w-[420px] h-[520px] rounded-xl overflow-hidden shadow-sm
                 border border-neutral-200 dark:border-neutral-700
                 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100
                 flex flex-col"
    >
      {/* overlay loader when re-analyzing */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center
                        bg-white/80 dark:bg-neutral-900/80">
          <Loader />
        </div>
      )}

      {/* material preview image */}
      <img
        src={result.preview}
        alt={result.Material}
        className="h-72 w-full object-contain
                   bg-neutral-100 dark:bg-neutral-800
                   border-b border-neutral-200 dark:border-neutral-700"
      />

      {/* details panel */}
      <div className="relative flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        {/* bookmark icon */}
        <button
          className="absolute right-4 top-4 p-1 rounded-full
                     hover:ring-2 hover:ring-offset-2 hover:ring-neutral-400
                     ring-offset-white dark:ring-offset-neutral-900 transition"
        >
          <BookmarkIcon className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
        </button>

        {/* material name */}
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5 shrink-0" />
          {result.Material}
        </h2>

        {/* colour pills */}
        {colours.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                           text-xs font-medium hover:opacity-80 transition
                           bg-neutral-200 dark:bg-neutral-700
                           text-neutral-700 dark:text-neutral-200"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.toLowerCase() }}
                />
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Key properties accordion */}
        <Section
          title="Key properties"
          open={openSection === "properties"}
          onToggle={() => toggle("properties")}
        >
          <ul className="space-y-1 pl-1">
            {props.map((p) => (
              <li
                key={p}
                className="flex items-start gap-1 text-sm leading-relaxed"
              >
                <CheckIcon className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </Section>

        {/* Typical uses accordion */}
        {uses.length > 0 && (
          <Section
            title="Typical uses"
            open={openSection === "uses"}
            onToggle={() => toggle("uses")}
          >
            <ul className="space-y-1 pl-1">
              {uses.map((u) => (
                <li
                  key={u}
                  className="flex items-start gap-1 text-sm leading-relaxed"
                >
                  <CheckIcon className="h-4 w-4 shrink-0 mt-0.5 text-sky-500" />
                  {u}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

/**
 * Section – an accordion panel with a title + chevron
 */
function Section({ title, open, onToggle, children }) {
  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center
                   text-sm font-medium py-1.5 px-2
                   hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
      >
        {title}
        <ChevronDownIcon
          className={`h-4 w-4 -mr-1 transform transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="mt-2 px-2">{children}</div>}
    </div>
  );
}