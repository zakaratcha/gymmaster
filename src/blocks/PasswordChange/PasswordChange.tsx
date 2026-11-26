import { type ChangeEvent, type FC, type SyntheticEvent, useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { Link, useNavigate } from 'react-router-dom';

import { changeOwnPassword } from '../../services/auth/auth.service';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Loading } from '../Loading/Loading';

import './PasswordChange.scss';

const cnPasswordChange = cn('PasswordChange');

type PasswordChangeState = {
  currentPassword: string;
  newPassword: string;
  repeatPassword: string;
  submitting: boolean;
  error?: string;
  setCurrentPassword(value: string): void;
  setNewPassword(value: string): void;
  setRepeatPassword(value: string): void;
  setSubmitting(value: boolean): void;
  setError(value: string | undefined): void;
};

export const PasswordChange: FC = observer(() => {
  const navigate = useNavigate();
  const state = useLocalObservable<PasswordChangeState>(() => ({
    currentPassword: '',
    newPassword: '',
    repeatPassword: '',
    submitting: false,
    setCurrentPassword(value) {
      this.currentPassword = value;
    },
    setNewPassword(value) {
      this.newPassword = value;
    },
    setRepeatPassword(value) {
      this.repeatPassword = value;
    },
    setSubmitting(value) {
      this.submitting = value;
    },
    setError(value) {
      this.error = value;
    }
  }));

  const handleCurrentPasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setCurrentPassword(event.target.value);
    },
    [state]
  );

  const handleNewPasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setNewPassword(event.target.value);
    },
    [state]
  );

  const handleRepeatPasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setRepeatPassword(event.target.value);
    },
    [state]
  );

  const handleSubmit = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (state.submitting) {
        return;
      }

      state.setSubmitting(true);
      state.setError(undefined);

      void changeOwnPassword({
        currentPassword: state.currentPassword,
        newPassword: state.newPassword,
        repeatPassword: state.repeatPassword
      }).then(result => {
        if (result.ok) {
          void navigate('/account');
          return;
        }

        state.setError(result.error);
        state.setSubmitting(false);
      });
    },
    [navigate, state]
  );

  return (
    <div className={cnPasswordChange()}>
      <main className={cnPasswordChange('Main')}>
        <header className={cnPasswordChange('Header')}>
          <Link aria-label='Назад в Профиль' className={cnPasswordChange('Back')} to='/account'>
            ←
          </Link>
          <h1 className={cnPasswordChange('Title')}>Смена пароля</h1>
        </header>
        <form className={cnPasswordChange('Form')} noValidate onSubmit={handleSubmit}>
          <Loading visible={state.submitting} />
          <Input
            className={cnPasswordChange('CurrentPassword')}
            disabled={state.submitting}
            id='password-change-current'
            label='Текущий пароль'
            name='currentPassword'
            onChange={handleCurrentPasswordChange}
            type='password'
            value={state.currentPassword}
          />
          <Input
            className={cnPasswordChange('NewPassword')}
            disabled={state.submitting}
            id='password-change-new'
            label='Новый пароль'
            name='newPassword'
            onChange={handleNewPasswordChange}
            type='password'
            value={state.newPassword}
          />
          <Input
            className={cnPasswordChange('RepeatPassword')}
            disabled={state.submitting}
            id='password-change-repeat'
            label='Повтор нового'
            name='repeatPassword'
            onChange={handleRepeatPasswordChange}
            type='password'
            value={state.repeatPassword}
          />
          {state.error !== undefined && (
            <p className={cnPasswordChange('Error')} role='alert'>
              {state.error}
            </p>
          )}
          <Button className={cnPasswordChange('Submit')} color='primary' disabled={state.submitting} type='submit'>
            Сохранить
          </Button>
        </form>
      </main>
    </div>
  );
});
