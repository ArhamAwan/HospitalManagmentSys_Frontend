import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { ReceptionDashboard } from '@/pages/reception/Dashboard'
import { RegisterPatient } from '@/pages/reception/RegisterPatient'
import { SearchPatient } from '@/pages/reception/SearchPatient'
import { DoctorQueue } from '@/pages/doctor/Queue'
import { PatientDetails } from '@/pages/doctor/PatientDetails'
import { WaitingArea } from '@/pages/display/WaitingArea'
import { AdminDashboard } from '@/pages/admin/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/display/waiting" element={<WaitingArea />} />
      <Route
        path="/reception"
        element={
          <ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN']}>
            <ReceptionDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reception/register"
        element={
          <ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN']}>
            <RegisterPatient />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reception/search"
        element={
          <ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN']}>
            <SearchPatient />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <DoctorQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patient/:id"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <PatientDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
