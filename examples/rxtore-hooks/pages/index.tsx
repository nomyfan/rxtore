import { createStore } from "rxtore";

const { useStoreValue, useSetStore } = createStore({
  count: 1,
  name: "Your name",
});

function CountReader() {
  const count = useStoreValue((st) => st.count);
  console.log("Render CountReader");

  return (
    <div>
      <b>CountReader</b>
      <div>Count: {count}</div>
    </div>
  );
}

function NameReader() {
  const name = useStoreValue((st) => st.name);
  console.log("Render NameReader");

  return (
    <div>
      <b>NameReader</b>
      <div>Name: {name}</div>
    </div>
  );
}

function CountWriter() {
  const setStore = useSetStore();
  const increase = () => setStore((st) => ({ count: st.count + 1 }));
  console.log("Render CountWriter");

  return (
    <div>
      <b>CountWriter</b>
      <br />
      <button onClick={increase}>+1</button>
    </div>
  );
}

function NameWriter() {
  const defaultValue = useStoreValue(
    (st) => st.name,
    () => true,
  );
  const setStore = useSetStore();
  console.log("Render NameWriter");

  return (
    <div>
      <b>NameWriter</b>
      <br />
      <input
        defaultValue={defaultValue}
        onChange={(evt) => {
          setStore(() => ({ name: evt.target.value }));
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <div>
      <CountReader />
      <NameReader />
      <hr />
      <CountWriter />
      <NameWriter />
    </div>
  );
}
