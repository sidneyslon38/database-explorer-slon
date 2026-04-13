<script>
  import { base } from '$app/paths';
  import DatabaseHeader from '$lib/components/DatabaseHeader.svelte';
  import Dashboard from '$lib/components/Dashboard.svelte';
  import BigNumber from '$lib/components/BigNumber.svelte';
  import Card from '$lib/components/Card.svelte';
  import MethodologyBox from '$lib/components/MethodologyBox.svelte';
  import LocatorMap from '$lib/components/LocatorMap.svelte';
  import LittleNumber from '$lib/components/LittleNumber.svelte';

  let { data } = $props();
  let crash = $derived(data.crash);

  function formatDate(dateStr) {
    // Input is MM/DD/YYYY format
    const [month, day, year] = String(dateStr || '').split('/').map(Number);
    if (!month || !day || !year) return dateStr;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatToAmPm(time24) {
    const [h = '00', m = '00'] = String(time24 || '').split(':');
    const hours = Number(h);
    const mins = Number(m);

    if (Number.isNaN(hours) || Number.isNaN(mins)) return time24 || '';

    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(mins).padStart(2, '0')} ${suffix}`;
  }

  function parseLocation(LOCATION) {
    const match = String(LOCATION || '').match(/\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
    if (!match) return { lat: null, lng: null };
    return {
      lat: Number(match[1]),
      lng: Number(match[2])
    };
  }

  const { lat, lng } = $derived.by(() => parseLocation(crash.LOCATION || ''));

</script>

<DatabaseHeader
  kicker="NYC Cyclist Injuries in 2026"
  date="Collision ID: {crash['COLLISION_ID']}"
  headline="Location: {crash['BOROUGH']}"
  description={`This collision occurred on ${formatDate(crash['CRASH DATE'])} at ${formatToAmPm(crash['CRASH TIME'])}.`}
>

{#snippet graphic()}
    {#if Number.isFinite(lat) && Number.isFinite(lng)}
      <LocatorMap
        longitude={lng}
        latitude={lat}
        zoom={12}
        dot={true}
        width={200}
        credit=" "
      />
    {/if}
  {/snippet}

  <Dashboard>
    <BigNumber number={`${crash['NUMBER OF CYCLIST INJURED']}`} label="Number of Cyclists Injured" />
    <BigNumber number={crash['NUMBER OF CYCLIST KILLED']} label="Number of Cyclists Killed" />
  </Dashboard>

<LittleNumber number="Reported Cause of Injury" label={crash['CONTRIBUTING FACTOR VEHICLE 1']} />

  <a class="back" href="{base}/">
     ← Back to ranking
  </a>
</DatabaseHeader>

<div class="container">
  <div class="card-grid">
    {#each (crash.violations ?? []) as violation (violation.violationId)}
      <Card>
        <p class="card-date">{formatDate(violation.date)}</p>
        <p>{violation.specificDescription || 'No description available'}</p>
      </Card>
    {/each}
  </div>

<MethodologyBox>
  <p>
    The data on this page comes from the New York City Police Department's Motor Vehicle Collisions dataset,
    <a href="https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95/about_data" target="_blank"> which is updated regularly</a>.
  </p>
  <p>The collisions published by the city were filtered to include only those involving at least one injured or killed cyclist. The results were also filtered to include only crashes on or after January 1st in 2026. The data is as current as April 12, 2026.</p>
  <p>The code that created this dataset explorer is available as open source on <a href="https://github.com/sidneyslon38/database-explorer-slon" target="_blank">GitHub</a>.</p>
</MethodologyBox>
</div>

<style type="scss">
  .container {
    max-width: var(--max-width-wide);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }

  :global(.row) {
    margin-top: var(--spacing-sm) !important;
    margin-bottom: var(--spacing-sm) !important;
    justify-content: flex-start !important;
  }

  @media (max-width: 767px) {
    :global(.row) {
      flex-direction: column;
    }
  }

  :global(.row .big-number .number) {
    font-size: 2.25rem;
  }

  :global(.row .big-number .label) {
    font-size: var(--font-size-sm);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-md);
    margin: var(--spacing-lg) 0;
  }

  :global(p.card-date) {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    color: var(--color-accent) !important;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: var(--spacing-xs) !important;
  }

  a.back {
    display: inline-block;
    margin-top: 1rem;
    font-size: var(--font-size-xs);
    color: var(--color-text);
    text-decoration: none;
    text-transform: uppercase;
    &:hover {
      text-decoration: underline;
    }
  }
</style>