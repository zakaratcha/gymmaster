import { useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import type { FC } from 'react';

import { logout } from '../../services/auth/auth.service';
import { currentUserStore } from '../../stores/currentUser.store';
import { Button } from '../Button/Button';
import { Loading } from '../Loading/Loading';

import './Profile.css';

const cnProfile = cn('Profile');

type ProfileState = {
  submitting: boolean;
  setSubmitting(value: boolean): void;
};

export const Profile: FC = observer(() => {
  const { submitting, setSubmitting } = useLocalObservable<ProfileState>(() => ({
    submitting: false,
    setSubmitting(value) {
      this.submitting = value;
    }
  }));

  const handleLogout = useCallback(async () => {
    setSubmitting(true);

    try {
      await logout();
    } finally {
      setSubmitting(false);
    }
  }, [setSubmitting]);

  return (
    <div className={cnProfile()}>
      <main className={cnProfile('Main')}>
        <h1 className={cnProfile('Title')}>Профиль</h1>
        <p className={cnProfile('Email')}>{currentUserStore.email}</p>
        <div className={cnProfile('Actions')}>
          <Loading visible={submitting} />
          <Button className={cnProfile('Logout')} disabled={submitting} onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </main>
    </div>
  );
});
