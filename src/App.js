import React, { useRef, useState } from 'react'
import Geogebra from 'react-geogebra'
import { evaluate } from './Components'
import { GeneticAlgorithm } from "./GeneticAlgorithm";
import { ParticleSwarmOptimization } from "./ParticleSwarmOptimization";

function App() {
    const ref = useRef(null);
    const [appletLoaded, setAppletLoaded] = useState(false);
    const [functionEquation, setFunctionEquation] = useState("");
    const [functionEquationLabel, setFunctionEquationLabel] = useState("");
    const [functionValid, setFunctionValid] = useState(false);
    const [dimension, setDimension] = useState(2);
    const [algorithm, setAlgorithm] = useState("");

    const appletOnLoad = () => {
        const app = window.mainDisplay;

        app.setGridVisible(true);

        setAppletLoaded(true)

        // console.log("Applet Loaded");
    }

    const changeFunction = (event) => {
        const app = window.mainDisplay;

        let objectNames = app.getAllObjectNames();

        for(let i = 0; i < objectNames.length; ++i) {
            app.deleteObject(objectNames[i]);
        }

        setFunctionEquation(event.target.value);

        setFunctionEquationLabel(app.evalCommandGetLabels(event.target.value));

        const selected = ref.current;

        if(event.target.value.search("y") === -1) {
            if(dimension !== 2) {
                setDimension(2);
                app.setPerspective('G');
            }
            setFunctionValid(evaluate(event.target.value, [0]) !== "" && !isNaN(evaluate(event.target.value, [0])));
        } else {
            if(dimension === 2) {
                setDimension(3);
                app.setPerspective('T');
            }
            setFunctionValid(evaluate(event.target.value, [0, 0]) !== "" && !isNaN(evaluate(event.target.value, [0, 0])));
        }

        selected.focus();

        console.log("Function updated");
    }

    const changeAlgorithm = (event) => {
        const app = window.mainDisplay;

        setAlgorithm(event.target.value);

        let objectNames = app.getAllObjectNames();

        for(let i = 0; i < objectNames.length; ++i) {
            if(objectNames[i] !== functionEquationLabel) {
                app.deleteObject(objectNames[i]);
            }
        }
    }

    const renderAlgorithm = () => {
        return algorithm === "Genetic Algorithm" ? <GeneticAlgorithm appletLoaded={appletLoaded} functionEquation={functionEquation} functionValid={functionValid} dimension={dimension}/> : <ParticleSwarmOptimization appletLoaded={appletLoaded} functionEquation={functionEquation} functionValid={functionValid} dimension={dimension}/>;
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center">
            <div className="p-10">
                <Geogebra
                    id="mainDisplay"
                    width="500"
                    height="500"
                    showMenuBar={false}
                    showToolBar={false}
                    appletOnLoad={appletOnLoad}
                    errorDialogsActive={false}
                    perspective={'G'}
                />
            </div>

            <div className="ml-10">
                <div className="py-2 w-half flex flex-col">
                    <div className={functionValid ? "text-green-500" : "text-red-500"}>
                        Equation (in terms of x and y):
                    </div>
                    <input className="border rounded px-2" type="text" value={functionEquation}
                            onChange={changeFunction} ref={ref} disabled={!appletLoaded}/>
                </div>

                <div className="pb-2">
                    Note: Right Click for Zoom to Fit
                </div>

                <select value={algorithm} onChange={changeAlgorithm}>
                    <option value="Genetic Algorithm">Genetic Algorithm</option>
                    <option value="Particle Swarm Optimization">Particle Swarm Optimization</option>
                </select>

                {renderAlgorithm()}
            </div>
        </div>
    );
}

export default App;
