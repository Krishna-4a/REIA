"use client";
 
import { useState, useEffect, useRef } from "react";
import { useRouter,useParams } from "next/navigation";
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
 
export default function ResumeTable({ candidate }: { candidate: Candidate }) {
  const [openSummaryIndex, setOpenSummaryIndex] = useState<number | null>(null);
  const [showJobDescription, setShowJobDescription] = useState<number | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [resumes, setResumes] = useState<Resume[]>(candidate.resumes);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
 
  const router = useRouter();
 
  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
 
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
 
  // // Reload page on load if redirected from another page
  // useEffect(() => {
  //   const handlePageReload = () => {
  //     router.refresh();
  //   }
  //     handlePageReload();
  //   }, []);
   
 
  const handleDropdownToggle = (index: number) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };
 
  const handleViewSummaryClick = (index: number) => {
    setOpenSummaryIndex(index);
  };
 
  const handleModifyResumeClick = (candidateId: number, resumeId: number) => {
    router.push(`/modifyresume?candidateId=${candidateId}&resumeId=${resumeId}`);
  };
 
  const handleViewModifiedResumesClick = (candidateId: number, resumeId: number) => {
    router.push(`/candidates/${candidateId}/${resumeId}`);
  };
 
  const handleJobDescriptionClick = async (index: number) => {
    setShowJobDescription(index);
    setLoading(true);
 
    const jobDescriptionUrl = resumes[index].JobDescriptionfileUrl;
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
 
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4"></h2>
      <table className="min-w-full max-w-xs bg-white border border-gray-300 rounded-lg shadow-md">
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
          {resumes.map((resume, index) => {
            const atsScore = candidate.atsScores[index]?.score || "N/A";
 
            return (
              <tr key={resume.id} className="hover:bg-gray-100 transition duration-150">
                <td className="border-b border-gray-300 text-center py-1 text-sm">{resume.Resumefilename}</td>
                <td className="border-b border-gray-300 text-center py-1 text-sm">{atsScore}%</td>
                <td className="border-b border-gray-300 text-center py-1 text-sm">
                  {new Date(resume.uploadedAt).toLocaleDateString()}
                </td>
                <td className="border-b border-gray-300 text-center py-1 text-sm relative">
                  <button
                    onClick={() => handleDropdownToggle(index)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 focus:outline-none transition duration-150 ease-in-out"
                  >
                    <span className="flex space-x-1">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  </button>
 
                  {dropdownIndex === index && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    >
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
                          Transform Resume
                        </button>
                        <button
                          className="flex items-center px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleViewModifiedResumesClick(candidate.id, resume.id)}
                        >
                          View Transformed Resumes
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => {
                            handleDeleteClick(index);
                          }}
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
                className="px-4 py-1 bg-black text-white rounded-full hover:bg-black-600 text-sm"
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
                {resumes[showJobDescription]?.JobDescriptionfileUrl && (
                  <a
                    href={resumes[showJobDescription]?.JobDescriptionfileUrl}
                    download
                    className="px-4 py-1 bg-black text-white rounded-full hover:bg-green-700 text-sm"
                  >
                    Download
                  </a>
                )}
                <button
                  onClick={handleCloseJobDescriptionModal}
                  className="px-4 py-1 bg-black text-white rounded-full hover:bg-black-600 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {resumes[showJobDescription]?.JobDescription || "No Job Description available for this resume."}
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