import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: any;
  onSave?: (data: any) => void;
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({ isOpen, onClose, schedule, onSave }) => {
  // Simple form state for demonstration
  const [title, setTitle] = React.useState(schedule?.title || '');

  React.useEffect(() => {
    setTitle(schedule?.title || '');
  }, [schedule]);

  const handleSave = () => {
    if (onSave) onSave({ ...schedule, title });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block text-sm font-medium">Title</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter schedule title"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{schedule ? 'Save' : 'Add'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
