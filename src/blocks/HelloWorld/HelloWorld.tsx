import { cn } from "@bem-react/classname";
import "./HelloWorld.css";

const classname = cn("HelloWorld");

export type HelloWorldProps = {
  readonly apiLine?: string;
};

export function HelloWorld({ apiLine }: HelloWorldProps) {
  return (
    <div className={classname()}>
      <h1 className={classname("Title")}>Hello world!</h1>
      {apiLine !== undefined ? (
        <p className={classname("ApiLine")}>{apiLine}</p>
      ) : null}
    </div>
  );
}
