import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home from './pages/Home.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import DashboardFreelancer from './pages/DashboardFreelancer.jsx'
import DashboardClient from './pages/DashboardClient.jsx'
import Profile from './pages/Profile.jsx'
import Messages from './pages/Messages.jsx'
import Proposals from './pages/Proposals.jsx'
import Settings from './pages/Settings.jsx'
import CreateGig from './pages/CreateGig.jsx'
import PostProject from './pages/PostProject.jsx'
import Payments from './pages/Payments.jsx'
import MyProfilePage from './pages/MyProfilePage.jsx'
import CreateProject from './pages/CreateProject.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Reviews from './pages/Reviews.jsx'
import Disputes from './pages/Disputes.jsx'
import MyGigs from './pages/MyGigs.jsx'
import MyProjects from './pages/MyProjects.jsx'

export default function App() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup'
  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}
      <main className={!hideNavbar ? "px-4 md:px-6 lg:px-10 max-w-7xl mx-auto pt-24 md:pt-28 pb-10" : "p-0 max-w-none"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard/freelancer" element={<ProtectedRoute><DashboardFreelancer /></ProtectedRoute>} />
          <Route path="/dashboard/freelancer/my-gigs" element={<ProtectedRoute><MyGigs /></ProtectedRoute>} />
          <Route path="/dashboard/freelancer/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
          <Route path="/dashboard/freelancer/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/dashboard/client" element={<ProtectedRoute><DashboardClient /></ProtectedRoute>} />
          <Route path="/dashboard/client/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
          <Route path="/dashboard/client/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/dashboard/client/my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
          <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/create-gig" element={<ProtectedRoute><CreateGig /></ProtectedRoute>} />
          <Route path="/post-project" element={<ProtectedRoute><PostProject /></ProtectedRoute>} />
          <Route path="/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/dashboard/freelancer/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/dashboard/client/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/disputes" element={<ProtectedRoute><Disputes /></ProtectedRoute>} />
        </Routes>
      </main>
      {!hideNavbar && <Footer />}
    </div>
  )
}
