<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label: string;
  export let state = false;

  const dispatch = createEventDispatcher();
</script>

<input
  type="checkbox"
  bind:checked={state}
  title={label}
  on:change={() => dispatch("clicked", { state })}
/>

<style>
  input[type="checkbox"] {
    margin-inline-end: 0;
  }
</style>
