<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let options: Record<string, string> = {};
  export let state: string[] = [];

  const dispatch = createEventDispatcher();

  function toggleState(key: string) {
    if (state.contains(key)) {
      state = state.filter((v) => v !== key);
    } else {
      state = [...state, key];
    }
    dispatch("stateChanged", { state });
  }
</script>

<span class="group">
  {#each Object.entries(options) as [key, value]}
    <button
      class:checked={state.contains(key)}
      on:click={() => toggleState(key)}>{@html value}</button
    >
  {/each}
</span>

<style>
  button {
    border-radius: 0;
  }
  button:first-child {
    border-top-left-radius: var(--button-radius);
    border-bottom-left-radius: var(--button-radius);
  }

  button:last-child {
    border-top-right-radius: var(--button-radius);
    border-bottom-right-radius: var(--button-radius);
  }

  .checked {
    background-color: var(--color-base-40);
  }
</style>
