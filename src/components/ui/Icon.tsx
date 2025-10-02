import React from 'react';
import {
  FiCode, FiSettings, FiFileText, FiLogOut, FiChevronLeft, FiChevronRight, 
  FiMenu, FiX, FiSun, FiMoon, FiTrash2, FiSave, FiEdit, FiSearch, FiCopy, 
  FiCheck, FiAlertTriangle, FiInfo, FiZap, FiLock, FiBookOpen, FiMessageSquare,
  FiPlus, FiDownload, FiUpload, FiShare2, FiGithub, FiTerminal, FiDatabase,
  FiCpu, FiGitBranch, FiBox, FiLayers, FiLifeBuoy, FiShield
} from 'react-icons/fi';

export const iconMap = {
  code: FiCode,
  settings: FiSettings,
  snippets: FiFileText,
  logout: FiLogOut,
  left: FiChevronLeft,
  right: FiChevronRight,
  menu: FiMenu,
  close: FiX,
  sun: FiSun,
  moon: FiMoon,
  trash: FiTrash2,
  save: FiSave,
  edit: FiEdit,
  search: FiSearch,
  copy: FiCopy,
  check: FiCheck,
  warning: FiAlertTriangle,
  info: FiInfo,
  zap: FiZap,
  lock: FiLock,
  book: FiBookOpen,
  comment: FiMessageSquare,
  plus: FiPlus,
  download: FiDownload,
  upload: FiUpload,
  share: FiShare2,
  github: FiGithub,
  terminal: FiTerminal,
  database: FiDatabase,
  cpu: FiCpu,
  branch: FiGitBranch,
  box: FiBox,
  layers: FiLayers,
  help: FiLifeBuoy,
  shield: FiShield
};

export type IconName = keyof typeof iconMap;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  ...props 
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found.`);
    return <FiAlertTriangle size={size} color="red" />;
  }

  return <IconComponent size={size} {...props} />;
};
