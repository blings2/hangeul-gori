import { memo } from 'react';
import { REVIEWS } from '../data/reviews';

const doubled = [...REVIEWS, ...REVIEWS];

function ReviewCarousel() {
  return (
    <section className="carousel-section">
      <h2 className="carousel-section-title">한글고리와 함께한 가정들의 이야기</h2>
      <div className="carousel-wrapper">
        <div className="carousel-track carousel-track-reviews">
          {doubled.map((r, i) => (
            <div key={i} className="carousel-review-card">
              <div className="carousel-review-quote-mark">❝</div>
              <p className="carousel-review-text">{r.text}</p>
              <div className="carousel-review-footer">
                <div className="carousel-review-avatar">{r.initial}</div>
                <div>
                  <div className="carousel-review-family-name">{r.familyName}</div>
                  <div className="carousel-review-author">
                    {r.location} · {r.family}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ReviewCarousel);
