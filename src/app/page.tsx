"use client";

import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

export default function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

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
    } catch (err: any) {
      setError(err.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  }

  const shortUrl = slug ? `${location.origin}/${slug}` : null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // DOWNLOAD QR
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

          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full p-2 border rounded-lg text-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Short Link + QR"}
          </button>
        </form>

        {/* ERROR */}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        {/* OUTPUT */}
        {shortUrl && (
          <div className="mt-8 flex flex-col items-center">

            <p className="text-sm text-gray-500">Short URL</p>
            <a
              href={shortUrl}
              target="_blank"
              className="text-blue-600 font-medium mb-6"
            >
              {shortUrl}
            </a>

            {/* QR CODE BOX */}
            <div
              ref={qrRef}
              className="relative flex items-center justify-center bg-white p-3 rounded-xl shadow"
              style={{ width: 250, height: 250 }}
            >
              {/* QR */}
              <QRCode value={shortUrl} size={250} />

              {/* CENTER LOGO */}
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

            {/* DOWNLOAD BUTTON */}
            <button
              onClick={handleDownload}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Download QR
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
