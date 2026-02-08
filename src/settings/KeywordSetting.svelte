<script lang="ts">
  import type { KeywordStyle } from 'src/shared';
  import ToggleButtonGroup from './ToggleButtonGroup.svelte';
  import Checkbox from './Checkbox.svelte';
  import { setIcon } from 'obsidian';
  import { createEventDispatcher } from 'svelte';
  import { settingsStore } from 'src/stores/settings-store';

  export let keyword: KeywordStyle;
  export let index: number;

  const dispatch = createEventDispatcher();

  const toggleButtonOptions = {
    bold: '<b>b</b>',
    italic: '<i>i</i>',
    underline: '<u>u</u>',
    lineThrough: '<s>s</s>',
  };

  $: isRegex = keyword.keyword.startsWith('/') && keyword.keyword.endsWith('/') && keyword.keyword.length > 2;

  function updateKeyword() {
    settingsStore.update((settings) => {
      const keywordIndex = settings.keywords.indexOf(keyword);
      if (keywordIndex !== -1) {
        settings.keywords[keywordIndex] = keyword;
      }
      return settings;
    });
  }

  // eslint-disable-next-line no-undef
  function useIcon(node: HTMLElement, icon: string) {
    setIcon(node, icon);
    return {
      update(icon: string) {
        setIcon(node, icon);
      },
    };
  }
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">{`Keyword #${index}`}</div>
    <div class="setting-item-description">Enter a keyword, font modifiers, a font color and a background color</div>
  </div>
  <div class="setting-item-control">
    <div class="kh-keyword-input-wrapper">
      <input type="text" spellcheck="false" bind:value={keyword.keyword} on:change={updateKeyword} />
      {#if isRegex}
        <span class="kh-regex-badge" title="Regular expression pattern">.*</span>
      {/if}
    </div>
    <ToggleButtonGroup
      options={toggleButtonOptions}
      state={keyword.fontModifiers ?? []}
      on:stateChanged={({ detail }) => {
        keyword.fontModifiers = detail.state;
        updateKeyword();
      }}
    />
    <Checkbox
      label="Activate to modify the font color"
      state={keyword.showColor ?? true}
      on:clicked={({ detail }) => {
        keyword.showColor = detail.state;
        updateKeyword();
      }}
    />
    <input type="color" bind:value={keyword.color} />
    <Checkbox
      label="Activate to modify the background color"
      state={keyword.showBackgroundColor ?? true}
      on:clicked={({ detail }) => {
        keyword.showBackgroundColor = detail.state;
        updateKeyword();
      }}
    />
    <input type="color" bind:value={keyword.backgroundColor} on:change={updateKeyword} />
    <button class="clickable-icon" aria-label="Remove keyword" use:useIcon={'minus-circle'} on:click={() => dispatch('remove', keyword)}></button>
  </div>
</div>

<style>
  .setting-item-control {
    flex-shrink: 0;
  }

  .kh-keyword-input-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .kh-regex-badge {
    font-family: var(--font-monospace);
    font-size: var(--font-ui-smaller);
    color: var(--text-muted);
    background-color: var(--background-modifier-hover);
    padding: 1px 4px;
    border-radius: var(--radius-s);
    white-space: nowrap;
    user-select: none;
  }
</style>
