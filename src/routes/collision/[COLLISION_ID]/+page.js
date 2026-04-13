import crashes from '$lib/data/cyclist_injuries_2026.json';

export function load({ params }) {
  const crash = crashes.find(c => c.COLLISION_ID === params.COLLISION_ID);
  return { showHeader: false, showFooter: false, crash };
}

export function entries() {
  return crashes.map(c => ({ id: c.COLLISION_ID }));
}
