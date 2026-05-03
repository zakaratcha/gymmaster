import { useEffect, useState } from "react";

import { HelloWorld } from "./blocks/HelloWorld/HelloWorld";
import { fetchHello } from "./services/helloApi";

export function App() {
  const [fromApi, setFromApi] = useState<string | undefined>(undefined);

  useEffect(() => {
    const ac = new AbortController();

    fetchHello({ signal: ac.signal })
      .then(({ message }) => {
        setFromApi(message);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error(err);
        setFromApi("(не удалось загрузить)");
      });

    return () => {
      ac.abort();
    };
  }, []);

  return <HelloWorld apiLine={fromApi} />;
}
