import { createBrowserRouter } from 'react-router-dom';
import Home from '../components/home/index.jsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    }
]);

export default router;
