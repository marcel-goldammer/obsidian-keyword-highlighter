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

  $: previewStyle = {
    color: keyword.showColor ? keyword.color : 'inherit',
    'background-color': keyword.showBackgroundColor ? keyword.backgroundColor : 'transparent',
    fontWeight: keyword.fontModifiers?.includes('bold') ? 'bold' : 'normal',
    fontStyle: keyword.fontModifiers?.includes('italic') ? 'italic' : 'normal',
    textDecoration: getTextDecoration(keyword.fontModifiers),
  };

  function getTextDecoration(fontModifiers: string[] = []) {
    if (fontModifiers.includes('underline')) return 'underline';
    if (fontModifiers.includes('lineThrough')) return 'line-through';
    return 'none';
  }

  function getStyleString(styles: Record<string, string>) {
    return Object.entries(styles)
      .map(([prop, value]) => `${prop}:${value}`)
      .join(';');
  }

  const toggleButtonOptions = {
    bold: '<b>b</b>',
    italic: '<i>i</i>',
    underline: '<u>u</u>',
    lineThrough: '<s>s</s>',
  };

  function updateKeyword() {
    settingsStore.update((settings) => {
      const keywordIndex = settings.keywords.indexOf(keyword);
      if (keywordIndex !== -1) {
        settings.keywords[keywordIndex] = keyword;
      }
      return settings;
    });
  }

  function useIcon(node: HTMLElement, icon: string) {
    setIcon(node, icon);
    return {
      update(icon: string) {
        setIcon(node, icon);
      },
    };
  }
</script>

<tr>
  <td>
    <input type="text" spellcheck="false" bind:value={keyword.keyword} on:change={updateKeyword} />
    <div class="keyword-preview">
      <span aria-label="Preview" style={getStyleString(previewStyle)}>
        {keyword.keyword.length > 0 ? keyword.keyword : 'Preview'}
      </span>
    </div>
  </td>
  <td>
    <ToggleButtonGroup
      options={toggleButtonOptions}
      state={keyword.fontModifiers ?? []}
      on:stateChanged={({ detail }) => {
        keyword.fontModifiers = detail.state;
        updateKeyword();
      }}
    />
  </td>
  <td>
    <Checkbox
      label="Activate to modify the font color"
      state={keyword.showColor ?? true}
      on:clicked={({ detail }) => {
        keyword.showColor = detail.state;
        updateKeyword();
      }}
    />
    <input type="color" bind:value={keyword.color} />
  </td>
  <td>
    <Checkbox
      label="Activate to modify the background color"
      state={keyword.showBackgroundColor ?? true}
      on:clicked={({ detail }) => {
        keyword.showBackgroundColor = detail.state;
        updateKeyword();
      }}
    />
    <input type="color" bind:value={keyword.backgroundColor} on:change={updateKeyword} />
  </td>
  <td>
    <button
      class="clickable-icon"
      aria-label="Remove keyword"
      use:useIcon={'minus-circle'}
      on:click={() => dispatch('remove', keyword)}
    ></button>
  </td>
</tr>

<style>
  .keyword-preview {
    margin-top: 6px;
  }
  .keyword-preview span {
    padding: 2px;
    border-radius: 3px;
  }
</style>
