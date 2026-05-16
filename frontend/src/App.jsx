import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
// import './App.css';
import ReaderHome from './pages/ReaderHome';
import StaffHome from './pages/StaffHome';
import BookDetail from './pages/BookDetail';
import ReaderAccount from './pages/ReaderAccount';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) return <Navigate to="/login" />;
  if (role && user.LoaiTaiKhoan !== role) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Route bảo vệ cho Độc giả */}
        <Route path="/reader-home" element={
          <PrivateRoute role="DOC_GIA"><ReaderHome /></PrivateRoute>
        } />
        {/* Route mới cho phần Tài khoản của độc giả */}
        <Route path="/account" element={
          <PrivateRoute role="DOC_GIA"><ReaderAccount /></PrivateRoute>
        } />

        {/* Route bảo vệ cho Nhân viên */}
        <Route path="/staff-home" element={
          <PrivateRoute role="NHAN_VIEN"><StaffHome /></PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/book/:id" element={<BookDetail />} />
      </Routes>
    </Router>
  );
}

export default App;