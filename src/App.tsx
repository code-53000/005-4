import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import RecordList from '@/pages/RecordList';
import RecordDetail from '@/pages/RecordDetail';
import RecordForm from '@/pages/RecordForm';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <RecordList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/record/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <RecordDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <Layout>
                <RecordForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <RecordForm />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
