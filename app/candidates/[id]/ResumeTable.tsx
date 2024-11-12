"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
}

interface Candidate {
  id: number;
  resumes: Resume[];
  atsScores: ATS_Score[];
}

// Capitalize function for candidate name
const capitalizeName = (name: string) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); // Capitalize the first letter
};

export default function ResumeTable() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openSummaryIndex, setOpenSummaryIndex] = useState<number | null>(null);
  const [showJobDescription, setShowJobDescription] = useState<number | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleViewSummaryClick = (index: number) => {
    setOpenSummaryIndex(index);
  };

  const handleModifyResumeClick = (candidateId: number, resumeId: number) => {
    router.push(`/modifyresume?candidateId=${candidateId}&resumeId=${resumeId}`);
  };

  const handleviewmodifiedresumesClick = (candidateId: number, resumeId: number) => {
    router.push(`/candidates/${candidateId}/${resumeId}`);
  };

  const handleJobDescriptionClick = async (index: number) => {
    setShowJobDescription(index);
    setLoading(true);

    const jobDescriptionUrl = candidate.resumes[index].JobDescriptionfileUrl;
    try {
      const response = await fetch(jobDescriptionUrl);
      if (response.ok) {
        let text = await response.text();
        text = text.trim(); // Remove leading and trailing whitespace
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
        setDeleteConfirmIndex(null); // Close delete confirmation modal
        window.location.reload(); // Trigger a full page refresh
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
      {/* Display the capitalized candidate name */}
      <h2 className="text-xl font-semibold mb-4">Candidates: {capitalizeName(candidate.name)}</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-200">
          <tr>
            {["Filename", "ATS Score", "Created At", "Actions"].map((header, idx) => (
              <th
                key={idx}
                className="border-b-2 border-gray-300 text-center py-1 text-sm font-semibold text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidate.resumes.map((resume, index) => {
            const atsScore = candidate.atsScores[index]?.score || "N/A";
            const summary = candidate.atsScores[index]?.summary || "No summary available";
            const [isDropdownOpen, setDropdownOpen] = useState(false);
            const handleDropdownMouseEnter = () => setDropdownOpen(true);
            const handleDropdownMouseLeave = () => setDropdownOpen(false);

            return (
              <tr key={resume.id} className="hover:bg-gray-100 transition duration-150">
                <td className="border-b border-gray-300 text-center py-1 text-sm">{resume.Resumefilename}</td>
                <td className="border-b border-gray-300 text-center py-1 text-sm">{atsScore}%</td>
                <td className="border-b border-gray-300 text-center py-1 text-sm">{new Date(resume.uploadedAt).toLocaleDateString()}</td>
                <td
                  className="border-b border-gray-300 text-center py-1 text-sm relative"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 focus:outline-none transition duration-150 ease-in-out"
                  >
                    <span className="flex space-x-1">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="py-1">
                        <button
                          className="flex items-center px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleViewSummaryClick(index)}
                        >
                          View Summary
                        </button>
                        <button
                          className="flex items-center px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleJobDescriptionClick(index)}
                        >
                          View Job Description
                        </button>
                        <a
                          href={resume.ResumefileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Download Resume
                        </a>
                        <button
                          className="flex items-center px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleModifyResumeClick(candidate.id, resume.id)}
                        >
                          Build Resume
                        </button>
                        <button
                          className="flex items-center px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleviewmodifiedresumesClick(candidate.id, resume.id)}
                        >
                          View Modified Resumes
                        </button>
                        <button
                          className="flex items-center px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => console.log("Deleting File")}
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-semibold">Summary</h3>
              <button
                onClick={handleCloseSummaryModal}
                className="px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
              >
                Close
              </button>
            </div>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold">Job Description</h3>
              <div className="flex space-x-2">
                {candidate.resumes[showJobDescription]?.JobDescriptionfileUrl && (
                  <a
                    href={candidate.resumes[showJobDescription]?.JobDescriptionfileUrl}
                    download
                    className="px-4 py-1 bg-black text-white rounded-full hover:bg-green-700 text-sm"
                  >
                    Download
                  </a>
                )}
                <button
                  onClick={handleCloseJobDescriptionModal}
                  className="px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {candidate.resumes[showJobDescription]?.JobDescription || "No Job Description available for this resume."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
