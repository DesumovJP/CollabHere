import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    // Ensure Turbopack uses the frontend folder as the workspace root
    turbopack: {
        root: __dirname,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'http', // Or 'https' if your local server uses HTTPS
                hostname: 'localhost',
                port: '1337',
                pathname: '/**', // Allows any path on this host and port
            },
        ],
    },
}


export default nextConfig;