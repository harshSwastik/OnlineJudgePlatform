import { Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import Admin from "./Pages/Admin";
import AdminPanel from "./components/AdminPanel";
import AdminDelete from "./components/AdminDelete";
import AdminVideo from "./components/AdminVideo";
import ProblemPage from "./Pages/ProblemPage";
import UploadVideo from "./components/UploadVideo";
  
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
     <Route 
  path="/problem/:id" 
  element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" />} 
/>
    <Route 
  path="/admin" 
  element={isAuthenticated   ? <Admin /> : <Navigate to="/login" />} 
/>
<Route 
  path="/admin/create" 
  element={isAuthenticated   ? <AdminPanel /> : <Navigate to="/login" />} 
/>
<Route 
  path="/admin/delete" 
  element={isAuthenticated   ? <AdminDelete /> : <Navigate to="/login" />} 
/>
<Route 
  path="/admin/video" 
  element={isAuthenticated   ? <AdminVideo /> : <Navigate to="/login" />} 
/>
  <Route path="/admin/upload/:problemId" element={isAuthenticated ? <UploadVideo /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;