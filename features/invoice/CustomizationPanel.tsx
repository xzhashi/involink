import React from 'react';
import { CustomizationState } from '../../types.ts';
import { AVAILABLE_FONTS } from '../../constants.ts';
import Button from '../../components/common/Button.tsx';
import Input from '../../components/common/Input.tsx';
import Select from '../../components/common/Select.tsx';
import { XMarkIcon } from '../../components/icons/XMarkIcon.tsx';

interface CustomizationPanelProps {
  customization: CustomizationState;
  onCustomizationChange: (newCustomization: Partial<CustomizationState>) => void;
  onClose: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ customization, onCustomizationChange, onClose }) => {

    const handleColorChange = (key: keyof CustomizationState, value: string) => {
        onCustomizationChange({ [key]: value });
    };

    const handleFontChange = (key: keyof CustomizationState, value: string) => {
        onCustomizationChange({ [key]: value });
    };

    const handleSliderChange = (key: keyof CustomizationState, value: string) => {
        onCustomizationChange({ [key]: Number(value) });
    };

    const handleToggleChange = (key: keyof CustomizationState, value: boolean) => {
        onCustomizationChange({ [key]: value });
    };
    
    const fontOptions = AVAILABLE_FONTS.map(font => ({ value: font.family, label: font.label }));

    return (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-end p-4 z-50 no-print backdrop-blur-sm" onClick={onClose}>
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm h-full flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0"
              onClick={e => e.stopPropagation()} // Prevent clicks inside from closing the panel
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-neutral-darkest">Customize Your Template</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-neutral-500 hover:bg-neutral-light">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-6 flex-grow thin-scrollbar">
                    {/* Colors Section */}
                    <section>
                        <h4 className="font-semibold text-neutral-dark mb-2">Colors</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <ColorInput label="Primary" value={customization.primaryColor} onChange={e => handleColorChange('primaryColor', e.target.value)} />
                            <ColorInput label="Accent" value={customization.accentColor} onChange={e => handleColorChange('accentColor', e.target.value)} />
                            <ColorInput label="Text" value={customization.textColor} onChange={e => handleColorChange('textColor', e.target.value)} />
                            <ColorInput label="Background" value={customization.backgroundColor} onChange={e => handleColorChange('backgroundColor', e.target.value)} />
                        </div>
                    </section>

                    {/* Fonts Section */}
                    <section>
                        <h4 className="font-semibold text-neutral-dark mb-2">Fonts</h4>
                         <Select label="Heading Font" value={customization.headingFont} options={fontOptions} onChange={e => handleFontChange('headingFont', e.target.value)} />
                         <Select label="Body Font" value={customization.bodyFont} options={fontOptions} onChange={e => handleFontChange('bodyFont', e.target.value)} />
                    </section>
                    
                    {/* Layout Section */}
                    <section>
                         <h4 className="font-semibold text-neutral-dark mb-2">Layout & Visibility</h4>
                         <div>
                            <label htmlFor="logoSize" className="block text-sm font-medium text-neutral-dark mb-1">Logo Size ({customization.logoSize}px)</label>
                            <input
                                type="range"
                                id="logoSize"
                                min="20"
                                max="200"
                                value={customization.logoSize}
                                onChange={e => handleSliderChange('logoSize', e.target.value)}
                                className="w-full h-2 bg-neutral-light rounded-lg appearance-none cursor-pointer"
                            />
                         </div>
                         <div className="space-y-2 mt-4">
                            <ToggleInput label="Show Logo" checked={customization.showLogo} onChange={e => handleToggleChange('showLogo', e.target.checked)} />
                            <ToggleInput label="Show Notes Section" checked={customization.showNotes} onChange={e => handleToggleChange('showNotes', e.target.checked)} />
                            <ToggleInput label="Show Terms Section" checked={customization.showTerms} onChange={e => handleToggleChange('showTerms', e.target.checked)} />
                         </div>
                    </section>
                </div>

                 <div className="p-4 border-t text-right">
                    <Button variant="primary" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
};


const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-neutral-dark mb-1">{label}</label>
        <div className="flex items-center border border-slate-300 rounded-md p-1">
            <input type="color" value={value} onChange={onChange} className="w-8 h-8 p-0 border-none bg-transparent" />
            <input type="text" value={value} onChange={onChange} className="w-full border-none focus:ring-0 text-sm ml-2" />
        </div>
    </div>
);

const ToggleInput: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between bg-neutral-lightest p-2 rounded-md">
        <label className="text-sm font-medium text-neutral-dark">{label}</label>
        <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-neutral-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-DEFAULT"></div>
        </div>
    </div>
);

export default CustomizationPanel;
