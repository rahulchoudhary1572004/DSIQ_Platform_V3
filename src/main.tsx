import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';
import '@progress/kendo-theme-default/dist/all.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root container with id "root" was not found');
}

createRoot(rootElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
