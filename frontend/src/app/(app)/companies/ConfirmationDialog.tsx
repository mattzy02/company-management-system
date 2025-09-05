'use client';

import * as React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

// confirmation dialog props
interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

// confirmation dialog
export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {/* title */}
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      {/* message based on the action */}
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      {/* cancel and confirm buttons */}
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
} 