<script>
  import { base } from '$app/paths';
  import DatabaseHeader from '$lib/components/DatabaseHeader.svelte';
  import RankingList from '$lib/components/RankingList.svelte';
  import RankingCard from '$lib/components/RankingCard.svelte';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import MethodologyBox from '$lib/components/MethodologyBox.svelte';
  import RightImage from '$lib/components/RightImage.svelte';

  let { data } = $props();

  let search = $state('');

  let filtered = $derived(
    data.crashes
      .filter((crash) => {
        const searchLower = search.toLowerCase();
        const [month, day, year] = String(crash['CRASH DATE'] || '').split('/');
        const monthNames = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        
        // Search by borough
        if ((crash.BOROUGH || '').toLowerCase().includes(searchLower)) return true;
        
        // Search by full date (MM/DD/YYYY or partial like "02/17" or "2026")
        if ((crash['CRASH DATE'] || '').includes(search)) return true;
        
        // Search by month name or number with day (e.g., "January 1", "01/01", "01 01")
        const monthName = monthNames[Number(month)] || '';
        const searchParts = searchLower.split(/[\s\/]+/); // Split by space or slash
        
        if (searchParts.length === 2) {
          const [monthPart, dayPart] = searchParts;
          const monthMatch = monthName.includes(monthPart) || month.padStart(2, '0').includes(monthPart.padStart(2, '0'));
          const dayMatch = day.padStart(2, '0').includes(dayPart.padStart(2, '0'));
          if (monthMatch && dayMatch) return true;
        }
        
        // Single month name or number
        if (monthName.includes(searchLower) || month?.padStart(2, '0').includes(search.padStart(2, '0'))) return true;
        
        return false;
      })
      .sort((a, b) => {
        const toTimestamp = (row) => {
          const [month, day, year] = String(row['CRASH DATE'] || '')
            .split('/')
            .map(Number);

          const [hour = '0', minute = '0'] = String(row['CRASH TIME'] || '').split(':');

          if (!month || !day || !year) return 0;

          return Date.UTC(year, month - 1, day, Number(hour), Number(minute));
        };

        return toTimestamp(b) - toTimestamp(a);
      })
      .slice(0, 20)
  )

  function formatToAmPm(time24) {
    const [h = '00', m = '00'] = String(time24 || '').split(':');
    const hours = Number(h);
    const mins = Number(m);

    if (Number.isNaN(hours) || Number.isNaN(mins)) return time24 || '';

    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(mins).padStart(2, '0')} ${suffix}`;
  }

  function getInjuryLabel(crash) {
  const killed = Number(crash['NUMBER OF CYCLIST KILLED']);
  const injured = Number(crash['NUMBER OF CYCLIST INJURED']);
  
  if (killed > 0) {
    return killed > 1 ? 'killed' : 'killed';
  } else {
    return injured > 1 ? 'injuries' : 'injury';
  }
}

function getTotalCyclistCasualties(crashes) {
  let totalInjured = 0;
  let totalKilled = 0;
  
  crashes.forEach(crash => {
    totalInjured += Number(crash['NUMBER OF CYCLIST INJURED']) || 0;
    totalKilled += Number(crash['NUMBER OF CYCLIST KILLED']) || 0;
  });
  
  return { totalInjured, totalKilled, total: totalInjured + totalKilled };
}

function getBoroughWithMostInjuries(crashes) {
  const boroughTotals = {};
  
  crashes.forEach(crash => {
    const borough = crash.BOROUGH || 'Unknown';
    const injured = Number(crash['NUMBER OF CYCLIST INJURED']) || 0;
    boroughTotals[borough] = (boroughTotals[borough] || 0) + injured;
  });
  
  return Object.entries(boroughTotals).sort((a, b) => b[1] - a[1])[0];
}

function getTopCauses(crashes, limit = 3) {
  const causeTotals = {};
  
  crashes.forEach(crash => {
    const cause = crash['CONTRIBUTING FACTOR VEHICLE 1'] || 'Unknown';
    const injured = Number(crash['NUMBER OF CYCLIST INJURED']) || 0;
    causeTotals[cause] = (causeTotals[cause] || 0) + injured;
  });
  
  return Object.entries(causeTotals)
    .sort((a, b) => b[1] - a[1])
    .filter(([cause]) => cause !== 'Unspecified')
    .slice(0, limit)
    .map(([cause, count]) => ({ cause, count }));
}

const [topBorough, injuries] = getBoroughWithMostInjuries(data.crashes);
const topCauses = getTopCauses(data.crashes, 3);
const { totalInjured, totalKilled, total } = getTotalCyclistCasualties(data.crashes);

</script>

<DatabaseHeader
  kicker="NYC Cyclist Injuries in 2026"
  headline="Cyclists Injured in Vehicle Collisions This Year"
  description="A database of this year's NYC cyclist injuries and deaths caused by vehicle collisions."
  byline="By Sidney Slon"
  date="UPDATED: April 12, 2026"
  bgColor="var(--color-light-gray)"
  >
</DatabaseHeader>

<div class="container">

<RightImage
imgSrc = 'noun-bike-helmet-7820896.png'
altText = 'bike helmet by Dedy Dwi Qoirudin from Noun Project (CC BY 3.0)'
/>

<div class="summary">
<h3><strong>A quick look at the numbers:</strong></h3>
<p>In 2026 so far, there have been <span class="accent"><strong>{totalInjured}</strong></span> cyclist injuries and <span class="accent"><strong>{totalKilled}</strong></span> cyclist deaths from vehicle collisions, totaling <span class="accent"><strong>{total}</strong></span> casualties.</p>
<p><span class="accent"><strong>{topBorough}</strong></span> has reported the most cyclist injuries this year ({injuries} injuries).</p>
<br>
<p>The top three reported causes of cyclist collisions this year are:</p>
<ul class="no-bullets">
  {#each topCauses as { cause, count }, i}
    <li><span class="accent"><strong>{cause}</strong></span> ({count} injuries)</li>
  {/each}
</ul>
</div>
<br>
<div class="search-wrapper">
  <SearchInput bind:value={search} placeholder="Search by borough, month or a specific date..." />
</div>

<RankingList title={search ? `Showing ${filtered.length} most recent collisions` : 'Recent Collisions By Date'}>
  {#each filtered as crash (crash['COLLISION_ID'])}
    <RankingCard
      rank={crash['CRASH DATE']}
      title={formatToAmPm(crash['CRASH TIME'])}
      href="{base}/collision/{crash['COLLISION_ID']}"
      description={`Location: ${crash['BOROUGH']}`}
      value={`${crash['NUMBER OF CYCLIST KILLED'] > 0 ? crash['NUMBER OF CYCLIST KILLED'] : crash['NUMBER OF CYCLIST INJURED']}`}
      valueLabel={getInjuryLabel(crash)}
      />
  {/each}
</RankingList>

<MethodologyBox>
  <p>
    The data on this page comes from the New York City Police Department's Motor Vehicle Collisions dataset,
    <a href="https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95/about_data" target="_blank"> which is updated regularly</a>.
  </p>
  <p>The collisions published by the city were filtered to include only those involving at least one injured or killed cyclist. The results were also filtered to include only crashes on or after January 1st in 2026. The data is as current as April 12, 2026.</p>
  <p>The code that created this dataset explorer is available as open source on <a href="https://github.com/sidneyslon38/database-explorer-slon" target="_blank">GitHub</a>.</p>
</MethodologyBox>
</div> 

<style lang="scss">

  .container {
    max-width: var(--max-width-wide);
    margin: 0 auto;
  }

  .summary {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-sm);
  }

  .search-wrapper {
    max-width: 600px;
    margin-bottom: var(--spacing-lg);
  }

  .no-bullets {
  list-style: none;
  padding-left: 0;
}

.accent {
  color: var(--db-color-accent);
}
</style>