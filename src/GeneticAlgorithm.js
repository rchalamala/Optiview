import React, { useState, useEffect, useCallback } from "react";
import {
  evaluate,
  randomNumberInRange,
  gaussianRandom,
  addPoints,
  removePoints,
} from "./Components";

export function GeneticAlgorithm({
  appletLoaded,
  functionEquation,
  functionValid,
  dimension,
}) {
  const [iterations, setIterations] = useState(0);
  const [lowerBound, setLowerBound] = useState(0);
  const [lowerBoundValid, setLowerBoundValid] = useState(true);
  const [upperBound, setUpperBound] = useState(0);
  const [upperBoundValid, setUpperBoundValid] = useState(true);
  const [boundsValid, setBoundsValid] = useState(true);
  const [populationSize, setPopulationSize] = useState(100);
  const [populationSizeValid, setPopulationSizeValid] = useState(true);
  const [eliteCount, setEliteCount] = useState(5);
  const [eliteCountValid, setEliteCountValid] = useState(true);
  const [crossoverProbability, setCrossoverProbability] = useState(0.8);
  const [crossoverProbabilityValid, setCrossoverProbabilityValid] =
    useState(true);
  const [algorithmParametersValid, setAlgorithmParametersValid] =
    useState(true);
  const [parametersValid, setParametersValid] = useState(false);
  const [population, setPopulation] = useState([]);
  const [populationLabels, setPopulationLabels] = useState([]);

  const reset = useCallback(() => {
    if (iterations) {
      removePoints(populationLabels);
      setPopulation([]);
      setPopulationLabels([]);
      setIterations(0);
    }
  }, [iterations, populationLabels]);

  useEffect(() => {
    setPopulation([]);
    setPopulationLabels([]);
    setIterations(0);
  }, [functionEquation]);

  useEffect(() => {
    setParametersValid(
      functionValid &&
        lowerBoundValid &&
        upperBoundValid &&
        populationSizeValid &&
        eliteCountValid &&
        crossoverProbabilityValid &&
        boundsValid &&
        algorithmParametersValid,
    );
  }, [
    functionValid,
    lowerBoundValid,
    upperBoundValid,
    populationSizeValid,
    eliteCountValid,
    crossoverProbabilityValid,
    boundsValid,
    algorithmParametersValid,
    setParametersValid,
  ]);

  const processLowerBound = (event) => {
    if (
      /^[-]?\d+(\.)?\d+$/.test(event.target.value) ||
      /^[-]?\d+$/.test(event.target.value)
    ) {
      setLowerBound(parseFloat(event.target.value));
      setLowerBoundValid(true);
      if (upperBoundValid) {
        setBoundsValid(parseFloat(event.target.value) <= upperBound);
      }
    } else {
      setLowerBound(event.target.value);
      setLowerBoundValid(false);
      setBoundsValid(true);
    }
    reset();
  };

  const processUpperBound = (event) => {
    if (
      /^[-]?\d+(\.)?\d+$/.test(event.target.value) ||
      /^[-]?\d+$/.test(event.target.value)
    ) {
      setUpperBound(parseFloat(event.target.value));
      setUpperBoundValid(true);
      if (lowerBoundValid) {
        setBoundsValid(lowerBound <= parseFloat(event.target.value));
      }
    } else {
      setUpperBound(event.target.value);
      setUpperBoundValid(false);
      setBoundsValid(true);
    }
    reset();
  };

  const processPopulationSize = (event) => {
    if (/^\d+$/.test(event.target.value)) {
      setPopulationSize(parseInt(event.target.value));
      setPopulationSizeValid(true);
      if (eliteCountValid && crossoverProbabilityValid) {
        setAlgorithmParametersValid(
          eliteCount +
            Math.floor(crossoverProbability * parseInt(event.target.value)) <=
            parseInt(event.target.value),
        );
      }
    } else {
      setPopulationSize(event.target.value);
      setPopulationSizeValid(false);
      setAlgorithmParametersValid(true);
    }
    reset();
  };

  const processEliteCount = (event) => {
    if (/^\d+$/.test(event.target.value)) {
      setEliteCount(parseInt(event.target.value));
      setEliteCountValid(true);
      if (populationSizeValid && crossoverProbabilityValid) {
        setAlgorithmParametersValid(
          parseInt(event.target.value) +
            Math.floor(crossoverProbability * populationSize) <=
            populationSize,
        );
      }
    } else {
      setEliteCount(event.target.value);
      setEliteCountValid(false);
      setAlgorithmParametersValid(true);
    }
    reset();
  };

  const processCrossoverProbability = (event) => {
    if (
      /^[0]+(\.)?\d+$/.test(event.target.value) ||
      /^[1]{1}(\.){1}[0]+$/.test(event.target.value) ||
      /^[1]{1}$/.test(event.target.value)
    ) {
      setCrossoverProbability(parseFloat(event.target.value));
      setCrossoverProbabilityValid(true);
      if (populationSizeValid && eliteCountValid) {
        setAlgorithmParametersValid(
          eliteCount +
            Math.floor(parseFloat(event.target.value) * populationSize) <=
            populationSize,
        );
      }
    } else {
      setCrossoverProbability(event.target.value);
      setCrossoverProbabilityValid(false);
      setAlgorithmParametersValid(true);
    }
    reset();
  };

  const initializePopulation = (populationSize) => {
    let newPopulation = new Array(populationSize);

    for (let i = 0; i < populationSize; ++i) {
      if (dimension === 2) {
        newPopulation[i] = [randomNumberInRange(lowerBound, upperBound)];
      } else {
        newPopulation[i] = [
          randomNumberInRange(lowerBound, upperBound),
          randomNumberInRange(lowerBound, upperBound),
        ];
      }
    }

    return newPopulation;
  };

  const crossover = (parent1, parent2) => {
    // https://apmonitor.com/me575/uploads/Main/chap6_genetic_evolutionary_optimization_v2.pdf
    let child1 = [];
    let child2 = [];

    let a = 0.15;

    for (let i = 0; i < dimension - 1; ++i) {
      let d = Math.abs(parent1[i] - parent2[i]);

      let bounds = [
        Math.min(parent1[i], parent2[i]) - a * d,
        Math.max(parent1[i], parent2[i]) + a * d,
      ];

      child1.push(randomNumberInRange(bounds[0], bounds[1]));
      child2.push(randomNumberInRange(bounds[0], bounds[1]));
    }

    return [child1, child2];
  };

  // Find better mutation function
  const mutate = (parent) => {
    let child = [];

    let gene = randomNumberInRange(0, dimension - 1);

    for (let i = 0; i < dimension - 1; ++i) {
      child.push(parent[i]);
      if (i === gene) {
        child[i] += gaussianRandom(0, upperBound - lowerBound);
      }
    }

    return child;
  };

  // -cos(x)*cos(y)*e^(-((x)-pi)^2-((y)-pi)^2) [-100, 100]
  // -(1+cos(12*sqrt(x^2+y^2)))/(0.5*(x^2+y^2)+2) [-5.12, 5.12]
  const evolve = () => {
    if (iterations === 0) {
      let newPopulation = initializePopulation(populationSize);

      setPopulation(newPopulation);
      setPopulationLabels(addPoints(functionEquation, newPopulation));

      return;
    }

    removePoints(populationLabels);

    let currentPopulation = population;
    let currentPopulationFitness = new Array(populationSize);
    let indices = new Array(populationSize);

    for (let i = 0; i < populationSize; ++i) {
      currentPopulationFitness[i] = evaluate(
        functionEquation,
        currentPopulation[i],
      );
      indices[i] = i;
    }

    // Rank Scaling

    indices.sort(function (lhs, rhs) {
      return currentPopulationFitness[lhs] < currentPopulationFitness[rhs]
        ? -1
        : currentPopulationFitness[lhs] > currentPopulationFitness[rhs]
        ? 1
        : 0;
    });

    let newPopulation = new Array(populationSize);

    for (let i = 0; i < populationSize; ++i) {
      newPopulation[i] = currentPopulation[indices[i]];
      currentPopulationFitness[i] = 1 / Math.sqrt(i + 1);
    }

    let crossoverCount = Math.floor(crossoverProbability * populationSize);

    if (crossoverCount % 2) {
      crossoverCount -= 1;
    }

    let sum = 0;

    for (let i = 0; i < populationSize; ++i) {
      currentPopulation[i] = newPopulation[i];
      if (i >= eliteCount && i < eliteCount + crossoverCount) {
        sum += currentPopulationFitness[eliteCount + i];
      }
    }

    let step = sum / crossoverCount;

    let randomOffset = Math.random() * step;

    let currentSum = 0;
    let stepIndex = 0;

    for (let i = 0; i < crossoverCount; i += 2) {
      while (currentSum < i * step + randomOffset) {
        currentSum += currentPopulationFitness[eliteCount + stepIndex];
        stepIndex += 1;
      }

      let offspring = [currentPopulation[eliteCount + stepIndex], []];

      while (currentSum < (i + 1) * step + randomOffset) {
        currentSum += currentPopulationFitness[eliteCount + stepIndex];
        stepIndex += 1;
      }

      offspring[1] = currentPopulation[eliteCount + stepIndex];

      offspring = crossover(offspring[0], offspring[1]);

      newPopulation[eliteCount + i] = offspring[0];
      newPopulation[eliteCount + i + 1] = offspring[1];
    }

    for (let i = 0; i < populationSize - eliteCount - crossoverCount; ++i) {
      newPopulation[eliteCount + crossoverCount + i] = mutate(
        currentPopulation[eliteCount + crossoverCount + i],
      );
    }

    setPopulation(newPopulation);
    setPopulationLabels(addPoints(functionEquation, newPopulation));
  };

  const processEvolve = () => {
    evolve();
    setIterations(iterations + 1);
  };

  const processReset = () => {
    reset();
  };

  return (
    <div className="flex flex-col">
      <div className="py-2 flex flex-col">
        <div
          className={
            lowerBoundValid && boundsValid ? "text-green-500" : " text-red-500"
          }
        >
          Lower Bound:
        </div>
        <input
          className="border rounded px-2"
          type="text"
          value={lowerBound}
          onChange={processLowerBound}
          disabled={!appletLoaded}
        />
      </div>

      <div className="py-2 flex flex-col">
        <div
          className={
            upperBoundValid && boundsValid ? "text-green-500" : " text-red-500"
          }
        >
          Upper Bound:
        </div>
        <input
          className="border rounded px-2"
          type="text"
          value={upperBound}
          onChange={processUpperBound}
          disabled={!appletLoaded}
        />
      </div>

      <div className="py-2 flex flex-col">
        <div
          className={
            populationSizeValid && algorithmParametersValid
              ? "text-green-500"
              : " text-red-500"
          }
        >
          Population Size:
        </div>
        <input
          className="border rounded px-2"
          type="text"
          value={populationSize}
          onChange={processPopulationSize}
          disabled={!appletLoaded}
        />
      </div>

      <div className="py-2 flex flex-col">
        <div
          className={
            eliteCountValid && algorithmParametersValid
              ? "text-green-500"
              : " text-red-500"
          }
        >
          Elite Count:
        </div>
        <input
          className="border rounded px-2"
          type="text"
          value={eliteCount}
          onChange={processEliteCount}
          disabled={!appletLoaded}
        />
      </div>

      <div className="py-2 flex flex-col">
        <div
          className={
            crossoverProbabilityValid && algorithmParametersValid
              ? "text-green-500"
              : " text-red-500"
          }
        >
          Crossover Probability:
        </div>
        <input
          className="border rounded px-2"
          type="text"
          value={crossoverProbability}
          onChange={processCrossoverProbability}
          disabled={!appletLoaded}
        />
      </div>

      <div
        className={
          "pt-2 " + (parametersValid ? "text-green-500" : "text-red-500")
        }
      >
        Parameters {!parametersValid && "in"}valid!
      </div>

      <div className="py-4">
        <button
          className="border rounded px-2 w-full"
          onClick={processEvolve}
          disabled={!parametersValid}
        >
          Generate/Evolve Genetic Algorithm
        </button>
      </div>

      <div className="pb-4">
        <button
          className="border rounded px-2 w-full"
          onClick={processReset}
          disabled={!appletLoaded}
        >
          Reset Genetic Algorithm
        </button>
      </div>
    </div>
  );
}
