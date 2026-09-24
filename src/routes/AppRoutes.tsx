import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ClientHub } from '../blocks/ClientHub/ClientHub';
import { Clients } from '../blocks/Clients/Clients';
import { Exercises } from '../blocks/Exercises/Exercises';
import { PlannedWorkoutEditor } from '../blocks/PlannedWorkoutEditor/PlannedWorkoutEditor';
import { PlannedWorkoutList } from '../blocks/PlannedWorkoutList/PlannedWorkoutList';
import { Profile } from '../blocks/Profile/Profile';
import { Shell } from '../blocks/Shell/Shell';
import { Workouts } from '../blocks/Workouts/Workouts';
import { WorkoutSession } from '../blocks/WorkoutSession/WorkoutSession';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route path='/' element={<Navigate replace to='/clients' />} />
      <Route path='/workouts' element={<Workouts />} />
      <Route path='/workouts/:clientId/:sessionId' element={<WorkoutSession />} />
      <Route element={<Shell />}>
        <Route path='/clients' element={<Clients />} />
        <Route path='/clients/:id' element={<ClientHub />} />
        <Route path='/clients/:id/plans' element={<PlannedWorkoutList />} />
        <Route path='/clients/:id/plans/new' element={<PlannedWorkoutEditor />} />
        <Route path='/clients/:id/plans/:planId' element={<PlannedWorkoutEditor />} />
        <Route path='/exercises' element={<Exercises />} />
        <Route path='/account' element={<Profile />} />
      </Route>
      <Route path='*' element={<Navigate replace to='/clients' />} />
    </Routes>
  );
};
