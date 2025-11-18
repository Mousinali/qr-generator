"use client";

import { useState } from "react";
import QRCode from "react-qr-code";

export default function Home() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null); // dynamic uploaded logo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSlug(null);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setSlug(json.slug);
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  const shortUrl = slug ? `${location?.origin}/${slug}` : null;

  // HANDLE LOGO UPLOAD
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogo(ev.target?.result as string); // base64 preview
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4 text-black">Shorten + QR + Logo</h1>

        <form onSubmit={handleShorten} className="space-y-4">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-3 border rounded text-black"
          />

          {/* LOGO UPLOADER */}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full p-2 border rounded text-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Creating..." : "Create Short Link + QR"}
          </button>
        </form>

        {error && <p className="mt-3 text-red-600">{error}</p>}

        {shortUrl && (
          <div className="mt-6 flex items-start gap-6">
            <div>
              <p className="text-sm text-gray-500">Short URL</p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600"
              >
                {shortUrl}
              </a>
            </div>

            {/* QR WITH CENTER LOGO */}
            <div className="relative w-40 h-40">
              <QRCode value={shortUrl} size={160} className="rounded" />

              {logo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={logo}
                    className="w-12 h-12 bg-white rounded-md p-1 shadow"
                    alt="Logo"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
