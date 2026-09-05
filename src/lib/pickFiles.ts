export interface PickedFile {
  name: string;
  content: string;
}

const ACCEPTED_EXTENSIONS =
  '.js,.jsx,.mjs,.cjs,.ts,.tsx,.py,.c,.h,.cpp,.cc,.hpp,.java,.go,.rs,.rb,.php,.cs,' +
  '.kt,.swift,.sh,.bash,.sql,.json,.md,.css,.html,.htm,.txt,.yaml,.yml';

/**
 * Opens the browser's file picker and resolves with the text of everything chosen.
 *
 * Built as a detached input rather than a hidden one behind a ref: the title bar builds
 * its menu array during render, and a menu entry closing over `ref.current` counts as
 * reading a ref while rendering. This keeps the whole interaction inside one function,
 * and removes the duplicated read-then-commit logic the explorer and the title bar
 * each had a copy of.
 */
export function pickFiles(): Promise<PickedFile[]> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve([]);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = ACCEPTED_EXTENSIONS;
    input.style.display = 'none';
    document.body.appendChild(input);

    let settled = false;
    const finish = (files: PickedFile[]) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(files);
    };

    input.addEventListener('change', () => {
      const chosen = Array.from(input.files ?? []);
      if (chosen.length === 0) {
        finish([]);
        return;
      }
      // Read every file before committing any of them, so callers never race a
      // half-written workspace.
      Promise.all(
        chosen.map(
          (file) =>
            new Promise<PickedFile>((res) => {
              const reader = new FileReader();
              reader.onload = () => res({ name: file.name, content: String(reader.result ?? '') });
              reader.onerror = () => res({ name: file.name, content: '' });
              reader.readAsText(file);
            })
        )
      ).then(finish);
    });

    // Covers the user dismissing the dialog, which fires no change event.
    input.addEventListener('cancel', () => finish([]));

    input.click();
  });
}
