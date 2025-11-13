import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Meeting from './pages/Meeting';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meeting/:roomId" element={<Meeting />} />
      </Routes>
    </Router>
  );
}

export default App;
