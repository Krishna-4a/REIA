"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Modal from "react-modal";
import { FaUser, FaCog } from "react-icons/fa"; // Import the candidate and settings icons

interface Resume {
  id: number;
  filename: string;
  fileUrl: string;
  uploadedAt: string;
}

interface ATS_Score {
  id: number;
  score: number;
  summary: string;
  createdAt: string;
}

interface Candidate {
  id: number;
  name: string;
  createdAt: string;
  resumes: Resume[];
  scores: ATS_Score[];
}

// Modal styles
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "500px",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
  },
};

export default function HomePageContent() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const router = useRouter();
  const pathname = usePathname(); // Get the current route

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCreateCandidate = async () => {
    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: candidateName }),
      });

      if (response.ok) {
        alert("Candidate created successfully!");
        setCandidateName("");
        closeModal();
        fetchCandidates();
      } else {
        alert("Failed to create candidate.");
      }
    } catch (error) {
      console.error("Error creating candidate:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCandidates();
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") {
    return (
      <div className="text-center mt-10">
        <p>Please sign in to access this page.</p>
        <button
          onClick={() => signIn()}
          className="mt-4 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  const isActiveRoute = (path: string) => pathname === path;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-[15%] bg-white p-4 border-r border-gray-300 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-semibold mb-6 text-black">REIA</h1>
          <ul>
            <li className="mb-4">
              <a
                href="/"
                className={`text-lg px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActiveRoute("/") ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-200 hover:text-black"
                }`}
              >
                <FaUser className={isActiveRoute("/") ? "text-white" : "text-gray-500"} />
                <span>Candidates</span>
              </a>
            </li>
            <li className="mb-4">
              <a
                href="/settings"
                className={`text-lg px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isActiveRoute("/settings") ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-200 hover:text-black"
                }`}
              >
                <FaCog className={isActiveRoute("/settings") ? "text-white" : "text-gray-500"} />
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </div>
        <div className="mt-auto">
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative flex-1 p-8 bg-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">All Candidates</h1>
          <button
            onClick={openModal}
            className="bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition"
          >
            New Candidate
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="relative flex flex-col justify-between items-center bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/candidates/${candidate.id}`)}
              >
                {/* Candidate Icon on top */}
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700">
                  <FaUser />
                </div>
                
                {/* Candidate Name */}
                <h3 className="text-xl font-medium text-gray-800 mt-4">{candidate.name}</h3>
                
                {/* Date of creation */}
                <p className="mt-4 text-gray-500 text-sm">
                  Created on: {new Date(candidate.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No candidates available.</p>
          )}
        </div>

        {/* Modal for creating a new candidate */}
        <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customStyles}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Create a new candidate</h2>
            <input
              type="text"
              placeholder="Candidate Name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="border p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCreateCandidate}
                className="bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
              >
                Create Candidate
              </button>
              <button
                onClick={closeModal}
                className="py-2 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
