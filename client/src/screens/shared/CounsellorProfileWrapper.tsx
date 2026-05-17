import React from 'react';
import { useRole } from '../../context/RoleContext';
import { AppRole } from '../../types';
import { ProfileScreen } from './ProfileScreen';

export const CounsellorProfileWrapper: React.FC = () => {
  const { switchRole } = useRole();
  const handleSwitch = (role: AppRole) => switchRole(role);
  return <ProfileScreen onSwitchRole={handleSwitch} />;
};
