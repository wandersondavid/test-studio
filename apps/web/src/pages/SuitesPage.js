import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
export function SuitesPage() {
    const [suites, setSuites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    function load() {
        api.get('/test-suites')
            .then(res => setSuites(res.data))
            .finally(() => setLoading(false));
    }
    useEffect(() => { load(); }, []);
    async function handleCreate(e) {
        e.preventDefault();
        await api.post('/test-suites', { name });
        setName('');
        setShowForm(false);
        load();
    }
    if (loading)
        return <div className="loading-state" data-testid="loading">Carregando...</div>;
    return (<div data-testid="suites-page" className="page-shell">
      <PageHeader eyebrow="Organização" title="Suítes" description="Agrupe cenários por fluxo de negócio e mantenha o catálogo de testes mais fácil de navegar." actions={<button className="button-primary" data-testid="btn-new-suite" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Fechar formulário' : '+ Nova suíte'}
          </button>} meta={<>
            <span className="meta-chip">{suites.length} suítes</span>
            <span className="meta-chip accent">Base para o builder</span>
          </>}/>

      {showForm && (<form data-testid="suite-form" onSubmit={handleCreate} className="surface inline-form">
          <div className="field-grid">
            <label className="field">
              <span className="field-label">Nome da suíte</span>
              <input data-testid="input-suite-name" placeholder="Ex: Fluxo de autenticação" value={name} onChange={e => setName(e.target.value)} required/>
            </label>
          </div>
          <div className="form-actions">
            <button className="button-primary" data-testid="btn-save-suite" type="submit">Salvar</button>
          </div>
        </form>)}

      {suites.length === 0 ? (<div className="empty-state" data-testid="empty">Nenhuma suíte criada.</div>) : (<ul className="list-stack" style={{ padding: 0 }}>
          {suites.map(suite => (<li key={suite._id} data-testid={`suite-item-${suite._id}`} className="list-card">
              <div>
                <strong>{suite.name}</strong>
                <div className="list-card-meta">Abra a suíte para criar cenários e organizar steps.</div>
              </div>
              <Link to={`/suites/${suite._id}`} className="button-link button-secondary">Abrir</Link>
            </li>))}
        </ul>)}
    </div>);
}
//# sourceMappingURL=SuitesPage.js.map