import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
export function SuiteDetailPage() {
    const { id } = useParams();
    const [suite, setSuite] = useState(null);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState(null);
    const [selectedCaseIds, setSelectedCaseIds] = useState([]);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [deleting, setDeleting] = useState(false);
    function load() {
        setError(null);
        Promise.all([
            api.get(`/test-suites/${id}`),
            api.get(`/test-cases?suiteId=${id}`),
        ]).then(([s, c]) => {
            setSuite(s.data);
            setCases(c.data);
        }).catch(err => {
            setError(err instanceof Error ? err.message : 'Não foi possível carregar a suíte.');
        }).finally(() => setLoading(false));
    }
    useEffect(() => { load(); }, [id]);
    useEffect(() => {
        setSelectedCaseIds(current => current.filter(caseId => cases.some(item => item._id === caseId)));
    }, [cases]);
    async function handleCreateCase(e) {
        e.preventDefault();
        try {
            setError(null);
            await api.post('/test-cases', { suiteId: id, name: newName });
            setNewName('');
            load();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Não foi possível criar o cenário.');
        }
    }
    const allSelected = cases.length > 0 && selectedCaseIds.length === cases.length;
    const deleteTargets = useMemo(() => cases.filter(item => deleteTargetIds.includes(item._id)), [cases, deleteTargetIds]);
    function toggleCaseSelection(caseId) {
        setSelectedCaseIds(current => (current.includes(caseId)
            ? current.filter(item => item !== caseId)
            : [...current, caseId]));
    }
    function toggleSelectAll() {
        setSelectedCaseIds(current => (current.length === cases.length ? [] : cases.map(item => item._id)));
    }
    function openDeleteDialog(ids) {
        setDeleteTargetIds(ids);
    }
    async function handleDeleteCases() {
        if (deleteTargetIds.length === 0)
            return;
        setDeleting(true);
        setError(null);
        try {
            if (deleteTargetIds.length === 1) {
                await api.delete(`/test-cases/${deleteTargetIds[0]}`);
            }
            else {
                await api.post('/test-cases/bulk-delete', { ids: deleteTargetIds });
            }
            setSelectedCaseIds(current => current.filter(caseId => !deleteTargetIds.includes(caseId)));
            setDeleteTargetIds([]);
            load();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Não foi possível excluir os cenários selecionados.');
        }
        finally {
            setDeleting(false);
        }
    }
    if (loading)
        return <div className="loading-state" data-testid="loading">Carregando...</div>;
    if (!suite)
        return <div className="empty-state" data-testid="not-found">Suíte não encontrada</div>;
    return (<div data-testid="suite-detail-page" className="page-shell">
      <PageHeader eyebrow="Suíte ativa" title={suite.name} description="Crie cenários reutilizáveis e entre no builder para gravar ou ajustar os steps." actions={selectedCaseIds.length > 0 ? (<>
              <Button type="button" variant="outline" onClick={toggleSelectAll}>
                {allSelected ? 'Limpar seleção' : 'Selecionar todos'}
              </Button>
              <Button type="button" variant="destructive" onClick={() => openDeleteDialog(selectedCaseIds)}>
                Excluir selecionados
              </Button>
            </>) : undefined} meta={<>
            <span className="meta-chip">{cases.length} cenários</span>
            <span className="meta-chip accent">Organização por fluxo</span>
          </>}/>

      {error && <div className="alert alert-error">{error}</div>}

      <form data-testid="case-form" onSubmit={handleCreateCase} className="surface inline-form">
        <div className="section-heading">
          <div>
            <h2>Novo cenário</h2>
            <p>Adicione um novo cenário dentro desta suíte antes de abrir o builder.</p>
          </div>
        </div>
        <div className="field-grid">
          <label className="field">
            <span className="field-label">Nome do cenário</span>
            <input data-testid="input-case-name" placeholder="Ex: Login com sucesso" value={newName} onChange={e => setNewName(e.target.value)} required/>
          </label>
        </div>
        <div className="form-actions">
          <button className="button-primary" data-testid="btn-add-case" type="submit">+ Adicionar cenário</button>
        </div>
      </form>

      {cases.length === 0 ? (<div className="empty-state" data-testid="empty">Nenhum cenário nesta suíte.</div>) : (<>
          <section className="surface surface-muted">
            <div className="suite-case-toolbar">
              <label className="suite-case-select-all">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}/>
                <span>Selecionar todos os cenários</span>
              </label>
              <div className="toolbar-inline">
                <Badge variant={selectedCaseIds.length > 0 ? 'warning' : 'outline'}>
                  {selectedCaseIds.length} selecionado(s)
                </Badge>
                <Button type="button" variant="destructive" disabled={selectedCaseIds.length === 0} onClick={() => openDeleteDialog(selectedCaseIds)}>
                  Excluir em lote
                </Button>
              </div>
            </div>
          </section>

          <ul className="list-stack suite-case-list" style={{ padding: 0 }}>
          {cases.map(c => (<li key={c._id} data-testid={`case-item-${c._id}`} className={`list-card suite-case-card ${selectedCaseIds.includes(c._id) ? 'suite-case-card-selected' : ''}`}>
              <div>
                <label className="suite-case-checkbox">
                  <input type="checkbox" checked={selectedCaseIds.includes(c._id)} onChange={() => toggleCaseSelection(c._id)}/>
                  <span>Selecionar cenário</span>
                </label>
                <strong>{c.name}</strong>
                <div className="list-card-meta">{c.steps.length} steps gravados neste cenário</div>
              </div>
              <div className="toolbar-inline">
                <Button asChild variant="outline">
                  <Link to={`/cases/${c._id}`}>Abrir builder</Link>
                </Button>
                <Button type="button" variant="destructive" onClick={() => openDeleteDialog([c._id])}>
                  Excluir
                </Button>
              </div>
            </li>))}
          </ul>
        </>)}

      <ConfirmDialog open={deleteTargetIds.length > 0} tone="danger" busy={deleting} title={deleteTargetIds.length > 1 ? 'Excluir cenários selecionados?' : 'Excluir cenário?'} description={deleteTargetIds.length > 1
            ? 'Essa ação remove os cenários selecionados da suíte e limpa referências de cenário base onde for necessário.'
            : 'Essa ação remove o cenário da suíte e limpa referências de cenário base onde for necessário.'} confirmLabel={deleteTargetIds.length > 1 ? 'Excluir cenários' : 'Excluir cenário'} onCancel={() => {
            if (deleting)
                return;
            setDeleteTargetIds([]);
        }} onConfirm={handleDeleteCases}>
        <div className="confirm-dialog-stack">
          <Badge variant="danger">{deleteTargetIds.length} item(ns)</Badge>
          <div className="confirm-dialog-list">
            {deleteTargets.slice(0, 5).map(item => (<div key={item._id} className="confirm-dialog-list-item">
                <strong>{item.name}</strong>
                <span>{item.steps.length} steps gravados</span>
              </div>))}
            {deleteTargets.length > 5 && (<div className="confirm-dialog-list-item">
                <strong>+ {deleteTargets.length - 5} cenário(s)</strong>
                <span>Itens adicionais também serão removidos.</span>
              </div>)}
          </div>
        </div>
      </ConfirmDialog>
    </div>);
}
//# sourceMappingURL=SuiteDetailPage.js.map