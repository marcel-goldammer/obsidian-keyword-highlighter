<script lang="ts">
  import type { KeywordStyle } from 'src/shared';
  import KeywordSetting from './KeywordSetting.svelte';
  import CollapsibleSection from './CollapsibleSection.svelte';
  import Checkbox from './Checkbox.svelte';
  import type { Writable } from 'svelte/store';
  import { addKeyword, removeKeyword, type PluginSettings } from 'src/stores/settings-store';

  export let settingsStore: Writable<PluginSettings>;

  $: keywords = $settingsStore.keywords;
  $: keywordCount = keywords.length;

  // eslint-disable-next-line no-undef
  let ref: HTMLElement;

  function handleAddKeyword() {
    addKeyword('', ref);
  }

  function handleRemoveKeyword(keyword: KeywordStyle) {
    removeKeyword(keyword);
  }
</script>

<div bind:this={ref}>
  <CollapsibleSection title="Global Settings" expanded={false}>
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">Case-sensitive matching</div>
        <div class="setting-item-description">
          When enabled, keywords match exact case only. When disabled, "TODO" also matches "todo", "Todo", etc.
        </div>
      </div>
      <div class="setting-item-control">
        <Checkbox
          label="Case-sensitive matching"
          state={$settingsStore.globalSettings.caseSensitive}
          on:clicked={({ detail }) => {
            settingsStore.update((s) => ({
              ...s,
              globalSettings: { ...s.globalSettings, caseSensitive: detail.state },
            }));
          }}
        />
      </div>
    </div>
  </CollapsibleSection>

  <CollapsibleSection title="Keywords" badge="({keywordCount})" expanded={true}>
    {#each keywords as keyword, index}
      <KeywordSetting {index} {keyword} on:remove={() => handleRemoveKeyword(keyword)} />
    {/each}

    <div class="setting-item kh-add-keyword">
      <button on:click={handleAddKeyword}>Add new keyword</button>
    </div>
  </CollapsibleSection>
</div>

<style>
  .kh-add-keyword {
    display: flex;
    justify-content: flex-end;
  }
</style>
