import React from 'react';
import { useRole } from '../../context/RoleContext';
import { AppRole } from '../../types';
import { SettingsScreen } from './SettingsScreen';

export const SettingsWrapper: React.FC = () => {
  const { switchRole } = useRole();
  const handleSwitch = (role: AppRole) => switchRole(role);
  return <SettingsScreen onSwitchRole={handleSwitch} />;
};

