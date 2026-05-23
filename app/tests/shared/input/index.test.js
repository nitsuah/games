import { keyboardManager, mouseManager } from '@/lib/shared/input';
import keyboardManagerModule from '@/lib/shared/input/KeyboardManager';
import mouseManagerModule from '@/lib/shared/input/MouseManager';

describe('shared input barrel exports', () => {
  it('re-exports keyboardManager and mouseManager', () => {
    expect(keyboardManager).toBe(keyboardManagerModule);
    expect(mouseManager).toBe(mouseManagerModule);
  });
});