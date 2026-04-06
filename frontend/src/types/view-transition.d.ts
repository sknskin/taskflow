// View Transition API 타입 선언 (브라우저 네이티브 API)
// View Transition API type declaration (browser native API)
interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}

interface Document {
  startViewTransition?: (callback: () => void) => ViewTransition;
}
