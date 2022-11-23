import { createHook } from "rxtore";
import { BehaviorSubject } from "rxjs";

const store$ = new BehaviorSubject({
  text: "create-hook",
  title: "rxtore-create-hook",
});

const { useStore, useStoreValue } = createHook(
  store$,
  () => store$.getValue(),
  (value) => store$.next(value),
);

function Title() {
  const title = useStoreValue((st) => st.title);
  return <h1>{title}</h1>;
}

function Input() {
  const { store: text, setStore } = useStore((st) => st.text);
  return (
    <input
      value={text}
      onChange={(evt) => {
        setStore(() => ({ text: evt.target.value }));
      }}
    />
  );
}

export default function App() {
  return (
    <div>
      <Title />
      <br />
      <Input />
    </div>
  );
}
