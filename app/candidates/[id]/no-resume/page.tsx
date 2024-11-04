

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Resume {
  id: number;
  filename: string;
}

interface Candidate {
  id: number;
  name: string;
  resumes?: Resume[];
}

export default function NoResumePage({ params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id);
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCandidate = async () => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);

        // Redirect to /candidates/id if resumes exist
        if (data.resumes && data.resumes.length > 0) {
          router.push(`/candidates/${candidateId}`);
          return;
        }
      } else {
        console.error('Failed to fetch candidate');
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [candidateId]);

  const handleUploadFilesClick = () => {
    router.push(`/generators?candidateId=${candidateId}`);
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-6 text-center">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">All Files for {candidate?.name || 'Candidate'}</h1>
        <button
          onClick={handleUploadFilesClick}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Upload Files
        </button>
      </div>

      <h2 className="text-2xl font-semibold">No Files Yet</h2>
      <p className="mt-4 text-gray-600">
        You do not have any files yet. Upload one by clicking on the "Upload Files" button.
      </p>

      {/* Updated Go Back Link to go to the main candidates page */}
      <Link href="/" className="text-blue-500 mt-4 block">
        Go Back
      </Link>
    </div>
  );
}
