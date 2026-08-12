import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { fetchProblems } from "../problemSlice"; 
import { NavLink, useNavigate } from "react-router-dom";

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // 1. Pull the 'user' object from the auth state alongside isAuthenticated
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: problems, isLoading, error } = useSelector((state) => state.problems);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("All Problems");
  const [difficultyFilter, setDifficultyFilter] = useState("All Difficulties");
  const [tagFilter, setTagFilter] = useState("All Tags");

  // 2. State to control the visibility of the logout dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      dispatch(fetchProblems());
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesDifficulty =
      difficultyFilter === "All Difficulties" ||
      problem.difficulty === difficultyFilter.toLowerCase();
    
    const matchesTag =
      tagFilter === "All Tags" || 
      (problem.tags && problem.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase()));

    return matchesDifficulty && matchesTag;
  });
console.log("Check problem properties:", problems);
console.log("Redux User State:", user);

  return (
    <div className="min-h-screen bg-[#1d232a] font-sans text-gray-300">
      
      {/* Navbar Section */}
      <nav className="flex justify-between items-center px-8 py-4 bg-[#191e24] shadow-md border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white tracking-wide">Judgify</h1>
        
        {/* UPDATED: User Dropdown Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors capitalize"
          >
            {/* Display the user's first name, fallback to 'User' just in case */}
            {user?.user?.firstname || 'User'}
            
            {/* Small downward arrow SVG for visual cue */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* The dropdown box that appears when clicked */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-32 bg-[#2a303c] rounded-md shadow-lg border border-gray-700 z-50 overflow-hidden">
              {user?.user?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#333a46] hover:text-white transition-colors border-b border-gray-700"
                >
                  Admin Panel
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#333a46] hover:text-red-300 transition-colors"
              > 
                Logout
              </button>
               
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto mt-8 px-4">
        
        {/* Filters Row */}
        <div className="flex gap-4 mb-6">
          <select 
            className="select select-bordered bg-[#191e24] text-gray-300 border-gray-700 focus:outline-none focus:border-gray-500 w-full max-w-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Problems</option>
            <option>Solved</option>
            <option>Unsolved</option>
          </select>

          <select 
            className="select select-bordered bg-[#191e24] text-gray-300 border-gray-700 focus:outline-none focus:border-gray-500 w-full max-w-xs"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option>All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select 
            className="select select-bordered bg-[#191e24] text-gray-300 border-gray-700 focus:outline-none focus:border-gray-500 w-full max-w-xs"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option>All Tags</option>
            <option>Array</option>
            <option>Hash Table</option>
            <option>String</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && <div className="text-center mt-10">Loading problems...</div>}
        
        {/* Error State */}
        {error && <div className="text-center text-red-500 mt-10">Error loading problems: {error}</div>}

        {/* Problems List */}
        {!isLoading && !error && (
          <div className="flex flex-col gap-3">
            {filteredProblems.map((problem) => (
              <div 
                key={problem._id} 
                onClick={() => navigate(`/problem/${problem._id}`)}
                className="bg-[#2a303c] p-5 rounded-lg flex flex-col gap-3 hover:bg-[#333a46] transition-colors cursor-pointer"
              >
                <h2 className="text-lg font-semibold text-white">
                  {problem.title}
                </h2>
                
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-[#191e24] ${
                    problem.difficulty === 'easy' ? 'bg-[#00b8a3]' : 
                    problem.difficulty === 'medium' ? 'bg-[#ffc01e]' : 'bg-[#ff375f]'
                  }`}>
                    {problem.difficulty}
                  </span>
                  
                  {problem.tags && problem.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#0ea5e9] text-[#191e24]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            {filteredProblems.length === 0 && problems.length > 0 && (
              <div className="text-center text-gray-500 mt-10">
                No problems found matching your filters.
              </div>
            )}
             {problems.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                No problems available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Homepage;