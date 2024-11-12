
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// interface Generated_Resume {
//     id: number;
//     Resumefilename: string;
//     ResumefileUrl: string;
//     JobDescription: string;
//     uploadedAt: string;
//     resumeId: number;
//     generatedATSScores: Generated_ATS_Score[];
// }

// interface Generated_ATS_Score {
//     score: number;
//     summary: string;
//     createdAt: string;
// }

// interface Candidate {
//     id: number;
//     generatedResumes: Generated_Resume[];
// }

// export default function GeneratedResumeTable({ candidate }: { candidate: Candidate }) {
//     const [openSummaryIndex, setOpenSummaryIndex] = useState<number | null>(null);
//     const [showJobDescription, setShowJobDescription] = useState<number | null>(null);
//     const [jobDescriptionText, setJobDescriptionText] = useState<string>("");
//     const [loading, setLoading] = useState<boolean>(false);
//     const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(null);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null); // State for delete confirmation popup
//     const router = useRouter();

//     const handleViewSummaryClick = (index: number) => {
//         setOpenSummaryIndex(index);
//     };

//     const handleModifyResumeClick = (candidateId: number, resumeId: number, generatedResumeId: number) => {
//         router.push(/modifyresume?candidateId=${candidateId}&resumeId=${resumeId}&generatedResumeId=${generatedResumeId});
//     };

//     const handleJobDescriptionClick = async (index: number) => {
//         setShowJobDescription(index);
//         setLoading(true);

//         const jobDescriptionUrl = candidate.generatedResumes[index].ResumefileUrl;
//         try {
//             const response = await fetch(jobDescriptionUrl);
//             if (response.ok) {
//                 const text = await response.text();
//                 setJobDescriptionText(text);
//             } else {
//                 setJobDescriptionText("Failed to load Job Description");
//             }
//         } catch (error) {
//             setJobDescriptionText("Error fetching Job Description");
//         }
//         setLoading(false);
//     };

//     const handleDeleteClick = (generatedResumeId: number) => {
//         setShowDeleteConfirm(generatedResumeId); // Show confirmation popup with resume ID
//     };

//     const confirmDelete = async () => {
//         if (showDeleteConfirm === null) return; // If no resume selected, return

//         try {
//             const response = await fetch(/api/deleteGeneratedResume, {
//                 method: "DELETE",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ generatedResumeId: showDeleteConfirm }),
//             });

//             if (response.ok) {
//                 alert("Generated resume deleted successfully.");
//                 router.refresh();
//             } else {
//                 const errorData = await response.json();
//                 alert(Failed to delete the generated resume: ${errorData.error});
//             }
//         } catch (error) {
//             alert("An error occurred while deleting the generated resume.");
//         } finally {
//             setShowDeleteConfirm(null); // Close the confirmation modal
//         }
//     };

//     const handleCloseSummaryModal = () => {
//         setOpenSummaryIndex(null);
//     };

//     const handleCloseJobDescriptionModal = () => {
//         setShowJobDescription(null);
//         setJobDescriptionText("");
//     };

//     return (
//         <div>
//             <h2 className="text-xl font-semibold mb-4">Generated Resumes and ATS Scores</h2>
//             <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
//                 <thead className="bg-gray-200">
//                     <tr>
//                         <th className="border p-2 text-left">Filename</th>
//                         <th className="border p-2 text-left">ATS Score</th>
//                         <th className="border p-2 text-left">Created At</th>
//                         <th className="border p-2 text-left">Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {candidate.generatedResumes.map((resume, index) => {
//                         const atsScore = resume.generatedATSScores[0]?.score || "N/A";
//                         const summary = resume.generatedATSScores[0]?.summary || "No summary available";

//                         return (
//                             <tr key={resume.id} className="border-b border-gray-200">
//                                 <td className="border p-2">{resume.Resumefilename}</td>
//                                 <td className="border p-2">{atsScore}%</td>
//                                 <td className="border p-2">{new Date(resume.uploadedAt).toLocaleDateString()}</td>
//                                 <td className="border p-2 relative">
//                                     <button
//                                         onClick={() => setDropdownOpenIndex(dropdownOpenIndex === index ? null : index)}
//                                         className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                                     >
//                                         Options
//                                     </button>
//                                     {dropdownOpenIndex === index && (
//                                         <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
//                                             <div className="py-1">
//                                                 <button
//                                                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                                                     onClick={() => handleViewSummaryClick(index)}
//                                                 >
//                                                     View Summary
//                                                 </button>
//                                                 <button
//                                                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                                                     onClick={() => handleJobDescriptionClick(index)}
//                                                 >
//                                                     View Job Description
//                                                 </button>
//                                                 <a
//                                                     href={resume.ResumefileUrl}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                                                 >
//                                                     Download Resume
//                                                 </a>
//                                                 <button
//                                                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                                                     onClick={() => handleModifyResumeClick(candidate.id, resume.resumeId, resume.id)}
//                                                 >
//                                                     Build Resume
//                                                 </button>
//                                                 <button
//                                                     className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//                                                     onClick={() => handleDeleteClick(resume.id)}
//                                                 >
//                                                     Delete
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </td>
//                             </tr>
//                         );
//                     })}
//                 </tbody>
//             </table>

//             {/* Delete Confirmation Modal */}
//             {showDeleteConfirm !== null && (
//                 <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-lg p-6 max-w-md w-full">
//                         <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
//                         <p>Are you sure you want to delete this generated resume? This action cannot be undone.</p>
//                         <div className="flex justify-end mt-4">
//                             <button
//                                 onClick={() => setShowDeleteConfirm(null)}
//                                 className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={confirmDelete}
//                                 className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
//                             >
//                                 Confirm
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
            
