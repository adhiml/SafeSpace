/** Module-level demo user id for API requests (synced from RoleContext) */
let activeDemoUserId = 'user_001';

export const setActiveDemoUserId = (id: string) => {
  activeDemoUserId = id;
};

export const getActiveDemoUserId = () => activeDemoUserId;
