<script lang="ts">
  export let title: string;
  export let description: string = '';
  export let expanded: boolean = true;
  export let badge: string = '';
</script>

<details open={expanded}>
  <summary>
    <span class="kh-section-title">{title}</span>
    {#if badge}
      <span class="kh-section-badge">{badge}</span>
    {/if}
  </summary>
  {#if description}
    <div class="kh-section-description setting-item-description">
      {description}
    </div>
  {/if}
  <div class="kh-section-content">
    <slot />
  </div>
</details>

<style>
  details {
    border-top: 1px solid var(--background-modifier-border);
    padding-top: 18px;
    margin-bottom: 18px;
  }

  summary {
    cursor: pointer;
    user-select: none;
    list-style: none;
    font-weight: var(--font-semibold);
    font-size: var(--font-ui-medium);
    color: var(--text-normal);
    padding-bottom: 8px;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::marker {
    display: none;
    content: '';
  }

  .kh-section-badge {
    color: var(--text-muted);
    font-weight: var(--font-normal);
    margin-left: 4px;
  }

  .kh-section-description {
    padding-bottom: 12px;
  }

  .kh-section-content {
    padding-top: 4px;
  }
</style>
