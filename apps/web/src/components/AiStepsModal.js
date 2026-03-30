import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { generateSteps } from '../services/aiSteps';
export function AiStepsModal({ open, onClose, onStepsGenerated }) {
    const [description, setDescription] = useState('');
    const [baseURL, setBaseURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedSteps, setGeneratedSteps] = useState(null);
    useEffect(() => {
        if (!open)
            return;
        function onKey(e) {
            if (e.key === 'Escape')
                onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);
    useEffect(() => {
        if (!open) {
            setDescription('');
            setBaseURL('');
            setError(null);
            setGeneratedSteps(null);
            setLoading(false);
        }
    }, [open]);
    async function handleGenerate() {
        setError(null);
        setGeneratedSteps(null);
        setLoading(true);
        try {
            const steps = await generateSteps(description.trim(), baseURL.trim() || undefined);
            setGeneratedSteps(steps);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar steps.');
        }
        finally {
            setLoading(false);
        }
    }
    function handleAdd() {
        if (generatedSteps && generatedSteps.length > 0) {
            onStepsGenerated(generatedSteps);
            onClose();
        }
    }
    if (!open || typeof document === 'undefined')
        return null;
    return createPortal(<div className="confirm-dialog-backdrop" role="presentation">
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title" data-testid="ai-steps-modal" style={{ maxWidth: 560, width: '100%' }}>
        <div className="confirm-dialog-kicker">IA</div>
        <h3 id="ai-modal-title" className="confirm-dialog-title">
          <Sparkles size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}/>
          Gerar steps com IA
        </h3>
        <p className="confirm-dialog-description">
          Descreva o cenário de teste em linguagem natural e a IA irá gerar os steps automaticamente.
        </p>

        <div className="confirm-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label htmlFor="ai-description" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              Descrição do cenário <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea id="ai-description" data-testid="ai-description-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o cenário de teste em linguagem natural, ex: Acessar a página de login, preencher email user@example.com e senha SecurePass123!, clicar em Entrar e verificar que o dashboard aparece" rows={4} disabled={loading} style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 13,
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
        }}/>
          </div>

          <div>
            <label htmlFor="ai-base-url" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
              Base URL <span style={{ color: '#6b7280', fontWeight: 400 }}>(opcional)</span>
            </label>
            <input id="ai-base-url" data-testid="ai-base-url-input" type="text" value={baseURL} onChange={e => setBaseURL(e.target.value)} placeholder="ex: https://meuapp.com" disabled={loading} style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 13,
            fontFamily: 'inherit',
            boxSizing: 'border-box',
        }}/>
          </div>

          {error && (<p data-testid="ai-error" style={{ fontSize: 13, color: '#dc2626', margin: 0, padding: '8px 10px', background: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca' }}>
              {error}
            </p>)}

          {generatedSteps && generatedSteps.length > 0 && (<div data-testid="ai-steps-preview">
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#16a34a' }}>
                ✓ {generatedSteps.length} step{generatedSteps.length !== 1 ? 's' : ''} gerado{generatedSteps.length !== 1 ? 's' : ''}
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                maxHeight: 220,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}>
                {generatedSteps.map((step, idx) => (<li key={step.id} data-testid={`ai-step-preview-${idx}`} style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      <span style={{ fontFamily: 'monospace', background: '#e0e7ff', borderRadius: 3, padding: '1px 5px', color: '#4338ca' }}>
                        {step.type}
                      </span>
                      {step.description ? ` — ${step.description}` : ''}
                    </span>
                    {step.selector && (<span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 11 }}>
                        {step.selector}
                      </span>)}
                    {step.value && (<span style={{ color: '#64748b', fontSize: 11 }}>
                        valor: <em>{step.value}</em>
                      </span>)}
                  </li>))}
              </ul>
            </div>)}
        </div>

        <div className="confirm-dialog-actions">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} data-testid="ai-modal-cancel">
            Cancelar
          </Button>
          {generatedSteps && generatedSteps.length > 0 ? (<Button type="button" onClick={handleAdd} data-testid="ai-modal-add-steps">
              Adicionar ao Caso
            </Button>) : (<Button type="button" onClick={handleGenerate} disabled={loading || description.trim().length < 10} data-testid="ai-modal-generate">
              {loading ? (<>
                  <span style={{
                    display: 'inline-block',
                    width: 14,
                    height: 14,
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    marginRight: 6,
                    verticalAlign: 'middle',
                }}/>
                  Gerando...
                </>) : (<>
                  <Sparkles size={14} style={{ marginRight: 6 }}/>
                  Gerar Steps
                </>)}
            </Button>)}
        </div>
      </div>
    </div>, document.body);
}
//# sourceMappingURL=AiStepsModal.js.map