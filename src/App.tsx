import { useEffect, useState } from 'react';
import type { FC } from 'react';

import { HelloWorld } from './blocks/HelloWorld/HelloWorld';
import { fetchHello } from './services/helloApi';

export const App: FC = () => {
  const [fromApi, setFromApi] = useState<string | undefined>();

  useEffect(() => {
    const ac = new AbortController();

    fetchHello({ signal: ac.signal })
      .then(({ message }) => {
        setFromApi(message);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error(error);
        setFromApi('(не удалось загрузить)');
      });

    return () => {
      ac.abort();
    };
  }, []);

  return <HelloWorld apiLine={fromApi} />;
};
