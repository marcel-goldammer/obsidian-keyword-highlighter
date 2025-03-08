<script lang="ts">
  import type { KeywordStyle } from "src/shared";
  import ToggleButtonGroup from "./ToggleButtonGroup.svelte";
  import Checkbox from "./Checkbox.svelte";
  import { setIcon } from "obsidian";
  import { createEventDispatcher } from "svelte";
  import { settingsStore } from "src/stores/settings-store";

  export let keyword: KeywordStyle;
  export let index: number;

  const dispatch = createEventDispatcher();

  const toggleButtonOptions = {
    bold: "<b>b</b>",
    italic: "<i>i</i>",
    underline: "<u>u</u>",
    lineThrough: "<s>s</s>",
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

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-name">{`Keyword #${index}`}</div>
    <div class="setting-item-description">
      Enter a keyword, font modifiers, a font color and a background color
    </div>
  </div>
  <div class="setting-item-control">
    <div>
      <input
        type="text"
        spellcheck="false"
        bind:value={keyword.keyword}
        on:change={updateKeyword}
      />
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
    <input
      type="color"
      bind:value={keyword.backgroundColor}
      on:change={updateKeyword}
    />
    <button
      class="clickable-icon"
      aria-label="Remove keyword"
      use:useIcon={"minus-circle"}
      on:click={() => dispatch("remove", keyword)}
    ></button>
  </div>
</div>

<style>
  .setting-item-control {
    flex-shrink: 0;
  }
</style>
