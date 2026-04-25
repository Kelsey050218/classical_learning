import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Reading from './pages/Reading'
import Learning from './pages/Learning'
import Profile from './pages/Profile'
import Timeline from './pages/Timeline'
import Forum from './pages/Forum'
import Exhibition from './pages/Exhibition'
import AIScript from './pages/AIScript'
import AudioPerf from './pages/AudioPerf'
import VideoEdit from './pages/VideoEdit'
import ReadingCards from './pages/ReadingCards'
import Challenges from './pages/Challenges'
import CheckIn from './pages/CheckIn'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reading"
        element={
          <ProtectedRoute>
            <Reading />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning"
        element={
          <ProtectedRoute>
            <Learning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timeline"
        element={
          <ProtectedRoute>
            <Timeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum"
        element={
          <ProtectedRoute>
            <Forum />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum/:topicId"
        element={
          <ProtectedRoute>
            <Forum />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exhibition"
        element={
          <ProtectedRoute>
            <Exhibition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-script"
        element={
          <ProtectedRoute>
            <AIScript />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audio-perf"
        element={
          <ProtectedRoute>
            <AudioPerf />
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-edit"
        element={
          <ProtectedRoute>
            <VideoEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reading-cards"
        element={
          <ProtectedRoute>
            <ReadingCards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <Challenges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkin"
        element={
          <ProtectedRoute>
            <CheckIn />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
