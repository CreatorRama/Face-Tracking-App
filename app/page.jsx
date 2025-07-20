'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FaceTrackingComponent = dynamic(
  () => import('../components/FaceTrackingComponent'),
  { 
    ssr: false,
    loading: () => <div className="text-center py-4">Loading face tracking...</div>
  }
);

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-red-100">
      <h1 className="text-3xl font-bold text-center mb-8">Face Tracking App</h1>
      <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
        <FaceTrackingComponent />
      </Suspense>
    </main>
  );
}