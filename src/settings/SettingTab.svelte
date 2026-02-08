<script lang="ts">
  import type { KeywordStyle } from 'src/shared';
  import KeywordSetting from './KeywordSetting.svelte';
  import CollapsibleSection from './CollapsibleSection.svelte';
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
  <CollapsibleSection
    title="Global Settings"
    description="Global settings will be added in future updates. This section will include options like case sensitivity and pattern matching that apply to all keywords."
    expanded={false}
  />

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
