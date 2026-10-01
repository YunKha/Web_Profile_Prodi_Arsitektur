/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  images: {
    // Next 16 mewajibkan daftar kualitas. Gambar unggahan dilayani lewat /media/*.
    qualities: [75, 85],
    localPatterns: [
      { pathname: "/media/**", search: "" },
      { pathname: "/images/**", search: "" },
    ],
  },
  experimental: {
    // Unggahan lewat Route Handler; batas ini untuk formulir admin berisi teks panjang.
    serverActions: { bodySizeLimit: "4mb" },
  },
  async redirects() {
    return [
      { source: "/akademik", destination: "/akademik/kurikulum", permanent: false },
      { source: "/mahasiswa", destination: "/mahasiswa/kegiatan-akademik", permanent: false },
      { source: "/pengabdian", destination: "/pengabdian/dosen", permanent: false },
      { source: "/profil/visi-misi", destination: "/profil", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
