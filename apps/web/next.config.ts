import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // standalone seems to be required for a docker build
  output: 'standalone',
  poweredByHeader: false,
  turbopack: {
    resolveAlias: {
      // I use server-only because it's lightweight package <- can be anything
      // Turboback tries to bundle these Nest dependencies, that nest requires with try-catch to mimick optional require
      'class-validator': 'server-only',
      'class-transformer': 'server-only',
      '@nestjs/websockets/socket-module': 'server-only',
      '@nestjs/platform-express': 'server-only',
      '@nestjs/microservices/microservices-module': 'server-only',
      '@nestjs/microservices': 'server-only',
    },
    rules: {
      '*.ts': [
        {
          loaders: ['./import-rewrite-loader.cjs'],
        },
      ],
      '*.tsx': [
        {
          loaders: ['./import-rewrite-loader.cjs'],
        },
      ],
    },
  },
};

export default nextConfig;
