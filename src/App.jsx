import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import NewTask from './pages/NewTask';
import "@fontsource/firago";
import "@fontsource/fredoka-one";

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
          <Header />
          </>
          } />
        <Route path="/NewTask" element={
          <>
          <Header />
          <NewTask />
          </>
          } />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
