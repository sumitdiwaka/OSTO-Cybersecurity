"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function SessionExpiredModal() {
  const { sessionExpired, acknowledgeSessionExpired } = useAuth();

  if (!sessionExpired) return null;

  return (
    <Modal title="Session expired" onClose={acknowledgeSessionExpired}>
      <p className="text-sm text-ink-muted">
        For your security, you&apos;ve been signed out due to inactivity. Sign in again to keep working —
        nothing you had open has been lost.
      </p>
      <div className="mt-4">
        <Button onClick={acknowledgeSessionExpired} className="w-full">
          Sign in again
        </Button>
      </div>
    </Modal>
  );
}
