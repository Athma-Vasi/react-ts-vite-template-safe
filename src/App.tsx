import { Err, None, Ok, Some } from "ts-results";

function App() {
  console.log("option some", Some("test"));
  console.log("option none", None);

  console.log("result ok", new Ok("ok"));
  console.log("result err", new Err("error"));
  return <div>Hello, World!</div>;
}

export default App;
