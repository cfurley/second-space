import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

type FloatingMenuProps = {
  onAddAdvertisement?: () => void;
};

export function FloatingMenu({ onAddAdvertisement }: FloatingMenuProps) {
  const [open, setOpen] = useState(false);
  const [showSpaceDialog, setShowSpaceDialog] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  
  // Form states for Space
  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [spaceImage, setSpaceImage] = useState<File | null>(null);
  
  // Form states for Ad
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adImage, setAdImage] = useState<File | null>(null);

  const handleSpaceSubmit = () => {
    // Mock data submission
    console.log("Creating new space:", {
      name: spaceName,
      description: spaceDescription,
      image: spaceImage
    });
    setShowSpaceDialog(false);
    // Reset form
    setSpaceName("");
    setSpaceDescription("");
    setSpaceImage(null);
  };

  const handleAdSubmit = () => {
    // Mock data submission
    console.log("Creating new ad:", {
      title: adTitle,
      description: adDescription,
      image: adImage
    });
    setShowAdDialog(false);
    // Reset form
    setAdTitle("");
    setAdDescription("");
    setAdImage(null);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
        zIndex: 99999
      }}
    >
      {open && (
        <div
          style={{
            backgroundColor: '#2C2C2C',
            borderRadius: '8px',
            padding: '8px',
            marginBottom: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            width: '180px'
          }}
        >
          <button
            onClick={() => {
              setShowSpaceDialog(true);
              setOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3C3C3C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '16px' }}>🎯</span> Create Space
          </button>
          <button
            onClick={() => {
              setShowAdDialog(true);
              setOpen(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3C3C3C'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ fontSize: '16px' }}>�️</span> Create Ad
          </button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '12px' }}>
        <button
        onClick={() => alert('New Note')}
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}
      >
        ✏️
      </button>

      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}
      >
        +
      </button>

      <button
        onClick={() => alert('Search')}
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#2C2C2C',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}
      >
        🔍
      </button>
    </div>

      {/* Create Space Dialog */}
      <Dialog open={showSpaceDialog} onOpenChange={setShowSpaceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Space</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spaceName" className="text-right">Name</Label>
              <Input
                id="spaceName"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="col-span-3"
                placeholder="Enter space name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spaceDescription" className="text-right">Description</Label>
              <Input
                id="spaceDescription"
                value={spaceDescription}
                onChange={(e) => setSpaceDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter space description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spaceImage" className="text-right">Image</Label>
              <Input
                id="spaceImage"
                type="file"
                onChange={(e) => setSpaceImage(e.target.files?.[0] || null)}
                className="col-span-3"
                accept="image/*"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSpaceSubmit}>Create Space</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Ad Dialog */}
      <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Ad</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adTitle" className="text-right">Title</Label>
              <Input
                id="adTitle"
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter ad title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adDescription" className="text-right">Description</Label>
              <Input
                id="adDescription"
                value={adDescription}
                onChange={(e) => setAdDescription(e.target.value)}
                className="col-span-3"
                placeholder="Enter ad description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adImage" className="text-right">Image</Label>
              <Input
                id="adImage"
                type="file"
                onChange={(e) => setAdImage(e.target.files?.[0] || null)}
                className="col-span-3"
                accept="image/*"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdSubmit}>Create Ad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}