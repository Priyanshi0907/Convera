export function extractClientSideText(file) {
  return new Promise((resolve, reject) => {
    if (!file.name.toLowerCase().endsWith(".txt")) {
      reject(new Error("Only .txt files can be read directly in the browser."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
