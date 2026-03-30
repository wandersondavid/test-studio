import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', tone = 'default', busy = false, children, onCancel, onConfirm, }) {
    useEffect(() => {
        if (!open)
            return;
        function handleKeyDown(event) {
            if (event.key === 'Escape' && !busy) {
                onCancel();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [busy, onCancel, open]);
    if (!open || typeof document === 'undefined') {
        return null;
    }
    return createPortal(<div className="confirm-dialog-backdrop" role="presentation">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="confirm-dialog-kicker">{tone === 'danger' ? 'Atenção' : 'Confirmação'}</div>
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-description">{description}</p>
        {children ? <div className="confirm-dialog-body">{children}</div> : null}
        <div className="confirm-dialog-actions">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={tone === 'danger' ? 'destructive' : 'default'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Processando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>, document.body);
}
//# sourceMappingURL=ConfirmDialog.js.map