//             {/* Summary Modal */}
//             {openSummaryIndex !== null && (
//                 <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white p-4 w-[820px] h-[400px] overflow-y-scroll rounded-xl shadow-lg relative">
//                         <button
//                             onClick={handleCloseSummaryModal}
//                             className="absolute top-2 right-2 px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
//                         >
//                             Close
//                         </button>
//                         <h3 className="text-md font-semibold mb-1">Summary</h3>
//                         <p className="text-sm text-gray-600 whitespace-pre-line">
//                             {candidate.generatedResumes[openSummaryIndex]?.generatedATSScores[0]?.summary || "No summary available for this resume."}
//                         </p>
//                     </div>
//                 </div>
//             )}
//             {showJobDescription !== null && (
//                 <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
//                     <div className="bg-white p-4 w-[820px] h-[400px] overflow-y-scroll rounded-xl shadow-lg relative">
//                         <button
//                             onClick={handleCloseJobDescriptionModal}
//                             className="absolute top-2 right-2 px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
//                         >
//                             Close
//                         </button>
//                         <h3 className="text-md font-semibold mb-1">Job Description</h3>
//                         <p className="text-sm text-gray-700 mb-4">
//                             {candidate.generatedResumes[showJobDescription]?.JobDescription || "No Job Description available for this resume."}
//                         </p>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Generated_Resume {
  id: number;
  Resumefilename: string;
  ResumefileUrl: string;
  JobDescription: string;
  uploadedAt: string;
  resumeId: number;
  generatedATSScores: Generated_ATS_Score[];
}

interface Generated_ATS_Score {
  score: number;
  summary: string;
  createdAt: string;
}

interface Candidate {
  id: number;
  generatedResumes: Generated_Resume[];
}

export default function GeneratedResumeTable({ candidate }: { candidate: Candidate }) {
  const [openSummaryIndex, setOpenSummaryIndex] = useState<number | null>(null);
  const [showJobDescription, setShowJobDescription] = useState<number | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const router = useRouter();

  const handleViewSummaryClick = (index: number) => {
    setOpenSummaryIndex(index);
  };

  const handleModifyResumeClick = (candidateId: number, resumeId: number, generatedResumeId: number) => {
    router.push(`/modifyresume?candidateId=${candidateId}&resumeId=${resumeId}&generatedResumeId=${generatedResumeId}`);
  };

  const handleJobDescriptionClick = async (index: number) => {
    setShowJobDescription(index);
    setLoading(true);

    const jobDescriptionUrl = candidate.generatedResumes[index].ResumefileUrl;
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

  const handleDeleteClick = (generatedResumeId: number) => {
    setShowDeleteConfirm(generatedResumeId);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm === null) return;

    try {
      const response = await fetch(`/api/deleteGeneratedResume`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ generatedResumeId: showDeleteConfirm }),
      });

      if (response.ok) {
        alert("Generated resume deleted successfully.");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete the generated resume: ${errorData.error}`);
      }
    } catch (error) {
      alert("An error occurred while deleting the generated resume.");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleCloseSummaryModal = () => {
    setOpenSummaryIndex(null);
  };

  const handleCloseJobDescriptionModal = () => {
    setShowJobDescription(null);
    setJobDescriptionText("");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Generated Resumes and ATS Scores</h2>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="border-b-2 border-gray-300 text-center py-2 text-sm font-semibold text-gray-700">Filename</th>
            <th className="border-b-2 border-gray-300 text-center py-2 text-sm font-semibold text-gray-700">ATS Score</th>
            <th className="border-b-2 border-gray-300 text-center py-2 text-sm font-semibold text-gray-700">Created At</th>
            <th className="border-b-2 border-gray-300 text-center py-2 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidate.generatedResumes.map((resume, index) => {
            const atsScore = resume.generatedATSScores.find((score) => score.createdAt)?.score || "N/A";
            const summary = resume.generatedATSScores.find((score) => score.createdAt)?.summary || "No summary available";

            return (
              <tr key={resume.id} className="hover:bg-gray-100 transition duration-150">
                <td className="border-b border-gray-300 text-center py-2 text-sm">{resume.Resumefilename}</td>
                <td className="border-b border-gray-300 text-center py-2 text-sm">{atsScore}%</td>
                <td className="border-b border-gray-300 text-center py-2 text-sm">{new Date(resume.uploadedAt).toLocaleDateString()}</td>
                <td className="border-b border-gray-300 text-center py-2 text-sm relative">
                  <button
                    onClick={() => setDropdownOpenIndex(dropdownOpenIndex === index ? null : index)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 focus:outline-none transition duration-150 ease-in-out"
                  >
                    <span className="flex space-x-1">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  </button>

                  {dropdownOpenIndex === index && (
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
                          onClick={() => handleModifyResumeClick(candidate.id, resume.resumeId, resume.id)}
                        >
                          Build Resume
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => handleDeleteClick(resume.id)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this generated resume? This action cannot be undone.</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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
              {candidate.generatedResumes[openSummaryIndex]?.generatedATSScores.find((score) => score.createdAt)?.summary || "No summary available for this resume."}
            </p>
          </div>
        </div>
      )}
      
      {/* Job Description Modal */}
      {showJobDescription !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 w-[820px] h-[400px] overflow-y-scroll rounded-xl shadow-lg relative">
            <button
              onClick={handleCloseJobDescriptionModal}
              className="absolute top-2 right-2 px-4 py-1 bg-black text-white rounded-full hover:bg-red-600 text-sm"
            >
              Close
            </button>
            <h3 className="text-md font-semibold mb-1">Job Description</h3>
            <p className="text-sm text-gray-700 mb-4">
              {candidate.generatedResumes[showJobDescription]?.JobDescription || "No Job Description available for this resume."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
