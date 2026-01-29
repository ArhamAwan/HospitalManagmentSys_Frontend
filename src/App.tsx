import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { ReceptionDashboard } from '@/pages/reception/Dashboard'
import { RegisterPatient } from '@/pages/reception/RegisterPatient'
import { SearchPatient } from '@/pages/reception/SearchPatient'
import { ReceptionBilling } from '@/pages/reception/Billing'
import { ReceptionQueues } from '@/pages/reception/Queues'
import { DoctorQueue } from '@/pages/doctor/Queue'
import { PatientDetails } from '@/pages/doctor/PatientDetails'
import { DoctorHistory } from '@/pages/doctor/History'
import { NurseDashboard } from '@/pages/nurse/Dashboard'
import { WaitingArea } from '@/pages/display/WaitingArea'
import { DisplayLogin } from '@/pages/display/Login'
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { AdminUsers } from '@/pages/admin/Users'
import { AdminConfig } from '@/pages/admin/Config'
import { AdminSettings } from '@/pages/admin/Settings'
import { AdminAuditLogs } from '@/pages/admin/AuditLogs'
import { DoctorsDirectory } from '@/pages/admin/DoctorsDirectory'
import { ChangePassword } from '@/pages/ChangePassword'
import { ForgotPassword } from '@/pages/ForgotPassword'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/display/login" element={<DisplayLogin />} />
      <Route
        path="/display/waiting"
        element={
          <ProtectedRoute allowedRoles={['DISPLAY', 'ADMIN']} redirectTo="/display/login">
            <WaitingArea />
          </ProtectedRoute>
        }
      />
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
        path="/reception/billing"
        element={
          <ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN']}>
            <ReceptionBilling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reception/queues"
        element={
          <ProtectedRoute allowedRoles={['RECEPTION', 'ADMIN']}>
            <ReceptionQueues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'RECEPTION']}>
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
        path="/doctor/history"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
            <DoctorHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurse"
        element={
          <ProtectedRoute allowedRoles={['NURSE', 'ADMIN']}>
            <NurseDashboard />
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
      <Route
        path="/account/change-password"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTION', 'DOCTOR']}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/config"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminConfig />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAuditLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTION']}>
            <DoctorsDirectory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
