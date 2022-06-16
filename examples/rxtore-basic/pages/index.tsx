import { createStore, shallow } from "rxtore";

const { useStore } = createStore({ count: 1, name: "git" });

function Counter() {
  const { store, setStore } = useStore(({ count }) => ({ count }), shallow);
  console.log("render counter");

  return (
    <div>
      <h1>Count: {store.count}</h1>
      <button
        onClick={() =>
          setStore(({ count, ...rest }) => {
            return { ...rest, count: count + 1 };
          })
        }
      >
        +1
      </button>
      <button
        onClick={() =>
          setStore(({ ...rest }) => ({
            ...rest,
            name: `git+${Math.floor(Math.random() * 10)}`,
          }))
        }
      >
        git+
      </button>
    </div>
  );
}

function Name() {
  const { store, setStore } = useStore(({ name }) => ({ name }), shallow);
  console.log("render name");

  return (
    <div>
      <h1>Name: {store.name}</h1>
      <button
        onClick={() =>
          setStore((st) => ({
            ...st,
            name: `git+${Math.floor(Math.random() * 10)}`,
          }))
        }
      >
        git+
      </button>
    </div>
  );
}

function Home() {
  return (
    <div>
      <Counter />
      <Name />
    </div>
  );
}

export default Home;
