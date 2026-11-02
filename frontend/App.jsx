import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { authApi } from "./services/api";

// TASK-01: Auth, Dashboard (А. Төгөлдөр)
import Login from "./task-01-auth/Login";
import Dashboard from "./task-01-auth/Dashboard";

// TASK-02: Practice, Quiz, Admin Questions (Мөнхбаяр)
import PracticeCourses from "./task-02-quiz/PracticeCourses";
import QuizQuestion from "./task-02-quiz/QuizQuestion";
import AdminQuestions from "./task-02-quiz/AdminQuestions";

// TASK-03: Learning Path, Quiz Result (Тэмүүлэн - Temka)
import HorizontalLearningPath from "./task-03-path/HorizontalLearningPath";
import QuizResult from "./task-03-path/QuizResult";

// TASK-04: Teacher Room, Course CRUD (Д. Баттөмөр)
import TeacherRoom from "./task-04-teacher/TeacherRoom";
import TeacherCourseForm from "./task-04-teacher/TeacherCourseForm";

// TASK-05: Explore Courses & Lecture Detail (Хүслэн О.)
import ExploreCourses from "./task-05-explore/ExploreCourses";
import LectureDetail from "./task-05-explore/LectureDetail";

// TASK-06: Leaderboard, UI States (Цогжавхлан Б.)
import Leaderboard from "./task-06-leaderboard/Leaderboard";
import GlobalUIStates from "./task-06-leaderboard/GlobalUIStates";

// Role бүрийн нүүр хуудас
const HOME_PAGES = ["/dashboard", "/teacher"];

// Нэвтрээгүй бол /login руу илгээж, очих гэсэн хаягийг state-д хадгална
function RequireLogin() {
  const location = useLocation();
  return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
}

// Нэвтэрсний дараа хадгалсан хаяг руу, байхгүй бол role-ийн нүүр хуудас руу буцаана
function AfterLogin({ home }) {
  const from = useLocation().state?.from;
  return <Navigate to={from && !HOME_PAGES.includes(from) ? from : home} replace />;
}

export default function App() {
  const [user, setUser] = useState(() => authApi.getCurrentUser());

  // Нэвтрэх функц
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  // Системээс гарах функц
  const handleLogout = () => {
    authApi.logout();
    setUser(null);
  };

  const isLoggedIn = !!user;
  const isTeacher = user?.role === "TEACHER";

  /**
   * Нэвтэрсний дараа role-оор чиглүүлэх:
   * TEACHER  → /teacher
   * STUDENT  → /dashboard
   */
  const afterLoginRedirect = isTeacher ? "/teacher" : "/dashboard";

  return (
    <BrowserRouter>
      <Routes>
        {/* TASK-01: Auth & Dashboard */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <AfterLogin home={afterLoginRedirect} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <RequireLogin />
            )
          }
        />

        {/* TASK-02: Practice & Quiz */}
        <Route
          path="/practice"
          element={
            isLoggedIn ? (
              <PracticeCourses user={user} />
            ) : (
              <RequireLogin />
            )
          }
        />
        <Route
          path="/quiz/:unitId"
          element={
            isLoggedIn ? (
              <QuizQuestion user={user} />
            ) : (
              <RequireLogin />
            )
          }
        />
        <Route
          path="/admin/questions"
          element={
            isLoggedIn && isTeacher ? (
              <AdminQuestions user={user} />
            ) : isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <RequireLogin />
            )
          }
        />

        {/* TASK-03: Learning Path & Quiz Result */}
        <Route
          path="/practice/:courseId"
          element={
            isLoggedIn ? (
              <HorizontalLearningPath user={user} />
            ) : (
              <RequireLogin />
            )
          }
        />
        <Route
          path="/quiz/result"
          element={
            isLoggedIn ? (
              <QuizResult user={user} />
            ) : (
              <RequireLogin />
            )
          }
        />

        {/* TASK-04: Teacher Room & Course CRUD */}
        <Route
          path="/teacher"
          element={
            isLoggedIn && isTeacher ? (
              <TeacherRoom user={user} onLogout={handleLogout} />
            ) : isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <RequireLogin />
            )
          }
        />
        <Route
          path="/teacher/courses/new"
          element={
            isLoggedIn && isTeacher ? (
              <TeacherCourseForm user={user} />
            ) : isLoggedIn ? (
              <Navigate to="/dashboard" />
            ) : (
              <RequireLogin />
            )
          }
        />

        {/* TASK-05: Explore Lectures */}
        <Route
          path="/explore"
          element={
            isLoggedIn ? (
              <ExploreCourses user={user} />
            ) : (
              <RequireLogin />
            )
          }
        />
        <Route
          path="/explore/lecture/:id"
          element={
            isLoggedIn ? (
              <LectureDetail user={user} />
            ) : (
              <RequireLogin />
            )
          }
        />

        {/* TASK-06: Leaderboard & UI States */}
        <Route
          path="/leaderboard"
          element={
            isLoggedIn ? (
              <Leaderboard user={user} />
            ) : (
              <RequireLogin />
            )
          }
        />
        <Route path="/ui-states" element={<GlobalUIStates />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
