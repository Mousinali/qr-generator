"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

export default function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  // -----------------------------
  // LOAD ONLY slug + logo ON PAGE LOAD
  // -----------------------------
  useEffect(() => {
    const savedSlug = localStorage.getItem("slug");
    const savedLogo = localStorage.getItem("logo");

    // Keep input EMPTY always on reload
    setUrl("");

    if (savedSlug) setSlug(savedSlug);
    if (savedLogo) setLogo(savedLogo);
  }, []);

  // -----------------------------
  // SAVE DATA TO LOCALSTORAGE
  // -----------------------------
  useEffect(() => {
    if (slug) localStorage.setItem("slug", slug);
  }, [slug]);

  useEffect(() => {
    if (logo) localStorage.setItem("logo", logo);
  }, [logo]);

  // -----------------------------
  // CREATE SHORT LINK
  // -----------------------------
  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSlug(null);
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");

      setSlug(json.slug);
      localStorage.setItem("slug", json.slug);
    } catch (err: any) {
      setError(err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  }

  const shortUrl = slug ? `${location.origin}/${slug}` : null;

  // ----------------------------------------
  // LOGO UPLOAD + PREVIEW (BASE64)
  // ----------------------------------------
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setLogo(base64);
      localStorage.setItem("logo", base64);
    };
    reader.readAsDataURL(file);
  };

  // -----------------------------
  // DOWNLOAD QR IMAGE
  // -----------------------------
  const handleDownload = async () => {
    if (!qrRef.current) return;

    const canvas = await html2canvas(qrRef.current, {
      scale: 3,
      backgroundColor: null,
    });

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // -----------------------------
  // CLEAR EVERYTHING
  // -----------------------------
  const clearAll = () => {
    localStorage.clear();
    setUrl("");
    setSlug(null);
    setLogo(null);
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8">

        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          Short URL + QR Generator
        </h1>

        {/* FORM */}
        <form onSubmit={handleShorten} className="space-y-4">
          <input
            className="w-full p-3 border rounded-lg text-black"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          {/* DRAG & DROP LOGO UPLOAD */}
          <div
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setLogo(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
            onClick={() => document.getElementById("fileUpload")?.click()}
          >
            <p className="text-gray-600 font-medium">
              Drag & Drop your logo here, or click to upload
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG supported</p>

            {logo && (
              <div className="mt-4 flex justify-center">
                <img
                  src={logo}
                  alt="Uploaded Logo Preview"
                  className="w-20 h-20 object-contain bg-white p-2 rounded-lg shadow"
                />
              </div>
            )}
          </div>

          {/* HIDDEN REAL INPUT */}
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = (ev) => setLogo(ev.target?.result as string);
              reader.readAsDataURL(file);
            }}
          />


          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Short Link + QR"}
          </button>
        </form>

        {/* ERROR */}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        {/* RESULT */}
        {shortUrl && (
          <div className="mt-8 flex flex-col items-center">

            <p className="text-sm text-gray-500">Short URL</p>
            <a
              href={shortUrl}
              target="_blank"
              className="text-blue-600 font-medium mb-6 break-all"
            >
              {shortUrl}
            </a>

            {/* QR BOX */}
            <div
              ref={qrRef}
              className="relative flex items-center justify-center bg-white p-3 rounded-xl shadow"
              style={{ width: 250, height: 250 }}
            >
              <QRCode value={shortUrl} size={250} />

              {logo && (
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    width: "20%",
                    height: "20%",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "5px",
                  }}
                >
                  <img
                    src={logo}
                    alt="Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Download QR
              </button>

              <button
                onClick={clearAll}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
