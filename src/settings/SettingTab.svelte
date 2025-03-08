<script lang="ts">
  import type { KeywordStyle } from "src/shared";
  import KeywordSetting from "./KeywordSetting.svelte";
  import type { Writable } from "svelte/store";
  import {
    addKeyword,
    removeKeyword,
    type PluginSettings,
  } from "src/stores/settings-store";

  export let settingsStore: Writable<PluginSettings>;

  $: keywords = $settingsStore.keywords;

  let ref: HTMLElement;

  function handleAddKeyword() {
    addKeyword("", ref);
  }

  function handleRemoveKeyword(keyword: KeywordStyle) {
    removeKeyword(keyword);
  }
</script>

<div bind:this={ref}>
  {#each keywords as keyword, index}
    <KeywordSetting
      {index}
      {keyword}
      on:remove={() => handleRemoveKeyword(keyword)}
    />
  {/each}

  <div class="setting-item">
    <button on:click={handleAddKeyword}>Add new keyword</button>
  </div>
</div>

<style></style>
