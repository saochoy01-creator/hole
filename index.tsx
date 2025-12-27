
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMsg = "Không tìm thấy phần tử 'root' trong HTML.";
  console.error(errorMsg);
  document.body.innerHTML += `<div style="color:red; padding:20px;">${errorMsg}</div>`;
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Gia Phả App đã khởi chạy thành công.");
  } catch (error) {
    console.error("Lỗi khi render ứng dụng:", error);
    const display = document.getElementById('error-display');
    if (display) {
      display.style.display = 'block';
      display.innerText = "LỖI RENDER:\n" + (error instanceof Error ? error.message : String(error));
    }
  }
}
