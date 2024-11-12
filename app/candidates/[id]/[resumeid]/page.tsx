import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import GeneratedResumeTable from './GeneratedResumeTable';
import Link from 'next/link';

async function getCandidateWithResume(candidateId: number, resumeId: number) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        resumes: true,
        atsScores: true,
        generatedResumes: {
          where: { resumeId: resumeId },
          include: {
            generatedATSScores: true,
          },
        },
      },
    });
    return candidate;
  } catch (error) {
    console.error('Database query error:', error);
    return null;
  }
}

// Function to capitalize the first letter of each word in the name
const capitalizeName = (name: string) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); // Capitalize first letter of name
};

export default async function CandidateResumePage({ params }: { params: { id: string; resumeid: string } }) {
  const candidateId = parseInt(params.id);
  const resumeId = parseInt(params.resumeid);
  const candidate = await getCandidateWithResume(candidateId, resumeId);

  if (!candidate) {
    return redirect('/candidates/not-found');
  }

  if (candidate.generatedResumes.length === 0) {
    return redirect(`/candidates/${candidateId}/${resumeId}/no-generated-resume`);
  }

  // Serialize and capitalize candidate's name
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
    generatedResumes: candidate.generatedResumes.map((generatedResume) => ({
      ...generatedResume,
      uploadedAt: generatedResume.uploadedAt.toISOString(),
      generatedATSScores: generatedResume.generatedATSScores.map((generatedScore) => ({
        ...generatedScore,
        createdAt: generatedScore.createdAt.toISOString(),
      })),
    })),
  };

  return (
    <div className="container mx-auto p-6">
      {/* Flex container for profile and Go Back button */}
      <div className="flex justify-between items-center mb-6">
        {/* Go Back Button on the Left */}
        <Link
          href={`/candidates/${candidateId}`}
          className="bg-black text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-gray-500 transition-shadow duration-200"
        >
          Back
        </Link>

        {/* Candidate's Name Centered */}
        <h1 className="text-2xl font-bold mx-auto">{candidateSerialized.name}'s Profile</h1>
      </div>

      <GeneratedResumeTable candidate={candidateSerialized} />
    </div>
  );
}
