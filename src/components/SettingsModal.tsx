import React from 'react';
import { Button } from './Button';
import { Settings } from '../context/GameContext';
import '../styles/SettingsModal.css';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  open, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  if (!open) return null;

  return (
    <dialog open={open} className="settings-modal">
      <div className="settings-content">
        <h2 className="settings-title">Settings</h2>
        
        <div className="settings-options">
          <label className="settings-option">
            <span className="option-label">Timer</span>
            <input
              type="checkbox"
              checked={settings.timer}
              onChange={(e) => onSettingsChange({ timer: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          {settings.timer && (
            <div className="time-limit-option">
              <select
                value={settings.timeLimit}
                onChange={(e) => onSettingsChange({ timeLimit: Number(e.target.value) })}
                className="select-dropdown"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
                <option value={180}>3 minutes</option>
              </select>
            </div>
          )}

          <label className="settings-option">
            <span className="option-label">Show Drop Zones</span>
            <input
              type="checkbox"
              checked={settings.showDropZone}
              onChange={(e) => onSettingsChange({ showDropZone: e.target.checked })}
              className="toggle-switch"
            />
          </label>

          <label className="settings-option">
            <span className="option-label">Sound Effects</span>
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={(e) => onSettingsChange({ sound: e.target.checked })}
              className="toggle-switch"
            />
          </label>
        </div>

        <div className="settings-actions">
          <Button onClick={onClose} fullWidth>
            Done
          </Button>
        </div>
      </div>
    </dialog>
  );
};

export default SettingsModal; 