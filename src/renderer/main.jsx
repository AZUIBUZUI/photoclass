import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/global.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#0f172a', color: '#e2e8f0',
          fontFamily: '-apple-system, "Microsoft YaHei", sans-serif',
          flexDirection: 'column', gap: '16px', padding: '40px',
        },
      }, [
        React.createElement('h2', { key: 1, style: { color: '#f87171' } }, '应用发生了错误'),
        React.createElement('pre', {
          key: 2,
          style: { maxWidth: '600px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '13px', color: '#94a3b8', background: '#1e293b', padding: '16px', borderRadius: '8px' },
        }, this.state.error?.message || String(this.state.error)),
        React.createElement('p', { key: 3, style: { color: '#64748b', fontSize: '13px' } }, '请查看终端输出（Ctrl+Shift+I 打开开发者工具）'),
      ]);
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    React.createElement(ErrorBoundary, null,
      React.createElement(React.StrictMode, null,
        React.createElement(App)
      )
    )
  );
} else {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#f87171;font-family:sans-serif">找不到 #root 元素</div>';
}
