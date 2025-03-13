<script lang="ts">
  import type { KeywordStyle } from 'src/shared';
  import KeywordSetting from './KeywordSetting.svelte';
  import ToggleSwitch from './ToggleSwitch.svelte';
  import type { Writable } from 'svelte/store';
  import { addKeyword, removeKeyword, type PluginSettings } from 'src/stores/settings-store';

  export let settingsStore: Writable<PluginSettings>;

  const generalSettings = $settingsStore.generalSettings;
  const keywords = $settingsStore.keywords;


  let ref: HTMLElement;

  function handleAddKeyword() {
    addKeyword('', ref);
  }

  function handleRemoveKeyword(keyword: KeywordStyle) {
    removeKeyword(keyword);
  }

  function setCaseSensitive(event: CustomEvent<boolean>) {
    settingsStore.update((settings) => {
      if (!settings.generalSettings) {
        settings.generalSettings = { caseSensitive: false};
      }
      settings.generalSettings.caseSensitive = event.detail;
      return settings;
    })
  }
</script>

<div bind:this={ref}>
  <h1>General Settings</h1>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Case Sensitive</div>
      <div class="setting-item-description">Match keywords with exact case.</div>
    </div>
    <div class="setting-item-control">
      <ToggleSwitch 
        checked={generalSettings?.caseSensitive ?? true}
        on:change={setCaseSensitive} />
    </div>
  </div>

  <h1>Keywords</h1>
  <div class="setting-item align-items-right">
    <button on:click={handleAddKeyword}>Add new keyword</button>
  </div>

  {#each keywords as keyword, index}
    <KeywordSetting {index} {keyword} on:remove={() => handleRemoveKeyword(keyword)} />
  {/each}
</div>

<style>
  .align-items-right {
    display: flex;
    justify-content: flex-end;
  }
</style>
