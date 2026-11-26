import { type FC, useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import { logout } from '../../services/auth/auth.service';
import { isPlatformAdmin } from '../../services/trainers/trainers.utils';
import { currentUserStore } from '../../stores/currentUser.store';
import { Button } from '../Button/Button';
import { Loading } from '../Loading/Loading';

import './Profile.scss';

const cnProfile = cn('Profile');

type ProfileState = {
  submitting: boolean;
  setSubmitting(value: boolean): void;
};

export const Profile: FC = observer(() => {
  const state = useLocalObservable<ProfileState>(() => ({
    submitting: false,
    setSubmitting(value) {
      this.submitting = value;
    }
  }));

  const handleLogout = useCallback(async () => {
    state.setSubmitting(true);

    try {
      await logout();
    } finally {
      state.setSubmitting(false);
    }
  }, [state]);

  return (
    <div className={cnProfile()}>
      <main className={cnProfile('Main')}>
        <h1 className={cnProfile('Title')}>Профиль</h1>
        <p className={cnProfile('Email')}>{currentUserStore.email}</p>
        <div className={cnProfile('Actions')}>
          <Loading visible={state.submitting} />
          <Button asChild className={cnProfile('PasswordChange')}>
            <Link to='/account/password'>Сменить пароль</Link>
          </Button>
          {isPlatformAdmin(currentUserStore.roles) && (
            <Button asChild className={cnProfile('Admin')}>
              <Link to='/admin'>Администрирование</Link>
            </Button>
          )}
          <Button className={cnProfile('Logout')} disabled={state.submitting} onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </main>
    </div>
  );
});
