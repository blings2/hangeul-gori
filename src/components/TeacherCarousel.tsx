import { memo } from 'react';
import { TEACHERS } from '../data/teachers';

const doubled = [...TEACHERS, ...TEACHERS];

function TeacherCarousel() {
  return (
    <section className="carousel-section">
      <h2 className="carousel-section-title">한글고리 선생님을 소개해요</h2>
      <p className="carousel-section-sub">
        아동 한국어 교육 경험, 화상 수업 환경,<br />
        자체 인터뷰를 모두 통과한 선생님들이에요
      </p>
      <div className="carousel-wrapper">
        <div className="carousel-track carousel-track-teachers">
          {doubled.map((t, i) => (
            <div key={i} className="carousel-teacher-card">
              <div className="carousel-teacher-avatar">{t.initial}</div>
              <div className="carousel-teacher-name">{t.name}</div>
              <div className="carousel-teacher-age-group">{t.ageGroup}</div>
              <div className="carousel-teacher-timezone">🌍 {t.timezone}</div>
              <div className="carousel-teacher-tags">
                {t.tags.map(tag => (
                  <span key={tag} className="carousel-teacher-tag">{tag}</span>
                ))}
              </div>
              <div className="carousel-teacher-intro">"{t.intro}"</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TeacherCarousel);
