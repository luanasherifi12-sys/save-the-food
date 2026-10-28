import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES, ROLE_STORAGE_KEY } from './lib/constants.js'
import AppLayout from './components/AppLayout.jsx'
import Toaster from './components/Toaster.jsx'
import RoleSelectPage from './pages/RoleSelectPage.jsx'
import PublishPage from './pages/PublishPage.jsx'
import BusinessDonationsPage from './pages/BusinessDonationsPage.jsx'
import BrowsePage from './pages/BrowsePage.jsx'
import DonationDetailPage from './pages/DonationDetailPage.jsx'
import ImpactPage from './pages/ImpactPage.jsx'
import PickupsPage from './pages/PickupsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'

// Returns the saved role, or null if nothing (or something invalid) is saved.
function loadSavedRole() {
  const saved = localStorage.getItem(ROLE_STORAGE_KEY)
  return ROLES[saved] ? saved : null
}

function App() {
  // Passing a function to useState runs it only on the first render.
  const [role, setRole] = useState(loadSavedRole)

  function changeRole(newRole) {
    if (newRole) {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole)
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY)
    }
    setRole(newRole)
  }

  return (
    <>
      <AppRoutes role={role} changeRole={changeRole} />
      {/* Short messages after actions ("U rezervua!"), on every page */}
      <Toaster />
    </>
  )
}

function AppRoutes({ role, changeRole }) {
  return (
    <Routes>
      <Route path="/" element={<RoleSelectPage role={role} onSelectRole={changeRole} />} />

      {/* All pages below share the header and bottom navigation from AppLayout */}
      <Route element={<AppLayout role={role} onChangeRole={() => changeRole(null)} />}>
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/my-donations" element={<BusinessDonationsPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/donations/:id" element={<DonationDetailPage />} />
        <Route path="/pickups" element={<PickupsPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      {/* Unknown address -> back to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
