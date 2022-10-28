import React, { useState, useEffect, useCallback } from 'react'
import { evaluate, randomNumberInRange, addPoints, removePoints, gaussianRandom } from './Components'

export function ParticleSwarmOptimization({appletLoaded, functionEquation, functionValid, dimension}) {
    const [iterations, setIterations] = useState(0);
    const [lowerBound, setLowerBound] = useState(0);
    const [lowerBoundValid, setLowerBoundValid] = useState(true);
    const [upperBound, setUpperBound] = useState(0);
    const [upperBoundValid, setUpperBoundValid] = useState(true);
    const [boundsValid, setBoundsValid] = useState(true);
    const [populationSize, setPopulationSize] = useState(100);
    const [populationSizeValid, setPopulationSizeValid] = useState(true);
    const [w, setW] = useState(0.65);
    const [wValid, setWValid] = useState(true);
    const [c1, setC1] = useState(0.1);
    const [c1Valid, setC1Valid] = useState(true);
    const [c2, setC2] = useState(0.1);
    const [c2Valid, setC2Valid] = useState(true);
    const [parametersValid, setParametersValid] = useState(false);
    const [positions, setPositions] = useState([]);
    const [velocities, setVelocities] = useState([]);
    const [personalBest, setPersonalBest] = useState([]);
    const [personalBestFitness, setPersonalBestFitness] = useState([]);
    const [globalBest, setGlobalBest] = useState([]);
    const [globalBestFitness, setGlobalBestFitness] = useState([]);
    const [populationLabels, setPopulationLabels] = useState([]);

    const reset = useCallback(() => {
        if(iterations) {
            removePoints(populationLabels);
            setPositions([]);
            setVelocities([]);
            setPersonalBest([]);
            setPersonalBestFitness([]);
            setGlobalBest([]);
            setGlobalBestFitness([]);
            setPopulationLabels([]);
            setIterations(0);
        }
    }, [iterations, populationLabels]);

    useEffect(() => {
        setPositions([]);
        setVelocities([]);
        setPersonalBest([]);
        setPersonalBestFitness([]);
        setGlobalBest([]);
        setGlobalBestFitness([]);
        setPopulationLabels([]);
        setIterations(0);
    }, [functionEquation])

    useEffect(() => {
        setParametersValid(functionValid && lowerBoundValid && upperBoundValid && populationSizeValid && wValid && c1Valid && c2Valid && boundsValid);
    }, [functionValid, lowerBoundValid, upperBoundValid, populationSizeValid, wValid, c1Valid, c2Valid, boundsValid, setParametersValid]);

    const processLowerBound = (event) => {
        if(/^[-]?\d+(\.)?\d+$/.test(event.target.value) || /^[-]?\d+$/.test(event.target.value)) {
            setLowerBound(parseFloat(event.target.value));
            setLowerBoundValid(true);
            if(upperBoundValid) {
                setBoundsValid(parseFloat(event.target.value) <= upperBound)
            }
        } else {
            setLowerBound(event.target.value);
            setLowerBoundValid(false);
            setBoundsValid(true);
        }
        reset(iterations, populationLabels);
    }
    
    const processUpperBound = (event) => {
        if(/^[-]?\d+(\.)?\d+$/.test(event.target.value) || /^[-]?\d+$/.test(event.target.value)) {
            setUpperBound(parseFloat(event.target.value));
            setUpperBoundValid(true);
            if(lowerBoundValid) {
                setBoundsValid(lowerBound <= parseFloat(event.target.value))
            }
        } else {
            setUpperBound(event.target.value);
            setUpperBoundValid(false);
            setBoundsValid(true);
        }
        reset(iterations, populationLabels);
    }

    const processPopulationSize = (event) => {
        if(/^\d+$/.test(event.target.value)) {
            setPopulationSize(parseInt(event.target.value));
            setPopulationSizeValid(true);
        } else {
            setPopulationSize(event.target.value);
            setPopulationSizeValid(false);
        }
        reset(iterations, populationLabels);
    }

    const processW = (event) => {
        if(/^[0]+(\.)?\d+$/.test(event.target.value) || /^[1]{1}(\.){1}[0]+$/.test(event.target.value) || /^[1]{1}$/.test(event.target.value)) {
            setW(parseFloat(event.target.value));
            setWValid(true);
        } else {
            setW(event.target.value);
            setWValid(false);
        }
        reset(iterations, populationLabels);
    }

    const processC1 = (event) => {
        if(/^[0]+(\.)?\d+$/.test(event.target.value) || /^[1]{1}(\.){1}[0]+$/.test(event.target.value) || /^[1]{1}$/.test(event.target.value)) {
            setC1(parseFloat(event.target.value));
            setC1Valid(true);
        } else {
            setC1(event.target.value);
            setC1Valid(false);
        }
        reset(iterations, populationLabels);
    }

    const processC2 = (event) => {
        if(/^[0]+(\.)?\d+$/.test(event.target.value) || /^[1]{1}(\.){1}[0]+$/.test(event.target.value) || /^[1]{1}$/.test(event.target.value)) {
            setC2(parseFloat(event.target.value));
            setC2Valid(true);
        } else {
            setC2(event.target.value);
            setC2Valid(false);
        }
        reset(iterations, populationLabels);
    }

    const initializePopulation = (populationSize) => {
        let newPositions = new Array(populationSize);
        let newVelocities = new Array(populationSize);
    
        for (let i = 0; i < populationSize; ++i) {
            if (dimension === 2) {
                newPositions[i] = [randomNumberInRange(lowerBound, upperBound)];
                newVelocities[i] = [gaussianRandom(0, (upperBound - lowerBound) / 100)];
            } else {
                newPositions[i] = [randomNumberInRange(lowerBound, upperBound), randomNumberInRange(lowerBound, upperBound)];
                newVelocities[i] = [gaussianRandom(0, (upperBound - lowerBound) / 100), gaussianRandom(0, (upperBound - lowerBound) / 100)];
            }
        }
    
        return [newPositions, newVelocities];
    }
    
    // -cos(x)*cos(y)*e^(-((x)-pi)^2-((y)-pi)^2) [-100, 100]
    // -(1+cos(12*sqrt(x^2+y^2)))/(0.5*(x^2+y^2)+2) [-5.12, 5.12]
    const evolve = () => {
        if (iterations === 0) {
            let newPopulation = initializePopulation(populationSize);

            setPositions(newPopulation[0]);
            setVelocities(newPopulation[1]);

            setPersonalBest(newPopulation[0]);

            let newPersonalBestFitness = new Array(populationSize);
            
            let newGlobalBest = newPopulation[0][0];
            let newGlobalBestFitness = evaluate(functionEquation, newPopulation[0][0]);

            for (let i = 0; i < populationSize; ++i) {
                newPersonalBestFitness[i] = evaluate(functionEquation, newPopulation[0][i]);

                if(newPersonalBestFitness[i] < newGlobalBestFitness) {
                    newGlobalBest = newPopulation[0][i];
                    newGlobalBestFitness = newPersonalBestFitness[i];
                }
            }

            setPersonalBestFitness(newPersonalBestFitness);

            setGlobalBest(newGlobalBest);
            setGlobalBestFitness(newGlobalBestFitness);

            setPopulationLabels(addPoints(functionEquation, newPopulation[0]));

            return;
        }
    
        removePoints(populationLabels);

        let newPositions = positions;
        let newVelocities = velocities;

        let newPersonalBest = personalBest;
        let newPersonalBestFitness = personalBestFitness;

        let newGlobalBest = globalBest;
        let newGlobalBestFitness = globalBestFitness;

        for (let i = 0; i < populationSize; ++i) {
            for(let j = 0; j < dimension - 1; ++j) {
                newVelocities[i][j] = w * velocities[i][j] + c1 * randomNumberInRange(0, 2) * (personalBest[i][j] - positions[i][j]) + c2 * randomNumberInRange(0, 2) * (globalBest[j] - positions[i][j]);
                newPositions[i][j] += newVelocities[i][j];
            }

            let newFitness = evaluate(functionEquation, newPositions[i]);

            if(newFitness < personalBestFitness[i]) {
                newPersonalBest[i] = newPositions[i];
                newPersonalBestFitness[i] = newFitness;
            }

            if(newFitness < globalBestFitness) {
                newGlobalBest = newPositions[i];
                newGlobalBestFitness = newFitness;
            }
        }

        setPositions(newPositions);
        setVelocities(newVelocities);

        setPersonalBest(newPersonalBest);
        setPersonalBestFitness(newPersonalBestFitness);

        setGlobalBest(newGlobalBest);
        setGlobalBestFitness(newGlobalBestFitness);

        setPopulationLabels(addPoints(functionEquation, newPositions));
    };
    
    const processEvolve = () => {
        evolve();
        setIterations(iterations + 1);
    }

    const processReset = () => {
        reset(iterations, populationLabels);
    }

    return (
        <div className="flex flex-col">
            <div className="py-2 flex flex-col">
                <div className={lowerBoundValid && boundsValid ? "text-green-500" : " text-red-500"}>
                    Lower Bound:
                </div>
                <input className="border rounded px-2" type="text" value={lowerBound} onChange={processLowerBound}
                    disabled={!appletLoaded}/>
            </div>

            <div className="py-2 flex flex-col">
                <div className={upperBoundValid && boundsValid ? "text-green-500" : " text-red-500"}>
                    Upper Bound:
                </div>
                <input className="border rounded px-2" type="text" value={upperBound} onChange={processUpperBound}
                    disabled={!appletLoaded}/>
            </div>

            <div className="py-2 flex flex-col">
                <div className={populationSizeValid ? "text-green-500" : " text-red-500"}>
                    Population Size:
                </div>
                <input className="border rounded px-2" type="text" value={populationSize} onChange={processPopulationSize}
                    disabled={!appletLoaded}/>
            </div>

            <div className="py-2 flex flex-col">
                <div className={wValid ? "text-green-500" : " text-red-500"}>
                    w Coefficient:
                </div>
                <input className="border rounded px-2" type="text" value={w} onChange={processW}
                    disabled={!appletLoaded}/>
            </div>

            <div className="py-2 flex flex-col">
                <div className={c1Valid ? "text-green-500" : " text-red-500"}>
                    c_1 Coefficient:
                </div>
                <input className="border rounded px-2" type="text" value={c1} onChange={processC1}
                    disabled={!appletLoaded}/>
            </div>
            
            <div className="py-2 flex flex-col">
                <div className={c2Valid ? "text-green-500" : " text-red-500"}>
                    c_2 Coefficient:
                </div>
                <input className="border rounded px-2" type="text" value={c2} onChange={processC2}
                    disabled={!appletLoaded}/>
            </div>

            <div className={"pt-2 " + (parametersValid ? "text-green-500" : "text-red-500")}>
                Parameters {!parametersValid && "in"}valid!
            </div>

            <div className="py-4">
                <button className="border rounded px-2" onClick={processEvolve} disabled={!parametersValid}>
                    Generate/Evolve Particles
                </button>
            </div>

            <div className="pb-4">
                <button className="border rounded px-2" onClick={processReset} disabled={!appletLoaded}>
                    Reset Particles
                </button>
            </div>
        </div>
    )
}