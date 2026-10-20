const target = process.env.API_PROXY_TARGET;
if(process.env.VITE_PREVIEW_MODE === "false" && !target)throw new Error("Configure a verified API_PROXY_TARGET before enabling the live backend");
if (target) {
  const url = new URL(target);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error(
      "API_PROXY_TARGET must be an HTTPS origin without credentials or a path",
    );
}

export const config = {
  framework: "vite",
  installCommand: "npm ci",
  buildCommand: process.env.VITE_PREVIEW_MODE === "false" ? "npm run build" : "npm run build:preview",
  outputDirectory: "build",
  rewrites: target
    ? [
        {
          source: "/api/:path*",
          destination: target.replace(/\/$/, "") + "/api/:path*",
        },
      ]
    : [],
  headers: [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(self)",
        },
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
        },
      ],
    },
  ],
};
