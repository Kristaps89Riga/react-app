// App.tsx
import { Routes, Route } from "react-router-dom";
import CalvinHome from "./pages/CalvinHome";
import BlogApp from "./BlogApp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<CalvinHome />} />
      <Route path="/blog" element={<BlogApp />} />  {/* <-- new route */}
      {/* If there is another pages, add theme here */}
    </Routes>
  );
}

export default App;
