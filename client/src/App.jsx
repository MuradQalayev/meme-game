import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './components/Login';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import NotFound from './components/NotFound';
import UserProfile from './components/UserProfile';
import { AppProvider } from './context/AppContext';
import { getUserId } from './Api.mjs';
import Footer from './components/Footer';  


const App = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hideNav, setHideNav] = useState(true);
    const [score, setScore] = useState(0);
    const [memeImage, setMemeImage] = useState('');
    const [captions, setCaptions] = useState([]);
    const [currentMeme, setCurrentMeme] = useState(0);
    const [timer, setTimer] = useState(30);
    const [expanded, setExpanded] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (username) {
            getUserId(username)
                .then((id) => setUserId(id))
                .catch((error) => console.error('Error fetching user ID:', error));
        }
    }, [username]);

    return (
        <AppProvider>
            <Router>
                <Navigation hideNav={hideNav} setHideNav={setHideNav} setUsername={setUsername} setPassword={setPassword} expanded={expanded} setExpanded={setExpanded}/>
                <div className="container-fluid vh-100 d-flex flex-column">
                    <Routes>
                        <Route path="/" element={<Login setHideNav={setHideNav} setUsername={setUsername} setPassword={setPassword} setAttempts={setAttempts} expanded={expanded} setExpanded={setExpanded}/>} />
                        <Route path="/home" element={<HomePage username={username} attempts={attempts}/>} />
                        <Route path="/profile" element={<UserProfile username={username} userId={userId}/>} />
                        <Route path="/game" element={
                            <GamePage
                                captions={captions} 
                                memeImage={memeImage}
                                setCurrentMeme={setCurrentMeme}
                                setCaptions={setCaptions}
                                setMemeImage={setMemeImage}
                                score={score}
                                timer={timer}
                                setTimer={setTimer}
                                setScore={setScore}
                                attempts={attempts}
                                setAttempts={setAttempts}
                                username={username}
                                userId={userId}
                                setUserId={setUserId}
                            />}
                        />
                        <Route path="/*" element={<NotFound />} />
                    </Routes>
                </div>
                <Footer /> 
            </Router>
        </AppProvider>
    );
};

export default App;
