import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

import Landing from './components/landing/landing';
import Game from './components/game/game';
import { UserContext } from './user/user-context';
import { User } from './user/user';

function App() {
  const [_user, _setUser] = useState<User>();

  const setUser = (user: User) => {
    _setUser(user);
  };

  return (
    <UserContext.Provider value={_user}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing setUser={setUser} />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
