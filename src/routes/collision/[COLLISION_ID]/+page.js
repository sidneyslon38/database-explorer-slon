import { error } from '@sveltejs/kit';
import crashes from '$lib/data/cyclist_injuries_2026.json';

export function load({ params }) {
  const crash = crashes.find(c => c.COLLISION_ID === params.COLLISION_ID);
  
  if (!crash) {
    throw error(404, 'Collision not found');
  }

  return {
    crash,
    showHeader: false,
    showFooter: false,
  };
}
export function entries() {
  return crashes.map((c) => ({ COLLISION_ID: c.COLLISION_ID }));
}