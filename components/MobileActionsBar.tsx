
import React from 'react';
import Button from './common/Button';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShareIcon } from './icons/ShareIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { PlusIcon } from './icons/PlusIcon';

interface MobileActionsBarProps {
  onDownload: () => void;
  onShare: () => void;
  onWhatsApp: () => void;
  onCreateNew: () => void;
}

const MobileActionsBar: React.FC<MobileActionsBarProps> = ({
  onDownload,
  onShare,
  onWhatsApp,
  onCreateNew,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] p-2 flex justify-around items-center z-40 lg:hidden no-print">
      <Button 
        variant="ghost" 
        onClick={onDownload} 
        className="flex flex-col items-center !text-primary-DEFAULT !px-1 !py-1.5"
        title="Download/Print PDF"
      >
        <DownloadIcon className="w-6 h-6 mb-0.5" />
        <span className="text-xs">Print</span>
      </Button>
      <Button 
        variant="ghost" 
        onClick={onShare} 
        className="flex flex-col items-center !text-primary-DEFAULT !px-1 !py-1.5"
        title="Share Invoice"
      >
        <ShareIcon className="w-6 h-6 mb-0.5" />
        <span className="text-xs">Share</span>
      </Button>
      <Button 
        variant="ghost" 
        onClick={onWhatsApp} 
        className="flex flex-col items-center !text-green-600 !px-1 !py-1.5"
        title="Share on WhatsApp"
      >
        <WhatsAppIcon className="w-6 h-6 mb-0.5" />
        <span className="text-xs">WhatsApp</span>
      </Button>
      <Button 
        variant="ghost" 
        onClick={onCreateNew} 
        className="flex flex-col items-center !text-secondary-DEFAULT !px-1 !py-1.5"
        title="Create New Invoice"
      >
        <PlusIcon className="w-6 h-6 mb-0.5" />
        <span className="text-xs">New</span>
      </Button>
    </div>
  );
};

export default MobileActionsBar;
