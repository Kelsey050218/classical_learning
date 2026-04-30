import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'

const Home = React.lazy(() => import('./pages/Home'))
const Reading = React.lazy(() => import('./pages/Reading'))
const Learning = React.lazy(() => import('./pages/Learning'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Timeline = React.lazy(() => import('./pages/Timeline'))
const Forum = React.lazy(() => import('./pages/Forum'))
const Exhibition = React.lazy(() => import('./pages/Exhibition'))
const AIScript = React.lazy(() => import('./pages/AIScript'))
const AudioPerf = React.lazy(() => import('./pages/AudioPerf'))
const VideoEdit = React.lazy(() => import('./pages/VideoEdit'))
const ReadingCards = React.lazy(() => import('./pages/ReadingCards'))
const Challenges = React.lazy(() => import('./pages/Challenges'))
const CheckIn = React.lazy(() => import('./pages/CheckIn'))
const RestorationHall = React.lazy(() => import('./pages/Restoration'))
const ChapterRepair = React.lazy(() => import('./pages/Restoration/ChapterRepair'))
const ArchiveHall = React.lazy(() => import('./pages/Restoration/ArchiveHall'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spin size="large" />
  </div>
)

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route
          path="/restoration"
          element={
            <ProtectedRoute>
              <RestorationHall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restoration/archive"
          element={
            <ProtectedRoute>
              <ArchiveHall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restoration/:chapterId"
          element={
            <ProtectedRoute>
              <ChapterRepair />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
