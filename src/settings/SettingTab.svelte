<script lang="ts">
  import type { KeywordStyle } from 'src/shared';
  import KeywordSetting from './KeywordSetting.svelte';
  import ToggleSwitch from './ToggleSwitch.svelte';
  import type { Writable } from 'svelte/store';
  import { addKeyword, removeKeyword, type PluginSettings } from 'src/stores/settings-store';

  export let settingsStore: Writable<PluginSettings>;

  $: generalSettings = $settingsStore.generalSettings;
  $: keywords = $settingsStore.keywords;
  $: filteredKeywords = searchQuery
    ? keywords.filter((keyword) => keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    : keywords;

  let ref: HTMLElement;
  let searchQuery = '';

  function handleSearch(e: Event) {
    searchQuery = (e.target as HTMLInputElement).value;
  }

  function handleAddKeyword() {
    addKeyword('', ref);
  }

  function handleRemoveKeyword(keyword: KeywordStyle) {
    removeKeyword(keyword);
  }

  function setCaseSensitive(event: CustomEvent<boolean>) {
    settingsStore.update((settings) => {
      if (!settings.generalSettings) {
        settings.generalSettings = { caseSensitive: false };
      }
      settings.generalSettings.caseSensitive = event.detail;
      return settings;
    });
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
      <ToggleSwitch checked={generalSettings?.caseSensitive ?? true} on:change={setCaseSensitive} />
    </div>
  </div>

  <h1>Keywords</h1>
  <div class="keywords-header-container">
    <input
      type="text"
      placeholder="Filter keywords..."
      class="keyword-search"
      bind:value={searchQuery}
      on:input={handleSearch}
    />
    <button on:click={handleAddKeyword}>Add new keyword</button>
  </div>

  <table class="keywords-table">
    <thead>
      <tr>
        <th>Keyword</th>
        <th>Styling</th>
        <th>Text</th>
        <th>Background</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each filteredKeywords as keyword, index}
        <KeywordSetting {index} {keyword} on:remove={() => handleRemoveKeyword(keyword)} />
      {:else}
        <tr>
          <td colspan="5" class="empty-message">
            {searchQuery ? 'No keywords match your search' : 'No keywords defined'}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .keywords-header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .keyword-search {
    width: 250px;
    margin-right: auto;
  }

  .keywords-table {
    width: 100%;
    border-collapse: collapse;
  }

  .keywords-table th {
    text-align: left;
    padding: 8px;
    background: var(--background-secondary-alt);
  }

  :global(.keywords-table td) {
    padding: 8px;
    border-bottom: 1px solid var(--background-modifier-border);
  }

  .empty-message {
    padding: 10px;
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
  }
</style>
