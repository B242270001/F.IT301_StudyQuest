import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './PracticeCourses.css';

export default function PracticeCourses({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses/practice')
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCourses(data.data || data || []);
        setLoading(false);
      })
      .catch(() => {
        fetch('/mock/courses.json')
          .then((res) => res.json())
          .then((data) => {
            setCourses(data.courses || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  return (
    <div className="practice-page" data-testid="page-practice">
      <Navbar user={user} />
      <main className="practice-main">
        <header className="practice-head">
          <span className="practice-eyebrow">Дадлага</span>
          <h1>Дадлага хичээл сонгох</h1>
          <p className="practice-lead">
            Мэдлэгээ баталгаажуулж, интерактив тестийг шийдэж XP цуглуулаарай.
          </p>
        </header>

        {loading ? (
          <div className="practice-state" role="status">
            <p>Ачаалж байна...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="practice-state">
            <p>Дадлага хичээл одоогоор алга байна.</p>
            <Link className="practice-btn" to="/explore">
              Хичээлийн сан руу очих
            </Link>
          </div>
        ) : (
          <div className="practice-grid">
            {courses.map((course) => (
              <article
                key={course.id}
                className={`practice-card${course.isFeatured ? ' featured' : ''}`}
                data-testid="practice-course-card"
              >
                <div className="practice-card-top">
                  <span className="practice-tag">{course.category || 'PROGRAMMING'}</span>
                  {course.isFeatured && <span className="practice-badge">★ Онцлох</span>}
                </div>
                <h2>{course.title}</h2>
                <p className="practice-desc">{course.description}</p>
                <div className="practice-card-foot">
                  <span className="practice-units">
                    {course.totalUnits ? `${course.totalUnits} нэгж` : 'Бүлэг хичээл'}
                  </span>
                  <Link
                    className="practice-btn"
                    to={`/practice/${course.id}`}
                    data-testid="practice-continue"
                  >
                    Зам руу очих →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
