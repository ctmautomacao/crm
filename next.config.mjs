/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // ESLint roda fora do build (CI/pre-commit). Não bloqueia o build de produção.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript errors também não bloqueiam — checagem via tsc no CI.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
