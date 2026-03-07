<script>
  import { Mic, SendHorizontal } from "@lucide/svelte";
</script>

<div id="record-page">
  <div id="content-container">
    <h1 style:color="var(--content-accent)">Emergency Recorder</h1>
    <p>Press the button to record your message</p>
    <button id="recorder-button"></button>
    <p>Press to start recording</p>
    <div id="user-details">
      <form id="user-details-form">
        <label for="full-name">Name *</label>
        <input id="full-name" type="text" placeholder="Full name" />

        <div class="split-fields">
          <div class="field-group">
            <label for="age">Age</label>
            <input id="age" type="number" placeholder="Age" min="0" />
          </div>

          <div class="field-group">
            <label for="nric">NRIC</label>
            <input id="nric" type="text" placeholder="NRIC" />
          </div>
        </div>

        <label for="address">Address</label>
        <input id="address" type="text" placeholder="Address" />

        <label for="phone">Phone</label>
        <input id="phone" type="tel" placeholder="Phone number" />
      </form>

      <button id="submit-help-request" type="button">
        <SendHorizontal size="24" strokeWidth="2" />
        <span>SUBMIT HELP REQUEST</span>
      </button>
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
    gap: 1.5rem;
    padding: 2rem;
    box-sizing: border-box;
  }

  #content-container {
    width: 50vw;
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  h1,
  p {
    text-align: center;
    margin: 10px 0px;
  }

  #recorder-button {
    background-color: aquamarine;
    height: 100px;
    width: 100px;
    margin: 30px 0px;
  }

  #user-details {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem;
    position: relative;
  }

  #user-details-form {
    width: 100%;
    padding: 1.8rem;
    border-radius: 14px;
    border: 1px solid rgba(67, 88, 120, 0.55);
    background: linear-gradient(
      180deg,
      rgba(26, 34, 52, 0.7) 0%,
      rgba(23, 31, 48, 0.78) 100%
    );
    box-sizing: border-box;
  }

  #user-details-form label {
    display: block;
    font-size: 1rem;
    margin-bottom: 0.7rem;
    text-align: left;
  }

  #user-details-form input {
    width: 100%;
    padding: 1rem 1.15rem;
    margin-bottom: 1.6rem;
    border-radius: 11px;
    border: 1px solid rgba(56, 80, 118, 0.7);
    background: rgba(6, 16, 32, 0.88);
    color: var(--content-color);
    font-size: 1rem;
    box-sizing: border-box;
  }

  #user-details-form input::placeholder {
    color: rgba(177, 193, 217, 0.75);
  }

  .split-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.6rem;
  }

  .field-group label {
    margin-top: 0;
  }

  #submit-help-request {
    width: 100%;
    border: none;
    border-radius: 11px;
    padding: 1.2rem 1rem;
    background-color: #1f7f79;
    color: #071322;
    font-size: 2rem;
    letter-spacing: 0.06em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
    cursor: pointer;
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
