/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // @react-pdf/renderer's dependencies (fontkit, etc.) reference Node core
        // modules that don't exist in the browser. Without these fallbacks,
        // some Next.js/webpack combinations bundle it incorrectly, which can
        // produce a PDF blob that downloads but won't open correctly.
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                zlib: false,
                stream: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
