import React, { useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";
import {
  canisterId as backendCanisterId,
  createActor as createBackendActor,
} from "../../declarations/beginner_challenge_backend";
import logo from "/logo.png"; // Adjust path if needed
  
export default function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [actor, setActor] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated && actor) {
      fetchNotes();
    }
  }, [isAuthenticated, actor]);

  async function login() {
    const authClient = await AuthClient.create();

    const identityProvider =
      process.env.DFX_NETWORK === "local"
        ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
        : "https://identity.ic0.app";

    await new Promise((resolve) =>
      authClient.login({
        identityProvider,
        onSuccess: resolve,
      })
    );

    const identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });

    if (process.env.DFX_NETWORK === "local") {
      await agent.fetchRootKey();
    }

    const authenticatedActor = createBackendActor(backendCanisterId, { agent });

    setActor(authenticatedActor);
    setIsAuthenticated(true);
  }

  async function fetchNotes() {
    try {
      const res = await actor.getNotes();
      if (res.ok) {
        const sortedNotes = res.ok.slice().reverse();
        setNotes(sortedNotes);
      } else {
        console.error("getNotes error:", res.err);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  }

  async function handleAddNote() {
    if (newNote.trim() === "") return;
    try {
      const res = await actor.addNote(newNote);
      if (res.ok) {
        setNotes(res.ok.slice().reverse());
        setNewNote("");
      } else {
        console.error("addNote error:", res.err);
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <img className="logo" src={logo} alt="App Logo" />
        <div style={{ marginTop: "2rem" }}>
          <button className="button-4" onClick={login}>
            Login with <strong>Internet Identity</strong>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <img className="logo" src={logo} alt="App Logo" />

      <div className="notes-container">
        {notes.map((note, index) => (
          <div key={index} className="note-card">
            {note}
          </div>
        ))}
      </div>

      <div className="add-note-section">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={4}
          cols={50}
          placeholder="Write a new note..."
        />
        <button className="button-4" onClick={handleAddNote}>
          Add Note
        </button>
      </div>
    </div>
  );
}
