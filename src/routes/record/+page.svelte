<script>
  import { Mic, Square, SendHorizontal, LoaderCircle } from "@lucide/svelte";
  import { supabase } from "$lib/supabaseClient";
  import { analyzeAudio } from "$lib/analyzeAudio";

  // Form submission code
  let name = $state("");
  let nric = $state("");
  let age = $state();
  let address = $state("");
  let phoneNum = $state();
  let isSubmitting = $state(false);

  // $effect(() => {
  //   console.log(name);
  //   console.log(nric);
  //   console.log(age);
  //   console.log(address);
  //   console.log(phoneNum);
  // });

  // Audio recording code
  let isRecording = $state(false);
  let elapsedSeconds = $state(0);
  let audioUrl = $state("");
  let audioBlob = $state(null);
  let timerInterval = null;
  let mediaRecorder = null;
  let audioChunks = [];

  let timerDisplay = $derived(
    String(Math.floor(elapsedSeconds / 60)).padStart(2, "0") +
      ":" +
      String(elapsedSeconds % 60).padStart(2, "0"),
  );

  async function startRecording() {
    audioChunks = [];
    audioUrl = "";
    audioBlob = null;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioUrl = URL.createObjectURL(audioBlob);
      stream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorder.start();
    isRecording = true;
    elapsedSeconds = 0;
    timerInterval = setInterval(() => {
      elapsedSeconds++;
    }, 1000);
  }

  function stopRecording() {
    mediaRecorder?.stop();
    clearInterval(timerInterval);
    isRecording = false;
  }

  function toggleRecording() {
    isRecording ? stopRecording() : startRecording();
  }

  // Validation
  let errorMessage = $state("");

  let canSubmit = $derived(
    !!audioBlob &&
      String(name).trim() !== "" &&
      String(nric).trim() !== "" &&
      age !== "" &&
      age !== null &&
      String(address).trim() !== "" &&
      phoneNum !== "" &&
      phoneNum !== null,
  );

  async function handleSubmit() {
    if (!audioBlob) {
      errorMessage = "Please record a message first.";
      return;
    }
    if (!String(name).trim()) {
      errorMessage = "Name is required.";
      return;
    }
    if (age === "" || age === null) {
      errorMessage = "Age is required.";
      return;
    }
    if (!String(nric).trim()) {
      errorMessage = "NRIC is required.";
      return;
    }
    if (!String(address).trim()) {
      errorMessage = "Address is required.";
      return;
    }
    if (phoneNum === "" || phoneNum === null) {
      errorMessage = "Phone number is required.";
      return;
    }
    errorMessage = "";
    // Submit to Supabase
    isSubmitting = true;
    try {
      // 1. Upload audio to Storage
      const fileName = `recording_${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("Recordings")
        .upload(fileName, audioBlob, { contentType: "audio/webm" });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from("Recordings")
        .getPublicUrl(fileName);

      // 3. Insert row into cases table (with defaults, AI fills in later)
      const { data: insertedRow, error: insertError } = await supabase
        .from("cases")
        .insert({
          name: String(name).trim(),
          age: Number(age),
          nric: String(nric).trim(),
          address: String(address).trim(),
          phone: String(phoneNum).trim(),
          audio_url: urlData.publicUrl,
          status: "Pending",
          tags: [],
          lang: "",
          priority: 4,
          rawTranscript: "",
          engTranscript: "",
          aiSummary: "",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Run AI analysis on the audio (non-blocking for the user)
      analyzeAudio(audioBlob)
        .then(async (aiResult) => {
          const { error: updateError } = await supabase
            .from("cases")
            .update({
              rawTranscript: aiResult.rawTranscript,
              engTranscript: aiResult.engTranscript,
              lang: aiResult.lang,
              priority: aiResult.priority,
              tags: aiResult.tags,
              aiSummary: aiResult.aiSummary,
            })
            .eq("id", insertedRow.id);

          if (updateError) {
            console.error(
              "Failed to update case with AI results:",
              updateError,
            );
          } else {
            console.log("AI analysis complete for case", insertedRow.id);
          }
        })
        .catch((err) => {
          console.error("AI analysis failed:", err);
        });

      alert(
        "Help request submitted! AI analysis is processing in the background.",
      );
      // Reset form
      name = "";
      age = "";
      nric = "";
      address = "";
      phoneNum = "";
      audioBlob = null;
      audioUrl = "";
      elapsedSeconds = 0;
    } catch (err) {
      console.error(err);
      errorMessage = "Submission failed: " + err.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div id="record-page">
  <div id="content-container">
    <h1 style:color="var(--content-accent)">Emergency Recorder</h1>
    <p class="desc">Press the button to record your message</p>
    <button
      id="recorder-button"
      class:recording={isRecording}
      onclick={toggleRecording}
    >
      {#if isRecording}
        <Square size="36" strokeWidth="3" color="#fff" />
      {:else}
        <Mic size="40" strokeWidth="2" color="#fff" />
      {/if}
    </button>

    {#if isRecording}
      <p class="timer recording-timer">{timerDisplay}</p>
    {:else if elapsedSeconds > 0}
      <p class="timer">{timerDisplay} recorded</p>
    {:else}
      <p>Press to start recording</p>
    {/if}

    {#if audioUrl}
      <audio controls src={audioUrl}></audio>
    {/if}

    <hr class="divider" />

    <div id="user-details">
      <form id="user-details-form">
        <label for="full-name">Name *</label>
        <input
          id="full-name"
          type="text"
          placeholder="Henry Averies"
          bind:value={name}
        />

        <div class="split-fields">
          <div class="field-group">
            <label for="age">Age</label>
            <input
              id="age"
              type="number"
              placeholder="Age"
              min="0"
              bind:value={age}
            />
          </div>

          <div class="field-group">
            <label for="nric">NRIC</label>
            <input
              id="nric"
              type="text"
              placeholder="S1234567Z"
              bind:value={nric}
            />
          </div>
        </div>

        <label for="address">Address</label>
        <input
          id="address"
          type="text"
          placeholder="7th Avenue"
          bind:value={address}
        />

        <label for="phone">Phone</label>
        <input
          id="phone"
          type="number"
          placeholder="9999 9999"
          bind:value={phoneNum}
        />
      </form>

      <button
        id="submit-help-request"
        type="button"
        disabled={!canSubmit || isSubmitting}
        onclick={handleSubmit}
      >
        {#if isSubmitting}
          <LoaderCircle size="24" class="spin" />
          <span>SUBMITTING…</span>
        {:else}
          <SendHorizontal size="24" strokeWidth="2" />
          <span>SUBMIT HELP REQUEST</span>
        {/if}
      </button>
      {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
      {/if}
    </div>
  </div>
</div>

<style>
  #record-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    box-sizing: border-box;
    font-family: var(--font-mono);
  }

  #content-container {
    width: min(520px, 92vw);
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
    gap: 0.15rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  p {
    margin: 4px 0;
  }

  .desc {
    color: var(--content-desc-color);
    font-size: 0.95rem;
  }

  .divider {
    width: 100%;
    border: none;
    border-top: 1px solid rgba(67, 88, 120, 0.35);
    margin: 1rem 0;
  }

  #recorder-button {
    height: 110px;
    width: 110px;
    margin: 30px 0px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.15);
    background: radial-gradient(circle, #e63946 0%, #b5202d 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.25s ease;
  }

  #recorder-button:hover {
    transform: scale(1.06);
    box-shadow: 0 0 20px rgba(230, 57, 70, 0.4);
  }

  #recorder-button.recording {
    animation: pulse-ring 1.4s ease-in-out infinite;
    border-color: #e63946;
  }

  @keyframes pulse-ring {
    0% {
      box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.55);
    }
    70% {
      box-shadow: 0 0 0 18px rgba(230, 57, 70, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(230, 57, 70, 0);
    }
  }

  .timer {
    font-family: var(--font-mono);
    font-size: 1.4rem;
    letter-spacing: 0.08em;
  }

  .recording-timer {
    color: #e63946;
  }

  audio {
    width: 100%;
    max-width: 360px;
    margin: 0.5rem 0;
  }

  #user-details {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  #user-details-form {
    width: 100%;
    padding: 1.6rem;
    border-radius: 14px;
    border: 1px solid rgba(67, 88, 120, 0.4);
    background: linear-gradient(
      180deg,
      rgba(26, 34, 52, 0.6) 0%,
      rgba(23, 31, 48, 0.7) 100%
    );
    box-sizing: border-box;
  }

  #user-details-form label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 0.45rem;
    text-align: left;
    color: var(--content-desc-color);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  #user-details-form input {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-bottom: 1.1rem;
    border-radius: 10px;
    border: 1px solid rgba(56, 80, 118, 0.5);
    background: rgba(6, 16, 32, 0.75);
    color: var(--content-color);
    font-size: 0.95rem;
    box-sizing: border-box;
    transition: border-color 0.2s ease;
    font-family: var(--font-mono);
  }

  #user-details-form input:focus {
    outline: none;
    border-color: var(--content-accent);
  }

  #user-details-form input::placeholder {
    color: rgba(177, 193, 217, 0.5);
    font-family: var(--font-mono);
  }

  .split-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.1rem;
  }

  .field-group label {
    margin-top: 0;
  }

  #submit-help-request {
    width: 100%;
    border: none;
    border-radius: 11px;
    padding: 1rem;
    background-color: var(--content-accent);
    color: var(--background-color);
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-family: var(--font-mono);
  }

  #submit-help-request:hover:not(:disabled) {
    background-color: #28a09a;
  }

  #submit-help-request:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .error-message {
    color: #e63946;
    font-size: 0.9rem;
    margin-top: -0.5rem;
  }

  :global(.spin) {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    #record-page {
      padding: 1rem;
    }

    #user-details-form {
      padding: 1.2rem;
    }

    #user-details-form label,
    #user-details-form input,
    #submit-help-request {
      font-size: 1.35rem;
    }

    .split-fields {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
</style>
