import { assertNoop } from '@babel/types';
import React, {useEffect, useState} from 'react'
import Geogebra from 'react-geogebra'

function App() {
  const [appletLoaded, setAppletLoaded] = useState(false);
  const [currentFunction, setCurrentFunction] = useState("");
  const [currentFunctionLabel, setCurrentFunctionLabel] = useState("");
  const [inputValue, setInputValue] = useState(0);
  const [outputValue, setOutputValue] = useState(0);

  function appletOnLoad() {
    const app = window.mainDisplay;

    app.setGridVisible(true);

    setAppletLoaded(true)

    console.log("Applet Loaded");
  }

  function changeFunction(event) {
    const app = window.mainDisplay;

    if(currentFunctionLabel != "") {
      app.deleteObject(currentFunctionLabel)

      console.log("Last object deleted");
    }

    setCurrentFunction(event.target.value);

    setCurrentFunctionLabel(app.evalCommandGetLabels(event.target.value));

    console.log("Function Updated");

    if(inputValue !== "") {
      setOutputValue(app.evalCommandCAS(event.target.value.replace("x", "(" + inputValue + ")")));

      console.log("Function value updated");
    }
  }

  function processInput(event) {
    const app = window.mainDisplay;

    setInputValue(event.target.value);

    console.log("Input value updated")

    if(event.target.value !== "") {
      setOutputValue(app.evalCommandCAS(currentFunction.replace("x", "(" + event.target.value + ")")));
    } else {
      setOutputValue("");
    }

    console.log("Function value updated")
  }

  

  return (
    <div className="min-h-screen p-6 bg-slate-500">
      <Geogebra
        id="mainDisplay"
        width="800"
        height="600"
        showMenuBar
        showToolBar
        showAlgebraInput
        appletOnLoad={appletOnLoad}
        errorDialogsActive={false}
        perspective={'G'}
      />


      <div className="bg-white m-5 p-6 w-half">
        <input type="text" value={currentFunction} onChange={changeFunction}/>
      </div>

      <div className="bg-white m-5 p-6 w-half">
        <input type="text" value={inputValue} onChange={processInput}/>
      </div>

      <div className="bg-white m-5 p-6 w-half">
        Output: {outputValue}
      </div>
    </div>
  );
}

export default App;
