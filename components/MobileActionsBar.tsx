
import React from 'react';
import Button from './common/Button.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { SaveIcon } from './icons/SaveIcon.tsx';
import { ShareIcon } from './icons/ShareIcon.tsx';
import { WhatsAppIcon } from './icons/WhatsAppIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';

interface MobileActionsBarProps {
  onDownload: () => void;
  onSave: () => void;
  onShare: () => void;
  onWhatsApp: () => void;
  onCreateNew: () => void;
  actionStatus: 'idle' | 'processing' | 'copied' | 'error';
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'local_saved';
}

const MobileActionsBar: React.FC<MobileActionsBarProps> = ({
  onDownload,
  onSave,
  onShare,
  onWhatsApp,
  onCreateNew,
  actionStatus,
  saveStatus,
}) => {
  const isActionProcessing = actionStatus === 'processing' || saveStatus === 'saving';
  
  const getSaveLabel = () => {
    switch(saveStatus) {
        case 'saving': return 'Saving...';
        case 'saved': return 'Saved!';
        case 'local_saved': return 'Saved';
        case 'error': return 'Error';
        default: return 'Save';
    }
  };

  const ActionButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean; className?: string }> = 
  ({ onClick, title, children, disabled, className = '' }) => (
     <button 
        onClick={onClick} 
        title={title} 
        disabled={disabled}
        className={`flex flex-col items-center justify-center w-full transition-colors text-neutral-600 hover:text-primary disabled:text-neutral-400 disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-40 lg:hidden no-print">
       <div className="grid h-full grid-cols-5 mx-auto">
            <ActionButton onClick={onDownload} title="Download/Print PDF" disabled={isActionProcessing}>
                <DownloadIcon className="w-6 h-6 mb-0.5" />
                <span className="text-xs font-medium">Print</span>
            </ActionButton>
            <ActionButton onClick={onSave} title="Save Invoice" disabled={isActionProcessing}>
                <SaveIcon className="w-6 h-6 mb-0.5" />
                <span className="text-xs font-medium">{getSaveLabel()}</span>
            </ActionButton>
            
            <div className="flex items-center justify-center">
                 <button onClick={onShare} disabled={isActionProcessing} className="inline-flex items-center justify-center w-16 h-16 font-medium bg-primary rounded-full text-white -mt-6 shadow-lg hover:bg-primary-dark transition-all disabled:bg-neutral-400">
                    <ShareIcon className="w-7 h-7"/>
                </button>
            </div>

             <ActionButton onClick={onWhatsApp} title="Share on WhatsApp" disabled={isActionProcessing}>
                <WhatsAppIcon className="w-6 h-6 mb-0.5 text-green-600" />
                <span className="text-xs font-medium">WhatsApp</span>
            </ActionButton>
             <ActionButton onClick={onCreateNew} title="Create New Invoice" disabled={isActionProcessing}>
                <PlusIcon className="w-6 h-6 mb-0.5" />
                <span className="text-xs font-medium">New</span>
            </ActionButton>
       </div>
    </div>
  );
};

export default MobileActionsBar;
