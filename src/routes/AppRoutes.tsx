import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Profile } from '../blocks/Profile/Profile';
import { Workouts } from '../blocks/Workouts/Workouts';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path='/' element={<Workouts />} />
      <Route path='/account' element={<Profile />} />
      <Route path='*' element={<Navigate replace to='/' />} />
    </Routes>
  );
};
