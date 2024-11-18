import { useState } from "react";
import { App } from "./index";

export default function Productions() {
  return (
    <App>
      <FabricUsageCalculator />
    </App>
  );
}

const styles = {
  calculator: {
    maxWidth: "500px",
    margin: "auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "16px",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  result: {
    marginTop: "20px",
    fontSize: "18px",
    fontWeight: "bold",
    textAlign: "center",
  },
};

const FabricUsageCalculator = () => {
  const [fabricPerPiece, setFabricPerPiece] = useState("");
  const [piecesInSet, setPiecesInSet] = useState("");
  const [totalPieces, setTotalPieces] = useState("");
  const [totalFabric, setTotalFabric] = useState("");
  const [result, setResult] = useState("");

  const calculateFabricNeeded = () => {
    const fabricPerUnit = parseFloat(fabricPerPiece) / parseFloat(piecesInSet);
    const totalFabricNeeded = fabricPerUnit * parseFloat(totalPieces);
    const totalFabricNeededYards = totalFabricNeeded / 36;

    if (isNaN(totalFabricNeeded)) {
      setResult("Please enter valid numbers.");
      return;
    }

    setResult(
      `Total Fabric Needed: ${totalFabricNeeded.toFixed(
        2
      )} inches (${totalFabricNeededYards.toFixed(2)} yards)`
    );
  };

  const calculatePiecesPossible = () => {
    const fabricPerUnit = parseFloat(fabricPerPiece) / parseFloat(piecesInSet);
    const totalFabricInInches = parseFloat(totalFabric) * 36;
    const totalPiecesPossible = Math.floor(totalFabricInInches / fabricPerUnit);

    if (isNaN(totalPiecesPossible)) {
      setResult("Please enter valid numbers.");
      return;
    }

    setResult(`Total Pieces Possible: ${totalPiecesPossible}`);
  };

  return (
    <div style={styles.calculator}>
      <h1>Fabric Usage Calculator</h1>
      <div style={styles.inputGroup}>
        <label>Fabric Required (in inches) for a set number of pieces:</label>
        <input
          type="number"
          value={fabricPerPiece}
          onChange={(e) => setFabricPerPiece(e.target.value)}
          placeholder="e.g., 120 inches"
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label>Number of Pieces in the Set:</label>
        <input
          type="number"
          value={piecesInSet}
          onChange={(e) => setPiecesInSet(e.target.value)}
          placeholder="e.g., 6"
          style={styles.input}
        />
      </div>

      <div style={styles.inputGroup}>
        <label>Total Pieces Required:</label>
        <input
          type="number"
          value={totalPieces}
          onChange={(e) => setTotalPieces(e.target.value)}
          placeholder="e.g., 600"
          style={styles.input}
        />
      </div>

      <button onClick={calculateFabricNeeded} style={styles.button}>
        Calculate Fabric Needed
      </button>

      <div style={styles.inputGroup}>
        <label>Total Fabric Available (in yards):</label>
        <input
          type="number"
          value={totalFabric}
          onChange={(e) => setTotalFabric(e.target.value)}
          placeholder="e.g., 600 yards"
          style={styles.input}
        />
      </div>

      <button onClick={calculatePiecesPossible} style={styles.button}>
        Calculate Pieces Possible
      </button>

      <div style={styles.result}>{result}</div>
    </div>
  );
};
