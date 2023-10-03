import React, { useEffect, useRef, useState } from "react";
import Geogebra from "react-geogebra";
import { evaluate } from "./Components";
import { GeneticAlgorithm } from "./GeneticAlgorithm";
import { ParticleSwarmOptimization } from "./ParticleSwarmOptimization";

function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return size;
}

function App() {
  const ref = useRef(null);
  const [appletLoaded, setAppletLoaded] = useState(false);
  const [functionEquation, setFunctionEquation] = useState("");
  const [functionEquationLabel, setFunctionEquationLabel] = useState("");
  const [functionValid, setFunctionValid] = useState(false);
  const [dimension, setDimension] = useState(2);
  const [algorithm, setAlgorithm] = useState("Genetic Algorithm");
  const [width, height] = useWindowSize();

  const appletOnLoad = () => {
    const app = window.mainDisplay;

    app.setGridVisible(true);

    setAppletLoaded(true);

    // console.log("Applet Loaded");
  };

  const changeFunction = (newFunctionEquation) => {
    const app = window.mainDisplay;

    let objectNames = app.getAllObjectNames();

    for (let i = 0; i < objectNames.length; ++i) {
      app.deleteObject(objectNames[i]);
    }

    setFunctionEquation(newFunctionEquation);

    setFunctionEquationLabel(app.evalCommandGetLabels(newFunctionEquation));

    const selected = ref.current;

    if (newFunctionEquation.search("y") === -1) {
      if (dimension !== 2) {
        setDimension(2);
        app.setPerspective("G");
      }
      setFunctionValid(
        evaluate(newFunctionEquation, [0]) !== "" &&
          !isNaN(evaluate(newFunctionEquation, [0])),
      );
    } else {
      if (dimension === 2) {
        setDimension(3);
        app.setPerspective("T");
      }
      setFunctionValid(
        evaluate(newFunctionEquation, [0, 0]) !== "" &&
          !isNaN(evaluate(newFunctionEquation, [0, 0])),
      );
    }

    selected.focus();

    console.log("Function updated");
  };

  const changeAlgorithm = (event) => {
    const app = window.mainDisplay;

    setAlgorithm(event.target.value);

    let objectNames = app.getAllObjectNames();

    for (let i = 0; i < objectNames.length; ++i) {
      if (objectNames[i] !== functionEquationLabel) {
        app.deleteObject(objectNames[i]);
      }
    }
  };

  const renderAlgorithm = () => {
    return algorithm === "Genetic Algorithm" ? (
      <GeneticAlgorithm
        appletLoaded={appletLoaded}
        functionEquation={functionEquation}
        functionValid={functionValid}
        dimension={dimension}
      />
    ) : (
      <ParticleSwarmOptimization
        appletLoaded={appletLoaded}
        functionEquation={functionEquation}
        functionValid={functionValid}
        dimension={dimension}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center">
      <div className="w-10/12">
        <Geogebra
          id="mainDisplay"
          key={`${width}-${height}`}
          width={parseInt(width * 0.833)}
          height={parseInt(height * 0.98)}
          showMenuBar={false}
          showToolBar={false}
          appletOnLoad={appletOnLoad}
          errorDialogsActive={false}
          perspective={"G"}
        />
      </div>

      <div className="w-2/12 mx-10">
        <div className="py-2 w-half flex flex-col">
          <div className={functionValid ? "text-green-500" : "text-red-500"}>
            Equation (in terms of x and y):
          </div>
          <input
            className="border rounded px-2"
            type="text"
            value={functionEquation}
            onChange={(event) => changeFunction(event.target.value)}
            ref={ref}
            disabled={!appletLoaded}
          />
        </div>

        <div className="pb-2">Right Click for Zoom to Fit</div>

        <select className="w-full" value={algorithm} onChange={changeAlgorithm}>
          <option value="Genetic Algorithm">Genetic Algorithm</option>
          <option value="Particle Swarm Optimization">
            Particle Swarm Optimization
          </option>
        </select>

        {renderAlgorithm()}
      </div>
    </div>
  );
}

export default App;
