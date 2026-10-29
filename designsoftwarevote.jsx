import { useState } from "react";

const MAX_VOTES = 11;

const initialVotes = {
  solidworks: 0,
  autodesk: 0,
  noPreference: 0,
};

export default function DesignSoftwareVote() {
  const [votes, setVotes] = useState(initialVotes);

  const vote = (option) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [option]: Math.min(prevVotes[option] + 1, MAX_VOTES),
    }));
  };

  const resetVotes = () => {
    setVotes(initialVotes);
  };

  const getWidth = (count) => `${(count / MAX_VOTES) * 100}%`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f4f4",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px",
          fontSize: "3rem",
        }}
      >
        Engineering Design Software Vote
      </h1>

      <div style={{ marginBottom: "30px" }}>
        <h2>SOLIDWORKS ({votes.solidworks}/{MAX_VOTES})</h2>
        <div
          style={{
            width: "100%",
            height: "50px",
            background: "#ddd",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: getWidth(votes.solidworks),
              height: "100%",
              background: "linear-gradient(90deg, #00C853, #FFFFFF)",
              transition: "0.4s ease",
            }}
          />
        </div>
        <button
          onClick={() => vote("solidworks")}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#00C853",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Vote SOLIDWORKS
        </button>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>AutoDesk ({votes.autodesk}/{MAX_VOTES})</h2>
        <div
          style={{
            width: "100%",
            height: "50px",
            background: "#ddd",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: getWidth(votes.autodesk),
              height: "100%",
              background: "linear-gradient(90deg, #FF6F00, #000000)",
              transition: "0.4s ease",
            }}
          />
        </div>
        <button
          onClick={() => vote("autodesk")}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#FF6F00",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Vote AutoDesk
        </button>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h2>No Preference ({votes.noPreference}/{MAX_VOTES})</h2>
        <div
          style={{
            width: "100%",
            height: "50px",
            background: "#ddd",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: getWidth(votes.noPreference),
              height: "100%",
              background:
                "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
              transition: "0.4s ease",
            }}
          />
        </div>
        <button
          onClick={() => vote("noPreference")}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background:
              "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Vote No Preference
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button
          onClick={resetVotes}
          style={{
            padding: "12px 30px",
            fontSize: "16px",
            background: "#444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Reset Votes
        </button>
      </div>
    </div>
  );
}
