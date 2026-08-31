import { useEffect, useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SubscribersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscribersModal({ isOpen, onClose }: SubscribersModalProps) {
  const [passwordInput, setPasswordInput] = useState("");
  // Only held in memory for as long as the panel stays open. Never
  // persisted (no cookie, no localStorage), so closing this panel and
  // reopening it always requires the password again.
  const [unlockedPassword, setUnlockedPassword] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const subscribersQuery = trpc.subscribers.list.useQuery(
    { password: unlockedPassword ?? "" },
    {
      enabled: isOpen && unlockedPassword !== null,
      retry: false,
    }
  );

  useEffect(() => {
    if (subscribersQuery.isError && unlockedPassword !== null) {
      toast.error("Incorrect password");
      setUnlockedPassword(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribersQuery.isError]);

  const exportCsvQuery = trpc.subscribers.exportCsv.useQuery(
    { password: unlockedPassword ?? "" },
    { enabled: false }
  );
  const clearAllMutation = trpc.subscribers.clearAll.useMutation();

  if (!isOpen) return null;

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUnlockedPassword(passwordInput);
    setPasswordInput("");
  };

  const handleExport = async () => {
    try {
      const result = await exportCsvQuery.refetch();
      if (!result.data) return;
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.data.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Subscriber list exported");
    } catch {
      toast.error("Could not export the subscriber list");
    }
  };

  const handleClear = async () => {
    if (!unlockedPassword) return;
    try {
      await clearAllMutation.mutateAsync({ password: unlockedPassword });
      setShowConfirm(false);
      await subscribersQuery.refetch();
      toast.success("Subscriber list cleared");
    } catch {
      toast.error("Could not clear the subscriber list");
    }
  };

  // Wipes the password from memory every time the panel closes, so it must
  // be re-entered the next time it's opened.
  const closeWithReset = () => {
    setShowConfirm(false);
    setPasswordInput("");
    setUnlockedPassword(null);
    onClose();
  };

  const isUnlocked = unlockedPassword !== null && !subscribersQuery.isError;

  return (
    <div className="admin-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-title">
      <div className="admin-card">
        <div className="admin-header">
          <div>
            <p className="admin-kicker">Owner access</p>
            <h2 className="admin-title" id="admin-title">Subscriber list</h2>
          </div>
          <button className="admin-close" type="button" onClick={closeWithReset} aria-label="Close subscriber list">×</button>
        </div>

        {!isUnlocked ? (
          <>
            <p className="access-denied-copy">Enter the owner password to view the subscriber list. You'll need to enter it again each time you open this panel.</p>
            <form onSubmit={handlePasswordSubmit} className="admin-actions" style={{ flexDirection: "column", alignItems: "stretch", gap: "0.5rem" }}>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Owner password"
                autoFocus
                className="admin-password-input"
              />
              <button className="admin-button primary" type="submit" disabled={subscribersQuery.isFetching || !passwordInput}>
                {subscribersQuery.isFetching ? "Checking…" : "Unlock"}
              </button>
            </form>
            <button className="admin-button" type="button" onClick={closeWithReset}>Close</button>
          </>
        ) : (
          <>
            <p className="admin-caption">Addresses collected here are for your own manual newsletter workflow.</p>
            <div className="admin-list" aria-live="polite">
              {subscribersQuery.isLoading ? (
                <p className="admin-empty">Loading subscribers…</p>
              ) : subscribersQuery.data && subscribersQuery.data.length > 0 ? (
                subscribersQuery.data.map((subscriber, index) => (
                  <div className="admin-subscriber" key={subscriber.id}>{index + 1}. {subscriber.email}</div>
                ))
              ) : (
                <p className="admin-empty">No subscribers yet.</p>
              )}
            </div>

            {showConfirm && (
              <div className="admin-confirm">
                <p>Delete every saved subscriber? This cannot be undone.</p>
                <div className="admin-actions">
                  <button className="admin-button" type="button" onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button className="admin-button danger" type="button" onClick={handleClear} disabled={clearAllMutation.isPending}>
                    {clearAllMutation.isPending ? "Clearing…" : "Confirm clear"}
                  </button>
                </div>
              </div>
            )}

            <div className="admin-actions">
              <button className="admin-button" type="button" onClick={handleExport} disabled={!subscribersQuery.data?.length || exportCsvQuery.isFetching}>
                {exportCsvQuery.isFetching ? "Preparing…" : "Export CSV"}
              </button>
              <button className="admin-button danger" type="button" onClick={() => setShowConfirm(true)} disabled={!subscribersQuery.data?.length || showConfirm}>
                Clear all
              </button>
            </div>
            <button className="admin-button primary" type="button" onClick={closeWithReset}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}
