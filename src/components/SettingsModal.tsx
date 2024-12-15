import * as React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Typography,
  Slider,
  Box,
  Select,
  MenuItem
} from '@mui/material';
import { Button as MuiButton } from './Button';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: {
    sound: boolean;
    difficulty: number;
    timer: boolean;
    timeLimit: number;
  };
  onSettingsChange: (settings: any) => void;
}

const SettingsModal = ({ open, onClose, settings, onSettingsChange }: SettingsModalProps) => {
  const [tempSettings, setTempSettings] = React.useState(settings);

  React.useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(tempSettings);
    onClose();
  };

  const handleCancel = () => {
    setTempSettings(settings);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ minWidth: 300, pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={tempSettings.sound} 
                  onChange={() => setTempSettings({ ...tempSettings, sound: !tempSettings.sound })}
                />
              }
              label="Sound Effects"
            />
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Difficulty</Typography>
            <Slider
              value={tempSettings.difficulty}
              onChange={(_e, val) => setTempSettings({ ...tempSettings, difficulty: val as number })}
              step={1}
              marks
              min={1}
              max={3}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => value === 1 ? 'Easy' : value === 2 ? 'Medium' : 'Hard'}
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={tempSettings.timer} 
                  onChange={() => setTempSettings({ ...tempSettings, timer: !tempSettings.timer })}
                />
              }
              label="Timer Mode"
            />
          </FormControl>

          {tempSettings.timer && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography gutterBottom>Time Limit (seconds)</Typography>
              <Select
                value={tempSettings.timeLimit}
                onChange={(e) => setTempSettings({ ...tempSettings, timeLimit: e.target.value as number })}
              >
                <MenuItem value={30}>30 seconds</MenuItem>
                <MenuItem value={60}>1 minute</MenuItem>
                <MenuItem value={120}>2 minutes</MenuItem>
                <MenuItem value={180}>3 minutes</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <MuiButton onClick={handleCancel}>Cancel</MuiButton>
        <MuiButton onClick={handleSave}>Save</MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal; 