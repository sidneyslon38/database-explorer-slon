<script>
    let {
        imgSrc = '',
        altText = ''
        } = $props();
</script>

<div class="right-image">
  <img class="image" 
    src="{imgSrc}" 
    alt="{altText}" />
  {#if altText}
    <p class="caption">{altText}</p>
  {/if}
</div>

<style lang="scss">
  @use '$lib/styles' as *;

    .right-image {
      float: right;
      margin-left: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      max-width: 24rem;
      height: auto;
    }

    .caption {
      font-size: 0.6rem;
      text-align: center;
      color: var(--color-medium-gray);
      margin-top: var(--spacing-xs);
      margin-bottom: 0;
    }
  
</style>