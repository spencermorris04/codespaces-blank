'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PDFComponent = dynamic(() => import('./PDFComponent'), { ssr: false });

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">PDF to Text Converter</h1>
      <PDFComponent />
    </main>
  );
}