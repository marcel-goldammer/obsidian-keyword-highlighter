<script lang="ts">
  import type { KeywordStyle } from "src/shared";
  import KeywordSetting from "./KeywordSetting.svelte";
  import { createEventDispatcher } from "svelte";

  export let keywords: KeywordStyle[];

  const dispatch = createEventDispatcher();

  let ref: HTMLElement;
</script>

<div bind:this={ref}>
  {#each keywords as keyword, index}
    <KeywordSetting
      {index}
      {keyword}
      on:remove={() => dispatch("removeKeyword", { keyword })}
      on:update={() => dispatch("update")}
    />
  {/each}

  <div class="setting-item">
    <button on:click={() => dispatch("addKeyword")}>Add new keyword</button>
  </div>
</div>

<style></style>
