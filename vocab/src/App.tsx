import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useStudent } from "./lib/student";
import Welcome from "./pages/Welcome";
import StudentInfo from "./pages/StudentInfo";
import Home from "./pages/Home";
import LevelPage from "./pages/LevelPage";
import UnitPage from "./pages/UnitPage";
import Flashcards from "./pages/Flashcards";
import WriteMode from "./pages/WriteMode";
import Quiz from "./pages/Quiz";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const student = useStudent();
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* First visit: welcome page. Shared links below open directly. */}
        <Route path="/" element={student ? <Home /> : <Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/student" element={<StudentInfo />} />
        <Route path="/:level" element={<LevelPage />} />
        <Route path="/:level/:unit" element={<UnitPage />} />
        <Route path="/:level/:unit/flashcards" element={<Flashcards />} />
        <Route path="/:level/:unit/write" element={<WriteMode />} />
        <Route path="/:level/:unit/quiz" element={<Quiz />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
