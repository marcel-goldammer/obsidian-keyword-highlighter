<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { ToggleComponent } from 'obsidian';

  export let checked = false;
  export let disabled = false;

  const dispatch = createEventDispatcher();
  let containerEl: HTMLElement;
  let component: ToggleComponent;

  onMount(() => {
    component = new ToggleComponent(containerEl);
    component.setValue(checked);
    component.setDisabled(disabled);
    component.onChange((value) => {
      checked = value;
      dispatch('change', checked);
    });
  });

  onDestroy(() => {
    if (component) {
      containerEl.empty();
    }
  });

  $: if (component) {
    component.setValue(checked);
    component.setDisabled(disabled);
  }
</script>

<div bind:this={containerEl}></div>
