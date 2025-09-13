import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Clean up after tests
afterEach(() => {
	cleanup();
});

// Polyfill ResizeObserver if not available
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}
(global as any).ResizeObserver = ResizeObserver;
