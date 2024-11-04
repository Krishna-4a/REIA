"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Resume {
  id: number;
  Resumefilename: string;
  uploadedAt: string;
  ResumefileUrl: string;
  JobDescriptionfileUrl: string;
  JobDescription: string;
}

interface ATS_Score {
  score: number;
  summary: string;
  resumeId: number;
}

interface Candidate {
  id: number;
  name: string;
  resumes: Resume[];
  atsScores: ATS_Score[];
}

export default function ResumeTable() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openSummaryIndex, setOpenSummaryIndex] = useState<number | null>(null);
  const [showJobDescription, setShowJobDescription] = useState<number | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>("");
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const candidateId = params?.id;

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!session?.user?.id || !candidateId) return;

      try {
        console.log("Fetching data from API:", `/api/candidates/${candidateId}`);

        const response = await fetch(`/api/candidates/${candidateId}`);
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Candidate data fetched:", data);

        if (!data || typeof data !== "object" || !data.id) {
          setError("Candidate data is unavailable or invalid.");
        } else {
          setCandidate(data);
        }
      } catch (error) {
        console.error("Error fetching candidate data:", error);
        setError("An error occurred while fetching candidate data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [session?.user?.id, candidateId]);

  const handleViewSummaryClick = (index: number) => {
    setOpenSummaryIndex(index);
  };

  const handleModifyResumeClick = (resumeId: number) => {
    router.push(`/modifyresume?candidateId=${candidate?.id}&resumeId=${resumeId}`);
  };

  const handleViewModifiedResumesClick = (candidateId: number, resumeId: number) => {
    router.push(`/candidates/${candidateId}/${resumeId}`);
  };

  const handleJobDescriptionClick = async (index: number) => {
    setShowJobDescription(index);
    setLoading(true);

    const jobDescriptionUrl = candidate!.resumes[index].JobDescriptionfileUrl;
    try {
      const response = await fetch(jobDescriptionUrl);
      if (response.ok) {
        const text = await response.text();
        setJobDescriptionText(text);
      } else {
        setJobDescriptionText("Failed to load Job Description");
      }
    } catch (error) {
      setJobDescriptionText("Error fetching Job Description");
    }
    setLoading(false);
  };

  const handleCloseSummaryModal = () => {
    setOpenSummaryIndex(null);
  };

  const handleCloseJobDescriptionModal = () => {
    setShowJobDescription(null);
    setJobDescriptionText("");
  };

  const handleDeleteClick = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = async (resumeId: number) => {
    try {
      const response = await fetch(`/api/deleteResume`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId }),
      });

      if (response.ok) {
        alert("Resume deleted successfully.");
        router.refresh();
      } else {
        alert("Failed to delete the resume.");
      }
    } catch (error) {
      alert("An error occurred while deleting the resume.");
    } finally {
      setDeleteConfirmIndex(null);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (!candidate) return <p>No candidate data available.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Candidate: {candidate.name}</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2 text-left">Filename</th>
            <th className="border p-2 text-left">ATS Score</th>
            <th className="border p-2 text-left">Created At</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidate.resumes.map((resume, index) => {
            const atsScore = candidate.atsScores.find(
              (score) => score.resumeId === resume.id
            )?.score || "N/A";

            return (
              <tr key={resume.id} className="border-b border-gray-200">
                <td className="border p-2">{resume.Resumefilename}</td>
                <td className="border p-2">{atsScore}%</td>
                <td className="border p-2">{new Date(resume.uploadedAt).toLocaleDateString()}</td>
                <td className="border p-2 relative">
                  <button
                    onClick={() => setOpenDropdownIndex(openDropdownIndex === index ? null : index)}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Options
                  </button>

                  {openDropdownIndex === index && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleViewSummaryClick(index)}
                        >
                          View Summary
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleJobDescriptionClick(index)}
                        >
                          View Job Description
                        </button>
                        <a
                          href={resume.ResumefileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Download Resume
                        </a>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleModifyResumeClick(resume.id)}
                        >
                          Build Resume
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleViewModifiedResumesClick(candidate.id, resume.id)}
                        >
                          View Modified Resumes
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleDeleteClick(index)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary Modal */}
      {openSummaryIndex !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 w-[820px] h-[400px] overflow-y-scroll rounded-xl shadow-lg relative">
            <button
              onClick={handleCloseSummaryModal}
              className="absolute top-2 right-2 px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
            >
              Close
            </button>
            <h3 className="text-md font-semibold mb-1">Summary</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {candidate.atsScores[openSummaryIndex]?.summary || "No summary available for this resume."}
            </p>
          </div>
        </div>
      )}

      {/* Job Description Modal */}
      {showJobDescription !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 w-[820px] h-[400px] overflow-y-scroll rounded-xl shadow-lg relative">
            {candidate.resumes[showJobDescription]?.JobDescriptionfileUrl && (
              <a
                href={candidate.resumes[showJobDescription]?.JobDescriptionfileUrl}
                download
                className="absolute top-2 right-20 px-4 py-1 bg-black text-white rounded-full hover:bg-green-700 text-sm"
              >
                Download
              </a>
            )}
            <button
              onClick={handleCloseJobDescriptionModal}
              className="absolute top-2 right-2 ml-4 px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
            >
              Close
            </button>
            <h3 className="text-md font-semibold mb-1">Job Description</h3>
            <p className="text-sm text-gray-700 mb-4">
              {candidate.resumes[showJobDescription]?.JobDescription || "No Job Description available for this resume."}
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmIndex !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this resume? This action cannot be undone.</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDeleteConfirmIndex(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(candidate.resumes[deleteConfirmIndex!].id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
