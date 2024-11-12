import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ResumeTable from './ResumeTable'; // Client-side component for handling UI
import Link from 'next/link'; // Use Link for client-side navigation

// Fetch candidate data based on the ID
async function getCandidate(id: number) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      resumes: true,  // Fetch resumes related to this candidate
      atsScores: true,   // Fetch ATS scores related to this candidate
    },
  });
  return candidate;
}

// Function to capitalize the first letter of each word in the name
const capitalizeName = (name: string) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); // Capitalize first letter of name
};

export default async function CandidatePage({ params }: { params: { id: string } }) {
  const candidateId = parseInt(params.id);

  // Fetch the candidate data
  const candidate = await getCandidate(candidateId);

  // If candidate is not found, redirect to 404 or not-found page
  if (!candidate) {
    return redirect('/candidates/not-found');
  }

  // If candidate exists but has no resumes, redirect to the no-resume page
  if (candidate.resumes.length === 0) {
    return redirect(`/candidates/${candidateId}/no-resume`);
  }

  // Convert dates to strings to pass to the client component
  const candidateSerialized = {
    ...candidate,
    name: capitalizeName(candidate.name), // Capitalize the candidate's name
    resumes: candidate.resumes.map((resume) => ({
      ...resume,
      uploadedAt: resume.uploadedAt.toISOString(),
    })),
    scores: candidate.atsScores.map((score) => ({
      ...score,
      createdAt: score.createdAt.toISOString(),
    })),
  };

  // Return the JSX layout with modified buttons and heading
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        {/* Back Button aligned to the left */}
        <Link
          href="/"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Back
        </Link>

        <h1 className="text-2xl font-bold">{candidate.name}'s Profile</h1>

        {/* Upload Files Button */}
        <Link
          href={`/generators?candidateId=${candidateId}`}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Upload Files
        </Link>
      </div>
      
      <ResumeTable candidate={candidateSerialized} />

    </div>
  );
}
