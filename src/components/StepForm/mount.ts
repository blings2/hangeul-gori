import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import StepFormApp from './index';

let root: Root | null = null;

/** #/apply 진입 시 React 루트 마운트 */
export function mountStepForm(container: HTMLElement): void {
  root = createRoot(container);
  root.render(createElement(StepFormApp));
}

/** 다른 라우트로 이동 시 React 루트 언마운트 (메모리 누수 방지) */
export function unmountStepForm(): void {
  if (root) {
    root.unmount();
    root = null;
  }
}
