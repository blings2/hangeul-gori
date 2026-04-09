import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import TeacherCarousel from './TeacherCarousel';
import ReviewCarousel from './ReviewCarousel';

let roots: Root[] = [];

/** 홈 페이지 마운트 후 캐러셀 React 루트 삽입 */
export function mountHomeCarousels(container: HTMLElement): void {
  const teacherEl = container.querySelector<HTMLElement>('#teacher-carousel-root');
  const reviewEl  = container.querySelector<HTMLElement>('#review-carousel-root');
  if (teacherEl) {
    const r = createRoot(teacherEl);
    r.render(createElement(TeacherCarousel));
    roots.push(r);
  }
  if (reviewEl) {
    const r = createRoot(reviewEl);
    r.render(createElement(ReviewCarousel));
    roots.push(r);
  }
}

/** 다른 라우트로 이동 시 언마운트 */
export function unmountHomeCarousels(): void {
  roots.forEach(r => r.unmount());
  roots = [];
}
