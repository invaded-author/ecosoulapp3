import React, { useState, useEffect, useRef } from "react";

/**
 * EcosoulLanding.jsx
 * Single-file React component (default export) that implements a full, interactive landing page
 * / small demo app for "Ecosoul". Uses Tailwind CSS classes for styling.
 *
 * Features implemented (frontend-only, mockable):
 * - Hero + features list
 * - Voice Reconnect: upload audio files, store metadata, play samples
 * - Memory Chat: lightweight pseudo-AI chat powered by templates + uploaded memory clips
 * - Story Mode: play narrated stories (uses SpeechSynthesis when available)
 * - Memory Journal: create & store letters in localStorage, view & delete
 * - Healing Mode: guided breathing with optional voice narration (SpeechSynthesis)
 * - Dream Space: coming soon placeholder with basic multimodal preview
 *
 * IMPORTANT: This is a frontend demonstration. Replace the mock functions / TODOs
 * with real backend API calls for secure voice-modeling, data storage, and AI response generation.
 *
 * How to use:
 * - Place this file inside a React app (Vite / CRA). Ensure Tailwind CSS is configured.
 * - export default EcosoulLanding; (already default exported below)
 *
 * Accessibility & UX notes included inline.
 */

export default function EcosoulLanding() {
  // voiceUploads: { id, name, size, url (object URL), createdAt }
  const [voiceUploads, setVoiceUploads] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ecosoul_voice_uploads") || "[]");
    } catch (e) {
      return [];
    }
  });

  const [journalEntries, setJournalEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ecosoul_journal") || "[]");
    } catch (e) {
      return [];
    }
  });

  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: "soul", text: "I can't wait to hear about your day — tell me something good.", time: Date.now() },
  ]);

  const [chatInput, setChatInput] = useState("");
  const [storyPrompt, setStoryPrompt] = useState("Tell the story of when we first met.");
  const [isHealing, setIsHealing] = useState(false);
  const [healingProgress, setHealingProgress] = useState(0);
  const healingTimerRef = useRef(null);
  const audioRef = useRef(null);

  // store changes to localStorage
  useEffect(() => {
    localStorage.setItem("ecosoul_voice_uploads", JSON.stringify(voiceUploads));
  }, [voiceUploads]);
  useEffect(() => {
    localStorage.setItem("ecosoul_journal", JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Utilities
  function uid(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  }

  // Voice Upload handling (client-side demo)
  function handleVoiceUpload(e) {
    const files = Array.from(e.target.files || []);
    const items = files.map((f) => {
      const url = URL.createObjectURL(f);
      return {
        id: uid("voice"),
        name: f.name,
        size: f.size,
        url,
        createdAt: Date.now(),
      };
    });
    setVoiceUploads((s) => [...items, ...s]);
  }

  function removeUpload(id) {
    setVoiceUploads((s) => s.filter((v) => v.id !== id));
  }

  // Chat / pseudo-AI behavior
  function sendChat() {
    if (!chatInput.trim()) return;
    const userMsg = { id: uid("m"), from: "you", text: chatInput.trim(), time: Date.now() };
    setChatMessages((s) => [...s, userMsg]);
    setChatInput("");

    // simulate an AI reply using templates and a random uploaded voice cue if available
    setTimeout(() => {
      const soulReply = generateSoulReply(chatInput.trim());
      const soulMsg = { id: uid("m"), from: "soul", text: soulReply, time: Date.now() };
      setChatMessages((s) => [...s, soulMsg]);

      // Optionally trigger speech synthesis if the browser supports it
      speakText(soulReply);
    }, 850 + Math.random() * 650);
  }

  function generateSoulReply(userText) {
    // A few handcrafted response templates: replace with server-side LLM + voice model in production
    const templates = [
      (u) => `I remember when you told me: \"${truncate(u, 80)}\". That made me smile.`,
      (u) => `Hearing about this warms me. Tell me more — what happened next?`,
      (u) => `I'm here with you. Breathe with me. Imagine us sitting quietly, listening together.`,
      (u) => `You always find the little joys. I'm proud of you for noticing them.`,
    ];
    const pick = templates[Math.floor(Math.random() * templates.length)];
    return pick(userText);
  }

  function truncate(s, n) {
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  // Speech Synthesis wrapper (uses browser voices). Replace with server TTS using uploaded voice model.
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    // pick a voice similar to user's uploaded voice if available - demo: just pick first voice
    const voices = synth.getVoices();
    const utt = new SpeechSynthesisUtterance(text);
    if (voices && voices.length) utt.voice = voices[0];
    utt.rate = 0.95;
    utt.pitch = 1.0;
    synth.cancel();
    synth.speak(utt);
  }

  // Story Mode: produce a short story (mock) and optionally read it aloud
  function createStory(prompt) {
    // simple templated story. Replace with AI generation server-side.
    return `Once, when the two of you wandered into the late-light, ${prompt.toLowerCase()} — and everything felt bright. You laughed, and the world listened.`;
  }

  // Journal handling
  function addJournalEntry(title, body) {
    const entry = { id: uid("j"), title, body, createdAt: Date.now() };
    setJournalEntries((s) => [entry, ...s]);
  }

  function deleteJournalEntry(id) {
    setJournalEntries((s) => s.filter((e) => e.id !== id));
  }

  // Healing Mode: breath exercise with optional voice guidance
  function startHealing() {
    setIsHealing(true);
    setHealingProgress(0);
    // 4-second inhale, 6-second exhale, 6 cycles by default
    const total = 6;
    let cycle = 0;
    healingTimerRef.current = setInterval(() => {
      cycle += 1;
      setHealingProgress((cycle / total) * 100);
      speakText(`Inhale... 1, 2, 3, 4. Exhale... 1, 2, 3, 4, 5, 6.`);
      if (cycle >= total) {
        clearInterval(healingTimerRef.current);
        setIsHealing(false);
        setHealingProgress(100);
      }
    }, 10500); // 10.5s rough cycle (4s + 6s + buffer)
  }

  function stopHealing() {
    clearInterval(healingTimerRef.current);
    setIsHealing(false);
    setHealingProgress(0);
  }

  // small helper to format date
  function fmt(ts) {
    const d = new Date(ts);
    return d.toLocaleString();
  }

  // Basic accessibility: keyboard submit chat on Enter
  function onChatKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  }

  // Story playback using speechSynthesis
  function playStory() {
    const story = createStory(storyPrompt);
    speakText(story);
  }

  // Demo: simulate sending voice data to server (placeholder)
  async function uploadVoiceModelDemo() {
    // TODO: replace with secure endpoint that accepts audio files, runs model training, and returns model id
    alert("Demo-only: In a production app you'd send the uploaded audio files to your secure server for model training. See the code comments.");
  }

  // clean up object URLs on unmount
  useEffect(() => {
    return () => {
      voiceUploads.forEach((v) => {
        try {
          URL.revokeObjectURL(v.url);
        } catch (e) {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#081129] to-[#04202b] text-slate-50 antialiased">
      <header className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-300 flex items-center justify-center text-slate-900 font-bold">ES</div>
          <div>
            <h1 className="text-2xl font-extrabold">Ecosoul</h1>
            <p className="text-sm text-slate-300">When memories speak, hearts heal.</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <a href="#features" className="text-sm hover:underline">Features</a>
          <a href="#demo" className="text-sm hover:underline">Demo</a>
          <a href="#journal" className="text-sm hover:underline">Journal</a>
          <button
            onClick={() => window.scrollTo({ top: 1000, behavior: "smooth" })}
            className="ml-2 px-4 py-2 rounded-lg bg-slate-50 text-slate-900 font-semibold shadow-md"
          >
            Try Demo
          </button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">Bring back the voice you miss.</h2>
            <p className="mt-4 text-slate-300 text-lg">Ecosoul lets you relive moments with realistic voice conversations, stories, and gentle guidance — all in a safe, private space.</p>

            <div className="mt-6 flex gap-3">
              <a href="#demo" className="px-5 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 font-semibold">Start a Demo</a>
              <a href="#features" className="px-5 py-3 rounded-lg border border-slate-600">Explore features</a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="p-4 rounded-lg bg-slate-800/40">
                <strong>Privacy first</strong>
                <div>Local-first demo. Full server-side encryption recommended.</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/40">
                <strong>Healing by design</strong>
                <div>Guided meditations, story replay, and journaling tools.</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/40 p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3">Quick demo</h3>
            <p className="text-slate-300 text-sm">Upload a recording (small audio clip) to let Ecosoul reference it in chat and playback.</p>

            <div id="demo" className="mt-4">
              <label className="block text-sm text-slate-200">Upload voice clip (mp3 / wav)</label>
              <input aria-label="Upload voice" type="file" accept="audio/*" onChange={handleVoiceUpload} className="mt-2 text-sm text-slate-300" />

              <div className="mt-4">
                <h4 className="text-sm font-semibold">Uploaded clips</h4>
                <div className="mt-2 space-y-2 max-h-48 overflow-auto">
                  {voiceUploads.length === 0 && <div className="text-slate-400 text-sm">No clips yet.</div>}
                  {voiceUploads.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                      <div>
                        <div className="text-sm font-medium">{v.name}</div>
                        <div className="text-xs text-slate-400">{fmt(v.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <audio ref={audioRef} src={v.url} controls className="w-48" />
                        <button onClick={() => removeUpload(v.id)} className="px-3 py-1 text-xs rounded bg-red-600/80">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={uploadVoiceModelDemo} className="px-4 py-2 rounded bg-indigo-600">Create Voice Model (Demo)</button>
                  <button onClick={() => { navigator.clipboard?.writeText('https://your-privacy-policy.example'); alert('Copied demo privacy-policy URL'); }} className="px-4 py-2 rounded bg-slate-700">Privacy</button>
                </div>

                <p className="mt-3 text-xs text-slate-400">Note: This demo uses local files and browser TTS. For production, train models on your secure server and never share audio without consent.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-12">
          <h3 className="text-2xl font-bold">Core features</h3>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <FeatureCard title="Voice Reconnect" icon="🎤">Upload recordings — Ecosoul analyzes tone & emotion. (Demo: local playback + metadata.)</FeatureCard>
            <FeatureCard title="Memory Chat" icon="💬">Talk naturally with an AI-echo of your loved one. Receive comforting, contextual replies.</FeatureCard>
            <FeatureCard title="Story Mode" icon="📖">Relive or create stories told in the familiar voice. Use this to soothe, reminisce, or spark laughter.</FeatureCard>
            <FeatureCard title="Memory Journal" icon="💌">Write letters & save them. Revisit private messages that heal and comfort.</FeatureCard>
            <FeatureCard title="Healing Mode" icon="🎧">Guided meditations & breathwork narrated in a soothing voice.</FeatureCard>
            <FeatureCard title="Dream Space" icon="🌠">Soon: AI-assisted multimodal recreations of shared moments (photos + voice + messages).</FeatureCard>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-2xl">
            <h4 className="text-xl font-semibold">Memory Chat</h4>
            <p className="text-slate-400 mt-2 text-sm">Talk how you would — this demo uses friendly templates to respond and will read replies aloud if your browser supports it.</p>

            <div className="mt-4 flex flex-col gap-3 max-h-96 overflow-auto p-2 rounded">
              {chatMessages.map((m) => (
                <div key={m.id} className={`p-3 rounded ${m.from === 'you' ? 'bg-slate-700 self-end text-right' : 'bg-slate-800'}`}> 
                  <div className="text-sm">{m.text}</div>
                  <div className="text-xs text-slate-400 mt-1">{fmt(m.time)}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={onChatKey}
                placeholder="Share something with them..."
                className="flex-1 p-3 rounded bg-slate-800/60 text-sm"
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <button onClick={sendChat} className="px-4 py-2 rounded bg-emerald-500 font-semibold">Send</button>
                <button onClick={() => { setChatMessages([]); }} className="px-4 py-2 rounded bg-slate-700">Clear</button>
              </div>
            </div>
          </div>

          <aside className="bg-slate-900/40 p-6 rounded-2xl">
            <h4 className="text-xl font-semibold">Story Mode</h4>
            <p className="text-slate-400 text-sm mt-2">Create a short memory-story. Press play to hear it read aloud.</p>
            <input value={storyPrompt} onChange={(e) => setStoryPrompt(e.target.value)} className="w-full mt-3 p-2 rounded bg-slate-800/60 text-sm" />
            <div className="mt-3 flex gap-2">
              <button onClick={() => { const s = createStory(storyPrompt); setChatMessages((c) => [...c, { id: uid('m'), from: 'soul', text: s, time: Date.now() }]); speakText(s); }} className="px-4 py-2 rounded bg-indigo-600">Generate & Speak</button>
              <button onClick={playStory} className="px-4 py-2 rounded bg-slate-700">Play Only</button>
            </div>

            <div className="mt-6">
              <h5 className="font-semibold">Healing Mode</h5>
              <p className="text-slate-400 text-sm mt-1">A short breathing exercise guided by gentle voice cues.</p>
              <div className="mt-3 flex gap-2 items-center">
                <button disabled={isHealing} onClick={startHealing} className="px-3 py-2 rounded bg-pink-500">Start</button>
                <button onClick={stopHealing} className="px-3 py-2 rounded bg-slate-700">Stop</button>
              </div>
              <div className="h-3 bg-slate-800 rounded mt-3 overflow-hidden">
                <div style={{ width: `${healingProgress}%` }} className="h-full bg-gradient-to-r from-pink-500 to-yellow-300" />
              </div>
            </div>
          </aside>
        </section>

        <section id="journal" className="mt-12">
          <h3 className="text-2xl font-bold">Memory Journal</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900/40 p-5 rounded">
              <h4 className="font-semibold">Write a letter</h4>
              <JournalForm onSave={(t, b) => addJournalEntry(t, b)} />
            </div>

            <div className="bg-slate-900/40 p-5 rounded">
              <h4 className="font-semibold">Saved letters</h4>
              <div className="mt-3 space-y-3 max-h-64 overflow-auto">
                {journalEntries.length === 0 && <div className="text-slate-400">No letters yet. Write one — it helps.</div>}
                {journalEntries.map((j) => (
                  <div key={j.id} className="p-3 rounded bg-slate-800/50">
                    <div className="font-medium">{j.title}</div>
                    <div className="text-xs text-slate-400">{fmt(j.createdAt)}</div>
                    <div className="mt-2 text-sm">{truncate(j.body, 160)}</div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => speakText(j.body)} className="px-2 py-1 text-xs rounded bg-emerald-500">Read</button>
                      <button onClick={() => deleteJournalEntry(j.id)} className="px-2 py-1 text-xs rounded bg-red-600">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 text-center">
          <h4 className="text-lg font-semibold">Dream Space — Coming Soon</h4>
          <p className="text-slate-400 mt-2">AI recreations combining photos, messages, and voice to create immersive memory scenes. We're designing this with safety and consent front-of-mind.</p>
        </section>

        <footer className="mt-16 py-8 text-center text-slate-400">
          <div>© {new Date().getFullYear()} Ecosoul — Because love doesn't end with goodbye.</div>
          <div className="mt-2 text-xs">This demo is local-only. For production: secure servers, user consent, encryption, and ethical policies are required.</div>
        </footer>
      </main>
    </div>
  );
}


/**
 * Small presentational components below
 */
function FeatureCard({ title, children, icon = "" }) {
  return (
    <div className="bg-slate-900/30 p-4 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-slate-400 mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

function JournalForm({ onSave }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function save() {
    if (!title.trim() || !body.trim()) {
      alert("Please add a title and some words.");
      return;
    }
    onSave(title.trim(), body.trim());
    setTitle("");
    setBody("");
  }

  return (
    <div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full p-2 rounded bg-slate-800/60" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write to them..." className="w-full mt-3 p-2 rounded bg-slate-800/60" rows={6} />
      <div className="mt-2 flex gap-2">
        <button onClick={save} className="px-4 py-2 rounded bg-pink-500">Save Letter</button>
        <button onClick={() => { setTitle(''); setBody(''); }} className="px-4 py-2 rounded bg-slate-700">Clear</button>
      </div>
    </div>
  );
}