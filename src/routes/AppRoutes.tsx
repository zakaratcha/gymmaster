import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Clients } from '../blocks/Clients/Clients';
import { Exercises } from '../blocks/Exercises/Exercises';
import { Profile } from '../blocks/Profile/Profile';
import { Shell } from '../blocks/Shell/Shell';
import { Workouts } from '../blocks/Workouts/Workouts';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path='/' element={<Navigate replace to='/clients' />} />
      <Route path='/workouts' element={<Workouts />} />
      <Route element={<Shell />}>
        <Route path='/clients' element={<Clients />} />
        <Route path='/exercises' element={<Exercises />} />
        <Route path='/account' element={<Profile />} />
      </Route>
      <Route path='*' element={<Navigate replace to='/clients' />} />
    </Routes>
  );
};
