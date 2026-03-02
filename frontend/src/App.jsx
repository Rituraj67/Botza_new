import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Product from './pages/Product';
import About from './pages/About';
import Helpdesk from './pages/Helpdesk';
import FaqDetail from './pages/FaqDetail';
import VideoDetail from './pages/VideoDetail';
import TopicDetail from './pages/TopicDetail';
import CategoryDetail from './pages/CategoryDetail';


export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product" element={<Product />} />
            <Route path="/about" element={<About />} />
            <Route path="/helpdesk" element={<Helpdesk />} />
            <Route path="/faq/:id" element={<FaqDetail />} />
            <Route path="/video/:id" element={<VideoDetail />} />
            <Route path="/topic/:topicId" element={<TopicDetail />} />
            <Route path="/category/:categoryName" element={<CategoryDetail />} />
            {/* Legacy HTML file redirects */}
            <Route path="/index.html" element={<Home />} />
            <Route path="/login.html" element={<Login />} />
            <Route path="/product.html" element={<Product />} />
            <Route path="/about.html" element={<About />} />
        </Routes>
    );
}
