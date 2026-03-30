import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { formatDateTimeBR, shortId } from '../lib/format';
export function DashboardPage() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get('/test-runs')
            .then(res => setRuns(res.data.slice(0, 5)))
            .finally(() => setLoading(false));
    }, []);
    const passedRuns = runs.filter(run => run.status === 'passed').length;
    const failedRuns = runs.filter(run => run.status === 'failed' || run.status === 'error').length;
    const activeRuns = runs.filter(run => run.status === 'running' || run.status === 'pending').length;
    return (<div data-testid="dashboard-page" className="page-shell">
      <PageHeader eyebrow="Painel operacional" title="Visão geral do Test Studio" description="Acompanhe recorder, execução e histórico de runs em uma interface mais clara para o time inteiro." actions={<>
            <Button asChild>
              <Link to="/run">Executar cenário</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/suites">Abrir suítes</Link>
            </Button>
          </>} meta={<>
            <Badge variant="secondary">Recorder Playwright</Badge>
            <Badge variant="outline">Builder visual</Badge>
          </>}/>

      <section className="summary-grid">
        {[
            { label: 'Execuções recentes', value: runs.length, note: 'Últimos runs visíveis no dashboard' },
            { label: 'Sucesso', value: passedRuns, note: 'Runs finalizados com status passed' },
            { label: 'Falhas', value: failedRuns, note: 'Runs com falha ou erro' },
            { label: 'Ativos', value: activeRuns, note: 'Execuções pendentes ou em andamento' },
        ].map(item => (<div key={item.label} className="stat-card">
            <span className="stat-label">{item.label}</span>
            <span className="stat-value">{item.value}</span>
            <span className="stat-note">{item.note}</span>
          </div>))}
      </section>

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Últimas execuções</CardTitle>
          <CardDescription>Use essa área para acompanhar rapidamente o que acabou de rodar.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (<div className="loading-state" data-testid="loading">Carregando...</div>) : runs.length === 0 ? (<div className="empty-state" data-testid="empty">
              <span>Nenhuma execução ainda.</span>
              <Button asChild>
                <Link to="/run">Executar agora</Link>
              </Button>
            </div>) : (<div className="overflow-x-auto rounded-2xl border border-border/60 bg-background/40">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map(run => (<tr key={run._id} data-testid={`run-row-${run._id}`}>
                      <td className="table-id">{shortId(run._id)}</td>
                      <td>
                        <StatusBadge status={run.status}/>
                      </td>
                      <td>{formatDateTimeBR(run.createdAt)}</td>
                      <td>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/history/${run._id}`}>Ver detalhes</Link>
                        </Button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>)}
        </CardContent>
      </Card>
    </div>);
}
//# sourceMappingURL=DashboardPage.js.map